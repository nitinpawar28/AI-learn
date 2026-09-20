# Writing an MCP server

[The wire protocol](wire-protocol.md) spelled out the messages an MCP server must answer, one JSON line at a time. This chapter is about the software that answers them.

By the end you will be able to:

- name the four layers every MCP server shares, and identify the two you actually write,
- explain why a tool's description is user-interface text aimed at a model,
- structure a server so protocol churn can never reach your domain logic.

## The anatomy every server shares

Strip away the language and the framework, and every MCP server is the same four layers. That holds for a 100-line notes demo and for a production code-context engine alike.

1. **Transport.** Moves bytes between client and server: stdio frames or Streamable HTTP, exactly as covered in [Transports](transports.md).
2. **Protocol layer.** Speaks JSON-RPC. It parses frames, reads and validates the per-request `_meta` for protocol version and client capabilities, answers `server/discover` and `tools/list`, validates incoming calls, and routes each request to the right piece of your code. This is the machinery [the wire protocol chapter](wire-protocol.md) walked through. In practice you never write it, because the SDK ships it.
3. **Handlers.** A **handler** is the function the protocol layer calls when a specific request arrives — one per tool, resource, or prompt. It turns a protocol-shaped request into a call on your domain code, then turns the result back into [content blocks](primitives.md).
4. **Domain logic.** The capability itself: the search index, the database, the parser, the API wrapper. It has no idea MCP exists.

```mermaid
flowchart TB
    CL["MCP client<br/>(inside the IDE or agent host)"]
    subgraph SRV["your server process"]
        direction TB
        TR["1 · Transport<br/>stdio or Streamable HTTP"]
        PL["2 · Protocol layer<br/>JSON-RPC framing, version check,<br/>discovery, dispatch"]
        HA["3 · Handlers<br/>one function per tool,<br/>resource, or prompt"]
        DL["4 · Domain logic<br/>compiles without the protocol"]
        TR <--> PL
        PL <--> HA
        HA <--> DL
    end
    CL <-->|"JSON-RPC messages"| TR

    classDef sdk fill:#e3f2fd,stroke:#1565c0,color:#0d47a1;
    classDef yours fill:#c8e6c9,stroke:#2e7d32,color:#1b5e20;
    class TR,PL sdk;
    class HA,DL yours;
```

Blue layers come from the SDK. Green layers are yours.

That split is the entire value proposition of the official SDKs, and [Why MCP](why-mcp.md) lists the language tiers. Layers 1 and 2 are identical across every server on earth. So writing an MCP server mostly means writing handlers, and the domain logic behind them.

## Registering a tool

Here is what the handler layer looks like in practice. A single tool, in C#-flavored code:

```csharp
// One tool: a described function the SDK exposes over MCP.
[McpServerTool(Name = "search_notes")]
[Description("Full-text search over saved notes. Use when the user " +
    "asks what was previously decided or recorded. Returns matching " +
    "notes as plain text; an empty result means nothing matched.")]
public static string SearchNotes(
    [Description("Substring to look for, e.g. 'deploy checklist'.")]
    string query)
{
    // The handler body is one line: hand off to domain logic.
    return NoteStore.Search(query);
}
```

*Illustrative — simplified, not Sankshep source. SDK APIs drift between versions, so treat this as the shape of the idea rather than paste-ready code.*

Three things are worth noticing, because they hold in every SDK.

**The metadata travels verbatim.** The name and description strings are exactly what the client ships back in the `tools/list` response. You are not writing comments here. You are writing the API documentation the model receives.

**The schema is declared, not hand-written.** Most SDKs work out the JSON Schema for the tool's input from the handler's signature and parameter annotations. So the types you declare become the contract the client validates against.

**The handler is thin.** One line in, one line out. Everything interesting happens in `NoteStore`, which imports nothing protocol-related.

## Tool descriptions are model-facing UX

That first observation deserves its own rule, because it is the least obvious part of server-writing.

**A tool description is user-interface text whose user is a model.**

Here is the mechanism. [The wire protocol chapter](wire-protocol.md) established that the `tools/list` response is the only knowledge of your API the model will ever have.

The client folds those names, descriptions, and schemas into the model's [context window](../part1-fundamentals/context-windows.md). Tool selection is then next-token prediction over that text.

