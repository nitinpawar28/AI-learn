# How to learn a codebase like this

The last eight pages walked through one production server in detail. This page explains how that understanding gets built, so you can rebuild it on any codebase.

It is a five-step method: decisions, dependencies, one traced request, enforcing tests, written facts. It takes you from cloning an unfamiliar repository to defending its design out loud. It also gives you a way to package what you learn for an interview.

The method is not specific to Sankshep, or even to MCP servers.

But Sankshep is the worked example throughout, because you have already seen every artifact the method uses. Its ADRs became the seven case studies. Its dependency graph became [the dependency fence](case-dependency-fence.md). And its request trace became the centerpiece of [The whole picture](architecture.md).

## Your working memory is a context window too

A repository of even modest size holds far more text than you can keep in your head.

Reading files top to bottom is the human version of the mistake [Part 2 opens with](../part2-context/why-raw-context-fails.md): pasting raw files into a [context window](../part1-fundamentals/context-windows.md) and hoping the signal survives the noise.

Most of what a linear pass delivers is irrelevant to any question you actually have.

The fix is the same one Part 2 teaches for models. Curation, not accumulation.

Each step below is a curation move. It selects a small, high-signal slice of the codebase, and defers the rest.

```mermaid
flowchart TB
    A["1 · Read the decisions<br/>ADRs, design docs, PR descriptions"]
    B["2 · Draw the dependency graph<br/>who references whom, and who must not"]
    C["3 · Trace one request<br/>end to end, through every layer"]
    D["4 · Read the architecture-enforcing tests<br/>the rules that fail the build"]
    E["5 · Write facts down as you go<br/>category, fact, source"]
    A --> B --> C --> D --> E
    E -->|"next question,<br/>next subsystem"| A
```

The arrows form a cycle on purpose.

One pass gives you a defensible skeleton. Each later question starts the loop again on a narrower slice, and step 5's notes make every pass after the first cheaper.

## Step 1 — read the decisions before the code

Start with the architecture decision records, defined back in [the running example](../part0-orientation/running-example.md).

Decisions compress a codebase better than code does. Code only shows you what is there.

An ADR shows you what else was considered, why it lost, and what would have to change for the loser to win. No amount of code reading can recover that, because rejected alternatives leave no trace in the source.

Sankshep's ADRs are the proof. ADR-0003 is why you see tree-sitter and not Roslyn. ADR-0002 is why sqlite-vec and not a vector database. ADR-0006 is why the index trusts the working tree rather than a snapshot.

Three short documents carry more architectural signal than thirty files. And each one seeded a [case study](index.md) in this part.

Not every codebase has ADRs. The fallbacks, in descending order of signal: design documents, pull-request descriptions, and commit messages on the oldest structural files.

A repository with none of these is telling you something too. Expect to reconstruct intent from structure, which is what the next three steps do.

## Step 2 — draw the dependency graph

Before opening any implementation file, list the projects or packages and draw the arrows between them.

Ten minutes with the project files answers questions that hours of code reading cannot. What is the composition root? What compiles without what? Where is third-party churn allowed, and where is it fenced out?

For Sankshep, the shipped binary is four projects. A BCL-only core, referenced by the minimizer and memory subsystems, composed by a server project — which is the only place the MCP SDK appears.

A fifth project, the evals, deliberately sits outside that graph. It references only the core, and drives the shipped binary as a subprocess over stdio. So it measures what an IDE client receives.

That single picture predicts most of the codebase's behavior under change. Which is why it earned [its own case study](case-dependency-fence.md).

The graph also tells you where to read first. Leaf projects with no inbound arrows are consumers you can skim. The node everything points at is the vocabulary of the system, and it is worth reading closely.

## Step 3 — trace one request end to end

Pick one representative operation and follow it through every layer. From the moment bytes arrive, to the moment a response leaves.

This beats reading modules one at a time, for the same reason [retrieval](../part2-context/rag-for-code.md) beats pasting whole files. A trace ranks code by relevance to a real execution path. And layers that looked opaque in isolation explain each other when you watch them hand off.

For Sankshep, that trace is already written. [The whole picture](architecture.md) follows a single `get_context` call from client configuration through path resolution, verify-on-read, parsing, transforms, ranking, and packing, to the savings report on stdout.

Notice what it forces you to learn in passing. The [transport](../part3-mcp/transports.md), the [wire protocol](../part3-mcp/wire-protocol.md), and the internal pipeline — in their real order.

Choose the trace the way you would choose an eval question: one that touches the subsystems you most need to understand. For a server, the natural pick is its flagship [tool](../part3-mcp/primitives.md).

## Step 4 — read the architecture-enforcing tests

Some tests check behavior. A smaller, more valuable set checks structure.

Those tests are the codebase stating, in executable form, which rules it refuses to let rot.

Sankshep has two you have already met.

`DependencyRuleTests.CoreAssembly_HasZeroNonBclReferences` turns the step-2 graph from a convention into a gate, per ADR-0004.

And a build-time test over the composer's reference closure guarantees that no model client can enter the prompt-composition path, per ADR-0013. That is the "a prompt, not an answer" promise, made structural.

