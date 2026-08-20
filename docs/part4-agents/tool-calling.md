# Tool calling in depth

[The agent loop](agent-loop.md) established who does what. The client owns the loop, the model emits intentions, and servers run single calls.

This chapter zooms into the loop's most consequential arrow: the moment a tool gets picked.

By the end you will be able to explain where selection actually happens, write descriptions that select well, judge how many tools is too many, and design results and errors that keep a loop moving.

## Selection is text comprehension

**Tool selection** is the step where the model, given the conversation so far plus the serialized list of tool definitions, emits a structured block naming one tool and its arguments.

Nothing else takes part. No registry lookup. No routing table. No inspection of your server's code.

Selection is [next-token prediction](../part1-fundamentals/what-llms-do.md) over text. And the text it runs on is your tool names, descriptions, and schemas, rendered into the [context window](../part1-fundamentals/context-windows.md) with the rest of the conversation.

[The wire protocol chapter](../part3-mcp/wire-protocol.md) put it bluntly. The `tools/list` response is the only knowledge of your API the model will ever have.

So when the model ["decides"](../part1-fundamentals/what-llms-do.md) to call a search tool, the mechanical fact underneath is that your description text made that continuation the most probable one.

The practical thesis of this chapter follows. Selection quality is a writing problem. You tune it by editing prose, not hyperparameters.

## The lifecycle of one call

Here is one tool call end to end, including the validation step many clients run before any bytes reach your server.

```mermaid
sequenceDiagram
    participant S as MCP server
    participant C as Client (owns the loop)
    participant M as Model API
    Note over C,S: once per session
    C->>S: tools/list
    S-->>C: definitions: name, description, inputSchema
    C->>C: translate definitions into the model API's tool format
    Note over C,M: every loop iteration
    C->>M: conversation + tool definitions
    M-->>C: tool_use block: tool name + JSON arguments
    C->>C: validate arguments against inputSchema
    alt arguments invalid
        C->>M: validation error appended as text
        M-->>C: corrected tool_use block
    end
    C->>S: tools/call { name, arguments }
    S-->>C: result: content blocks (isError on failure)
    C->>M: result appended to the conversation
    M-->>C: next tokens: an answer, or another call
```

Two details reward attention.

First, the translation step. The definitions cross two different protocols: MCP between client and server, and the model API between client and model. [The wire protocol chapter](../part3-mcp/wire-protocol.md) covers that boundary.

Second, client-side schema validation. It exists because the arguments are sampled tokens, not compiler output. They can be malformed JSON, or miss a required field.

Checking them against the schema catches that without a server round trip, and lets the model emit a corrected call. The server still validates on its own side. That is defense in depth, not redundancy.

## Writing descriptions that select well

A description serves the model twice. At selection time: "is this the tool for this step, and with what arguments?" And at result time: "what did this output represent?"

Four craft rules consistently pay off.

- **Lead with a verb.** "Search support tickets by free-text query" beats "This tool provides ticket search functionality."
- **Say when to use it, and when not.** The when-not clause is the fence between neighboring tools. Without it, two plausible tools produce a near-tie, and [sampling](../part1-fundamentals/what-llms-do.md) resolves it arbitrarily.
- **Specify argument semantics.** Units, formats, defaults, and one concrete example value prevent most malformed calls.
- **State the result shape.** "Returns the 10 best matches with id, title, and status" sets up the follow-up step. Silence leaves it to guesswork.

The difference in practice:

```json
{ "name": "search", "description": "Searches the data." }
```

```json
{
  "name": "search_tickets",
  "description": "Search support tickets by free-text query. Use when the
    user asks about a customer issue or bug report. Do NOT use for billing
    records (use search_invoices). Args: query - plain English, not a
    ticket id (use get_ticket for ids); status - optional, 'open' or
    'closed', default both. Returns the 10 best matches with ticket id,
    title, and status."
}
```

The first version forces the model to guess from a name. The second answers every question selection asks.

This is the rule [Server anatomy](../part3-mcp/writing-a-server.md) introduced — tool descriptions are model-facing UX — applied with a checklist.

One economic note. Definitions are input [tokens](../part1-fundamentals/tokens.md), re-sent on every loop round, and [Cost and efficiency](cost-efficiency.md) does that arithmetic. A sentence that prevents one wrong call pays for itself. Padding never does.

## How many tools is too many

Every definition you register takes up context window space on every round. And every added tool is another candidate for a near-miss match.

Selection does not fail suddenly at some threshold. It erodes.

```mermaid
xychart-beta
    title "Illustrative - selection accuracy vs tools offered (not a measurement)"
    x-axis "Tools offered to the model" [5, 10, 20, 40, 80, 128]
    y-axis "Correct selections per 100 tasks" 0 --> 100
    line [97, 95, 90, 79, 64, 52]
```

The curve makes an argument rather than reporting a benchmark. But two x-positions are real platform facts. Around 20 is where vendor guidance starts advising caution. And 128 is a hard cap on one major API.

!!! warning "Evolving — verified 2026-07-18"
    As of 2026-07-18, the 128-tool limit is **OpenAI's** tools-array cap. It is a platform limit, not part of the MCP spec, and not an Anthropic limit. OpenAI's guidance recommends keeping fewer than about 20 tools active for reliable selection. Anthropic imposes no hard tool-count cap, and offers a Tool Search Tool that lets tool definitions be discovered on demand instead of loaded up front. Anthropic's engineering guidance names the underlying erosion "context rot": quality degrades as the window fills with marginally relevant material. This changes quickly; check the [OpenAI function-calling docs](https://platform.openai.com/docs/guides/function-calling) and [Anthropic's tool-use docs](https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview) for current values.

The portable lesson: platform caps are the outer wall, not the target. Selection degrades long before any limit rejects your request.