So everything the model ["knows"](../part1-fundamentals/what-llms-do.md#the-anthropomorphism-contract) about your server is the strings you wrote in the registration above.

A vague description does not produce an error. It produces a model that emits calls to the wrong tool, or to no tool at all. And you get to debug that by rereading your own prose.

Budget your writing time accordingly. The description paragraph often matters more than the handler body.

The craft — verb-first phrasing, when to use and when not to use, argument semantics, how many tools is too many — gets a full treatment in [Tool calling in depth](../part4-agents/tool-calling.md). For now the rule is enough: when you edit a description, you are editing the model's behavior.

## Structure that survives growth

The anatomy diagram showed a clean stack. The common failure is letting it smear.

Protocol types leak inward. The search index takes an SDK request object as a parameter. The database layer returns SDK content blocks. Everything still works — until the SDK changes, and now a package update touches every file in the repository.

The defense is a **dependency fence**: a hard rule about which projects may reference which packages, so third-party churn stays at the edge of your codebase.

For an MCP server the fence has one load-bearing clause. *The SDK is referenced by exactly one project, the outermost one, and the domain logic compiles without it.*

What the fence buys, concretely:

| Benefit | Without a fence | With a fence |
|---------|-----------------|-------------|
| **Upgrades are local** | A breaking SDK release touches every file that imported its types | One project migrates; everything behind the fence recompiles unchanged |
| **Domain is testable without a client** | Tests need a live MCP client and subprocess | Search, storage, and parsing are plain functions, unit-testable in milliseconds |
| **Domain is reusable** | Logic references SDK types, so it is tied to MCP forever | The same domain logic can back a CLI, a library, or a different protocol |

A fence that lives in a wiki page erodes. The durable version lives in a test: an automated check that fails the build the moment a forbidden reference appears.

A production example follows in a moment. The full design rationale is in the capstone [dependency fence case study](../part5-capstone/case-dependency-fence.md).

Is the churn threat real? Look at the official C# SDK's release feed.

!!! warning "Evolving — verified 2026-09-20"
    The official C# SDK ships on NuGet as `ModelContextProtocol`, with `ModelContextProtocol.Core` and `ModelContextProtocol.AspNetCore` variants. It is maintained in the MCP organization together with Microsoft. The 2.x line is GA — 2.0.0, 2.1.0 and 2.2.0 are all released — and 1.x is a generation behind. This changes quickly; check the [NuGet package page](https://www.nuget.org/packages/ModelContextProtocol) for current values.

Read that box as an argument, not just a version report.

**The major-version migration already happened.** When this chapter was first written the feed held a stable 1.4.1 alongside a 2.0 preview, and the point being made was that the migration was coming. It came: 2.x went GA and then moved twice more, to 2.1.0 and 2.2.0, inside two months. That is the tempo a protocol SDK sets, and it is why the boundary this chapter is about matters — a dependency that moves this fast is one you want touching as few of your projects as possible.

Whether it costs you an afternoon or a quarter depends on which side of a fence your SDK reference lives.

## In practice: Sankshep

Sankshep's solution shape is this chapter's structure, enforced. ADR-0004 confines the MCP SDK to the `Server` project, and everything below it compiles without the protocol.

```mermaid
flowchart TB
    SDK["NuGet: ModelContextProtocol 2.2.0<br/>(the MCP SDK)"] --> SRV
    SRV["Server<br/>composition root — the only project<br/>referencing the SDK"]
    SRV --> MIN["Minimizer<br/>TreeSitter.DotNet, ML.Tokenizers"]
    SRV --> MEM["Memory<br/>Microsoft.Data.Sqlite, sqlite-vec,<br/>ONNX Runtime"]
    MIN --> CORE["Sankshep.Core<br/>contracts + composer engine<br/>BCL only — zero third-party references"]
    MEM --> CORE
    EVALS["Evals<br/>YamlDotNet only"] --> CORE
    EVALS -. "drives the shipped server as a<br/>subprocess over stdio — no reference" .-> SRV
    GATE["CI test:<br/>DependencyRuleTests.<br/>CoreAssembly_HasZeroNonBclReferences"] -. "build fails if Core gains<br/>a non-BCL reference" .-> CORE

    classDef fenced fill:#c8e6c9,stroke:#2e7d32,color:#1b5e20;
    classDef edge fill:#e3f2fd,stroke:#1565c0,color:#0d47a1;
    classDef gate fill:#fff3e0,stroke:#ef6c00,color:#e65100;
    class CORE fenced;
    class SRV,SDK edge;
    class GATE gate;
```

The shape maps onto the anatomy directly.

`Server` is layers 1 through 3: transport, SDK protocol layer, and the handlers behind Sankshep's eight tools, one prompt, and one resource. [Primitives](primitives.md) toured that surface.

The subsystem projects, Minimizer and Memory, are layer 4. And `Sankshep.Core` at the bottom holds the shared contracts with *zero* non-BCL references. Not the SDK. Not even tree-sitter or SQLite.

Two details are worth stealing for any server you build.

**The fence is a failing test, not a convention.** The CI test named in the diagram inspects the compiled `Core` assembly's references, and fails the build if anything beyond the .NET base class library appears. Nobody has to remember the rule. The build remembers it.

**The evals sit outside the fence on purpose.** The `Evals` project never references `Server`. It launches the shipped binary as a subprocess and speaks stdio JSON-RPC to it, per ADR-0008.

So the wire protocol you learned two chapters ago doubles as the test interface, and the tests exercise exactly what a real client would.

SDK 2.0 landed, and then 2.1 and 2.2. Each migration was one project — the real one Sankshep ran is on 2.2.0 today. Which is the whole point.

## Checkpoints

1. Name the four layers of the universal server anatomy, and say which two you write when you use an official SDK.

    ??? success "Answer"
        Transport, protocol layer, handlers, domain logic.

        The SDK provides the transport and the protocol layer: framing, version checking, discovery, dispatch.

        You write the handlers, and the domain logic behind them.

2. What is the mechanical reason that editing a tool's description string changes a model's behavior?

    ??? success "Answer"
        The description travels verbatim in the `tools/list` response. The client folds it into the model's context, and tool selection is next-token prediction over that text.

        There is no other channel. The description is the model's entire evidence about what the tool does. So changing the text changes which continuations — which tool calls — are probable.

3. Your domain logic no longer compiles without the MCP SDK package. What has gone wrong, and what does it cost you later?

    ??? success "Answer"
        Protocol types have leaked past the handler layer into the domain. The fence is breached.

        The costs arrive later. Any breaking SDK release becomes a codebase-wide migration instead of a one-project one. The domain can no longer be unit-tested as plain functions. And it cannot be reused behind a CLI or another protocol without dragging the SDK along.

4. Why is a dependency fence enforced by a CI test more durable than one written in an architecture document?

    ??? success "Answer"
        A documented rule relies on every future contributor reading it, remembering it, and honoring it. It erodes one convenient shortcut at a time.

        A test that inspects the compiled assembly's references fails the build the instant the rule is broken. So the fence is checked on every commit, by a machine that never forgets.

        Sankshep's `DependencyRuleTests.CoreAssembly_HasZeroNonBclReferences` is exactly this.

## Try it

Design a server on paper. No code — that is [Part 6's job](../part6-reference/build-your-own.md).

Pick a workflow you actually repeat: searching your bookmarks, checking a deploy pipeline, querying a work log. Then produce a one-page design.

1. **List three to five capabilities.** Run each through the who-invokes rule from [Primitives](primitives.md). Model-invoked becomes a tool. Application-read becomes a resource. User-picked becomes a prompt.
2. **For each tool, write the registration metadata.** This is the part this chapter says matters most.
    - a `verb_noun` name,
    - a description paragraph saying what it does, when to use it, and when *not* to,
    - a JSON Schema sketch of the input, with a one-line description per property,
    - one sentence on what the result content looks like, including what an empty result means.
3. **Draw your fence.** For each tool, write the one-line domain function signature its handler would call.

    Now check those signatures. If any of them mentions a protocol type, redraw.

Keep the page. When you reach [Build your own MCP server](../part6-reference/build-your-own.md), you will implement a design exactly like it — and the description paragraphs you just drafted will be tested by a real model.