The eval regression gate plays the same role for quality claims, as [Measure what you ship](case-measure-what-you-ship.md) shows.

When you find such a test, you have found a load-bearing wall.

When you look for them and find none, that is a finding too. It means every structural rule in the codebase is enforced only by review and memory.

## Step 5 — write facts down as you go

Everything you learn in steps 1 through 4 decays unless you externalize it.

Keep a running facts file. One line per fact, with a category and a source — exactly the design axes from [persistent memory](../part2-context/persistent-memory.md).

Facts are small and precise, so plain text and substring search are enough. That is the right-sizing lesson from that chapter, applied to your own notes.

```text
[architecture] Core is BCL-only; the MCP SDK appears only in Server.   (ADR-0004)
[behavior]     search_code refreshes first: mtime scan, then hash diff. (ADR-0006)
[limit]        Python and Ruby have no bodies.scm — no body collapse.   (docs)
```

The source column is the discipline that matters.

A fact you cannot trace back to an ADR, a test, or a traced line of code is a guess wearing a fact's clothing. And guesses are what interviews puncture.

Sankshep's own facts table keeps a source column for the same reason.

## The meta-move

Step back and the method is this site's curriculum, pointed at a human reader. It is context engineering for the most budget-limited consumer you manage.

That is why it works on any codebase.

| Step | Part 2 technique it mirrors |
|---|---|
| Decisions first | [Retrieval](../part2-context/rag-for-code.md) — fetch the highest-signal chunks, skip the rest |
| Dependency graph | [Minimization](../part2-context/structural-minimization.md) — the architecture with its bodies collapsed |
| One traced request | [Grounding](../part4-agents/grounded-prompting.md) — learn from verified state, not from claims |
| Enforcing tests | [Measurement](../part2-context/measuring-quality.md) — trust what fails when it is wrong |
| Facts file | [Memory](../part2-context/persistent-memory.md) — durable facts with provenance |

## The interview frame

Understanding a codebase and defending one are different skills.

For the second, reuse [the capstone template](index.md): context, decision, alternatives, tradeoffs, what would change it, transferable lesson.

Any design question becomes an answer in that shape. "Why tree-sitter?" "Why no vector database?"

And steps 1 and 4 supply the raw material. The ADR gives you the alternatives and tradeoffs. The enforcing test proves the decision is real rather than aspirational.

The strongest interview answers name the flip condition unprompted.

"We chose X, and we would revisit it if Y" shows that you hold the decision as an engineering judgment rather than a loyalty. Which is exactly how the seven case studies in this part are written.

## Checkpoints

1. Why do decision records compress a codebase better than the code itself?

    ??? success "Answer"
        Code shows only the alternative that won.

        An ADR records the alternatives that lost, why they lost, and what would flip the decision. That information leaves no trace in the source, because rejected designs are never committed.

2. What does the dependency graph tell you before you read a single implementation file?

    ??? success "Answer"
        The composition root. What compiles without what. Which node holds the system's shared vocabulary. And where third-party churn is fenced.

        In Sankshep's case, one picture predicts how the codebase behaves under dependency change: a four-project binary — BCL-only core, two subsystems, SDK confined to the server project — with the evals outside the reference graph, driving the binary over stdio.

3. Why trace one request end to end, instead of reading each module thoroughly in turn?

    ??? success "Answer"
        A trace ranks code by relevance to a real execution path. It is the human equivalent of retrieval over raw context.

        It also shows the layers in interaction, and where the handoffs live. Module-by-module reading hides both.

4. What makes an architecture-enforcing test better documentation than a wiki page describing the same rule?

    ??? success "Answer"
        The test fails the build the moment the rule is violated. So it cannot silently drift out of date. A wiki page can.

        `DependencyRuleTests.CoreAssembly_HasZeroNonBclReferences` does not describe the fence. It *is* the fence.

        Executable rules are the only documentation guaranteed to be true on every green build.

## Try it

The capstone exercise: apply all five steps to an MCP server you have never read.

A good target is one of the official reference servers — for example the filesystem server you may already have installed during [IDE integration](../part3-mcp/ide-integration.md). They are small, open source, and finishable in an evening.

1. **Decisions.** Reference servers rarely ship ADRs, so run the fallback ladder: README, changelog, pull-request descriptions. Write down the three most consequential decisions you can reconstruct, each with its apparent rationale.
2. **Dependency graph.** From the package manifest and imports, draw the graph. Mark where the MCP SDK appears. Is it fenced to an edge, or woven throughout?
3. **One trace.** Follow a single tool call from stdin to result. You can drive it by hand, with the exact JSON lines from [the wire protocol chapter](../part3-mcp/wire-protocol.md).
4. **Enforcing tests.** Find any test that encodes a structural rule. If there are none, record that as a finding, and name one rule you would enforce first.
5. **Facts file.** Keep the category-fact-source format as you go. Aim for twenty facts.

Then close the loop. Pick the most interesting decision you found, and write it up in the capstone template, flip condition included.

If you can do that for a server you met this week, you can do it for your own work in any interview. Which was the point of this part all along.