## Designing results and errors

The result of a call re-enters the context window, and is read as text on the next round. So result design is context engineering, one call at a time.

MCP results are [content blocks](../part3-mcp/primitives.md). The protocol also allows a structured JSON rendering of the same result, for the application to parse.

The judgment call, introduced with [the primitives](../part3-mcp/primitives.md), is to treat those as one result in alternative encodings. Emitting a text rendering *plus* a large JSON payload of the same data can double the token bill for no added information.

Errors deserve equal design effort, because in a loop an error is not an endpoint. It is the input to the next step.

An **actionable error** is written so the model's next sampled step can plausibly fix the problem. It names what failed, why, and what to do instead.

"Path `src/auth.cs` not found; paths are relative to the repository root; call `list_files` to see valid paths" lets a loop self-correct in one round.

A 40-line stack trace burns the same tokens and affords nothing. The model cannot re-run your debugger.

And recall [the wire protocol's](../part3-mcp/wire-protocol.md) distinction. Protocol errors mean the machinery broke. Tool errors, flagged `isError: true`, are results delivered to the model — so their text is model-facing UX too.

## Curate the toolbelt

A small set of sharp, non-overlapping tools beats a large set of vague ones at any budget. Curation is the ongoing practice that keeps it that way.

- **Merge overlap.** Two tools whose descriptions could both match the same request create ties. One tool with a mode argument often selects better than two near-twins.
- **Name by verb and object.** `search_tickets`, `get_ticket`, `close_ticket`. The name alone should narrow the choice.
- **Delete what never fires.** A tool that is never selected still costs window space on every single round.
- **Watch real selections.** Client logs show which tool was called with which arguments. Wrong-tool patterns point at a description that needs a sharper when-not clause.

## In practice: Sankshep

Sankshep's toolbelt is a worked example of curation. Exactly 8 tools: `get_context`, `search_code`, `index_repo`, `summarize_repo`, `remember`, `recall`, `export_decisions`, `token_report`.

That sits comfortably below every threshold above, and each name is a verb-object pair covering one job.

One of them, `token_report`, exists purely for observability. Its output reports what the other tools saved, so the toolbelt carries its own measurement.

Its error design follows ADR-0016. File paths anchor to the repository root, and a request naming paths that match nothing fails loudly with `isError`, rather than returning a quietly empty result.

That is the actionable-error rule, chosen over the polite failure that would send a loop three rounds in the wrong direction.

Its result design went through the content-versus-structured debate as a real ADR chain, 0015 through 0018. It landed on `get_context` returning one plain-text block with no output schema.

Two of that chain's conclusions restate this chapter in Sankshep's own words. Measure what is *delivered and consumed*, not what is emitted. And ship "one result in two encodings, not two payloads".

## Checkpoints

**1.** Where does tool selection actually happen — in the server, the client, or the model — and what information is it based on?

??? success "Answer"
    In the model.

    Given the conversation plus the serialized tool definitions, it emits a structured block naming a tool. That is next-token prediction over text.

    The client fetched the definitions and the server authored them. But at selection time, the only inputs are the definition text in the context window.

**2.** An agent keeps calling `search_tickets` when it should call `search_invoices`. What is the first fix to try, before writing any code?

??? success "Answer"
    Edit the descriptions.

    Selection is a writing problem. Add a when-not clause to each tool — "Do NOT use for billing records, use search_invoices" — so the descriptions partition the task space instead of overlapping.

    No code change helps while the text the model reads makes both tools equally probable.

**3.** Why do clients validate tool arguments against the schema before forwarding a call, when the server validates anyway?

??? success "Answer"
    Because arguments are sampled tokens, not compiler output. They can be malformed JSON, or miss a required field.

    Client-side validation catches that without spending a server round trip. It feeds the error text straight back, and lets the model emit a corrected call in the same round.

    Server-side validation stays as defense in depth.

**4.** Your tool returns a stack trace when a file path is wrong. Rewrite the failure behavior using this chapter's rules, and say why it matters inside a loop.

??? success "Answer"
    Return a tool error, `isError: true`, whose text is actionable. What failed: "path not found". Why: "paths are relative to the repository root". And the next move: "list the directory first".

    In a loop, the error text is input to the next model step. An actionable message lets the loop self-correct in one round. A stack trace costs the same tokens and affords no valid next action.

**5.** A vendor ships an MCP server exposing 130 tools. One team's agent setup rejects it outright. Another's accepts it but selects tools poorly. Explain both outcomes.

??? success "Answer"
    The hard rejection is a platform cap. As of 2026-07-18, OpenAI's API limits the tools array to 128 entries. That is an OpenAI limit, not an MCP or Anthropic one, so an Anthropic-backed setup accepts all 130.

    But acceptance is not health. Selection erodes well before any cap, since every definition consumes window space and adds near-miss candidates.

    Both teams would do better with a curated subset, or with on-demand discovery.

## Try it

Measure the writing-problem claim directly.

1. Pick a working MCP setup. The reference server you installed in [Connecting servers to IDEs](../part3-mcp/ide-integration.md) works. So does the toy server from [Build your own](../part6-reference/build-your-own.md).
2. Choose one tool and write down five tasks that should trigger it. Phrase them naturally, and **without naming the tool**. "What's in the config directory?", not "use list_directory".
3. **Sabotage.** Replace the tool's description with a vague one-liner: "Does file stuff." Run the five tasks in fresh conversations and record which tool gets called. Score correct selections out of 5.
4. **Repair.** Rewrite the description with the checklist: verb first, when to use, when not to, argument semantics, result shape. Run the same five tasks again and re-score.
5. **Compare the two columns.** Then read your other tools' descriptions, and note which are closer to the sabotaged version than the repaired one.

    Those are your cheapest reliability wins.
