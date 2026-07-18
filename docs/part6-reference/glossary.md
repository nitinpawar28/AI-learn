# Glossary

Every term below was introduced in **bold**, with a definition, in exactly one chapter of this site. Each entry gives a working definition and links back to the chapter that teaches it — follow the arrow for the full treatment, the diagrams, and the surrounding argument.

## A

**actionable error** — An error message written so that the model's next sampled step can plausibly fix the problem: it names what failed, why, and what to do instead. A 40-line stack trace burns the same tokens and affords no correction. → [Tool calling in depth](../part4-agents/tool-calling.md)

**ADR (architecture decision record)** — A short document capturing one design decision: the context, the choice, the rationale, and the alternatives that lost. Decisions compress a codebase better than code does, which is why reading a system's ADRs first is the fastest way in. → [The running example](../part0-orientation/running-example.md)

**agent** — An LLM run inside a loop with three additions: tools it can request, state carried between iterations (the conversation history), and a stop condition. The client program owns the loop; the model only emits text, and the server only executes single calls. → [The agent loop](../part4-agents/agent-loop.md)

**Agent mode** — The VS Code chat mode in which tool definitions are attached to model requests and the emitted tool calls are executed. A server can be configured, connected, and healthy while its tools never fire, because other chat modes never send the definitions to the model at all. → [Connecting servers to IDEs](../part3-mcp/ide-integration.md)

**Agentic AI Foundation** — The body under the Linux Foundation that has governed MCP since Anthropic donated the protocol in December 2025, with Anthropic, Block, and OpenAI as co-founders. → [What problem MCP solves](../part3-mcp/why-mcp.md)

**approximate nearest-neighbor (ANN) index** — A data structure that pre-organizes stored vectors so each query touches only a small fraction of them, trading build time, memory, and a chance of missing true neighbors for speed. It pays off at millions of vectors, not thousands. → [Embeddings and similarity](../part1-fundamentals/embeddings.md)

**asymmetric retrieval** — A retrieval setup in which short queries search long passages, supported by embedding models trained with a fixed instruction string wrapped around the query. The same prefix must be prepended at query time — to queries only — or accuracy drops with no error message. → [Embeddings and similarity](../part1-fundamentals/embeddings.md)

**author-time template** — A prompt template written, reviewed, and versioned by a person; it changes when intent changes. It encodes role, output rules, and standing constraints, and composes with request-time grounding rather than competing with it. → [Grounded prompting and composition](../part4-agents/grounded-prompting.md)

**autoregressive** — Generating output one token at a time, with each produced token appended to the input for producing the next. This loop is how a single next-token prediction yields whole paragraphs. → [What an LLM actually does](../part1-fundamentals/what-llms-do.md)

## B

**body collapse** — The minimization transform that deletes function and method bodies while keeping signatures, preserving a file's shape — types, names, relationships — at a fraction of the tokens. Right for "what does this module expose?", wrong for "why does this function misbehave?", which is why the query matters. → [Structural minimization](../part2-context/structural-minimization.md)

**byte-pair encoding (BPE)** — The algorithm most tokenizers use to build their vocabulary — the fixed list of known tokens: start from single bytes and repeatedly merge the most frequent adjacent pair in a training corpus until the list reaches its target size. Frequent strings become single tokens; rare strings shatter into many. → [Tokens and tokenization](../part1-fundamentals/tokens.md)

## C

**capability (MCP)** — A named, described, schema-typed offering an MCP server exposes. Clients learn capabilities at connection time through discovery rather than compiling them in; MCP defines three kinds — tools, resources, and prompts. → [What problem MCP solves](../part3-mcp/why-mcp.md)

**chunk** — The unit of retrieval: the piece of text that gets one embedding, one index entry, and — if it wins the ranking — one slot in the prompt. For code, syntax-aware chunking along symbol boundaries beats fixed-size windows. → [Retrieval for code](../part2-context/rag-for-code.md)

**client (MCP)** — The protocol machinery inside a host application that holds a one-to-one session with a single MCP server; a host connected to three servers runs three clients. The client also owns the agent loop and translates between MCP and the model API. → [What problem MCP solves](../part3-mcp/why-mcp.md)

**compression ratio** — As used on this site: the fraction of the original input's tokens a transform removed — 10,000 tokens in, 7,000 delivered, is 30% compression. Meaningless on its own; it must be paired with a fidelity measure such as key-point recall. → [Measuring context quality](../part2-context/measuring-quality.md)

**confused deputy** — A privileged component tricked into exercising its authority on behalf of a requester who lacks it. The agent-stack version is token pass-through. → [Safety and judgment](../part4-agents/safety.md)

**content block** — A typed chunk — text, image, resource link — in a tool result. The client appends the blocks to the conversation, where they become ordinary tokens in the context window like everything else. → [Tools, resources, and prompts](../part3-mcp/primitives.md)

**context curation** — Selecting, shrinking, and verifying what enters the context window so that signal survives and noise does not. It decomposes into four moves: retrieve, compress, remember, and measure. → [Why raw context is wasteful](../part2-context/why-raw-context-fails.md)

**context engineering** — The practice of deciding, for each model call, which tokens enter the context window and in what form — replacing "paste everything and hope" with deliberate retrieval, compression, memory, and measurement. → [Context engineering](../part2-context/index.md)

**context window** — The maximum number of tokens a model can process in one call: everything the model conditions on to produce output, plus the output itself. It is a hard limit — tokens beyond it are not "skimmed"; they are simply not part of the input. → [The context window](../part1-fundamentals/context-windows.md)

**cosine similarity** — The standard score for how close two embeddings are: the dot product of the two vectors divided by the product of their lengths. It measures the angle between them, ignores magnitude, and ranges from −1 to 1. → [Embeddings and similarity](../part1-fundamentals/embeddings.md)

## D

**degradation ladder** — An ordered sequence of fallbacks in which each step gives up ranking quality but keeps returning correct results: vector index unavailable → brute-force similarity over stored vectors; no embeddings at all → lexical search alone. → [Retrieval for code](../part2-context/rag-for-code.md)

**dependency fence** — A hard rule about which projects may reference which packages, confining third-party churn to the edge of a codebase — for an MCP server: the SDK is referenced by exactly one outermost project, and the domain logic compiles without it. Enforced by a failing test, not a convention. → [Writing an MCP server](../part3-mcp/writing-a-server.md)

## E

**embedding** — A fixed-length vector produced by an embedding model — a neural network that reads one piece of text and outputs one vector, emitting no tokens — arranged so that texts used in similar ways end up with vectors that sit close together. → [Embeddings and similarity](../part1-fundamentals/embeddings.md)

## F

**fail-closed** — The policy that when a check fails or cannot run, the pipeline stops rather than proceeding with a warning — applied wherever safety or honesty is at stake, such as an eval regression gate. A gate that only warns is a gate everyone learns to walk around. → [Measuring context quality](../part2-context/measuring-quality.md)

**fail open** — The policy that on an internal failure a system continues with degraded output. Neither fail open nor fail-closed is safer in the abstract; the judgment rule is: degrade quality gracefully, never degrade safety or honesty. → [Safety and judgment](../part4-agents/safety.md)

**few-shot prompting** — Including a small number of worked input → output examples in the prompt so the model continues the demonstrated pattern. Examples buy reliability that longer instructions cannot, at a recurring token cost. → [Prompting basics](../part1-fundamentals/prompting-basics.md)

**freshness** — The grounding property that a prompt's contextual claims were read from project state at request time, not remembered from some earlier moment. → [Grounded prompting and composition](../part4-agents/grounded-prompting.md)

## G

**golden test** — A test comparing a program's output byte for byte against a stored known-good file. Deterministic prompt composition makes entire composed prompts pinnable as golden files, so any behavioral drift fails the build. → [Grounded prompting and composition](../part4-agents/grounded-prompting.md)

**grounding** — Building the variable parts of a prompt from verifiable project state at the moment of the request — the working tree, the memory store, the standing constraints. In a grounded prompt, every contextual claim is traceable to a source that existed when the prompt was assembled. → [Grounded prompting and composition](../part4-agents/grounded-prompting.md)

## H

**hallucination** — Fluent, confident output supported by neither the model's weights nor its context. Next-token prediction has no built-in "nothing to say" state — declining to answer is itself trained behavior — which is why hallucinations exist. → [What an LLM actually does](../part1-fundamentals/what-llms-do.md)

**handler** — The function a server's protocol layer invokes when a specific request arrives — one per tool, resource, or prompt. It translates a protocol-shaped request into a call on domain code, then translates the result back into content blocks. → [Writing an MCP server](../part3-mcp/writing-a-server.md)

**honest non-claim** — An explicit statement that a plausible-sounding benefit was not measured and is therefore not claimed. Marking the boundary of what you know is precisely what makes the claims inside that boundary believable. → [Measuring context quality](../part2-context/measuring-quality.md)

**host** — The application a user interacts with — an IDE assistant, a desktop chat app, an agent harness. It owns the user interface, talks to the model API, and embeds one MCP client per connected server. → [What problem MCP solves](../part3-mcp/why-mcp.md)

**hybrid ranking** — Running semantic and lexical search together and blending their normalized scores into one ordering, typically as a weighted sum — keeping semantic recall for paraphrased questions while letting exact name matches punch through. → [Retrieval for code](../part2-context/rag-for-code.md)

## I

**inference** — Everything after training: running the frozen weights forward over a context to produce next-token distributions. All interaction with a deployed model happens at inference; nothing sent to it changes the weights. → [What an LLM actually does](../part1-fundamentals/what-llms-do.md)

## J

**JSON-RPC 2.0** — The small remote-procedure-call format MCP is built on: one JSON object per message and exactly three shapes — a *request* (method, params, and an `id` obligating one reply), a *response* (the matching `id` plus a result or an error, never both), and a *notification* (no `id`, fire-and-forget, no reply allowed). → [The wire protocol](../part3-mcp/wire-protocol.md)

## K

**key-point recall** — The fidelity measure this site pairs with compression: decompose the ideal answer to each question into atomic facts, have a judge label each fact supported or unsupported by the context under test, and report supported divided by total. → [Measuring context quality](../part2-context/measuring-quality.md)

**k-nearest-neighbor (KNN) search** — Given a query vector, finding the k stored vectors with the highest similarity — either exactly, by scoring every stored vector, or approximately via an ANN index. → [Embeddings and similarity](../part1-fundamentals/embeddings.md)

## L

**L2 normalization** — Scaling a vector so its length is exactly 1, which collapses cosine similarity into a plain dot product. Most retrieval stacks normalize every vector once, at index time. → [Embeddings and similarity](../part1-fundamentals/embeddings.md)

**least privilege** — Granting a component the minimum access its job needs. It is the prompt-injection defense that holds no matter what the model emits: an injection that succeeds against a read-only, scoped toolbelt steers nothing but prose. → [Safety and judgment](../part4-agents/safety.md)

**lexical search** — Retrieval by literal text match — keywords, substrings, identifiers. Code rewards it unusually well because identifiers are load-bearing names: a query containing "validated" can surface `ValidateRequest` directly and cheaply. → [Retrieval for code](../part2-context/rag-for-code.md)

**LLM-as-judge** — Using a separate, rubric-constrained model call to label outputs that have no mechanical oracle. The rubric is the load-bearing part: per-fact yes/no questions produce labels you can spot-check; holistic 1–10 scores drift. → [Measuring context quality](../part2-context/measuring-quality.md)

**local measurement** — Catching quality regressions with evals the maintainer runs against the shipped binary, instead of telemetry from users' machines. It accepts a known gap: it answers "did quality regress on my corpus?", not "what do users actually do?". → [Case study: local-first, no telemetry](../part5-capstone/case-local-first.md)

**loop multiplier** — The factor by which a looping workflow re-bills tokens already paid for: iteration N re-sends everything from iterations 1 through N−1, so cumulative input tokens grow far faster than the conversation itself. → [Cost and efficiency](../part4-agents/cost-efficiency.md)

**lost in the middle** — The measured tendency of language models to answer more accurately when the relevant information sits at the beginning or end of a long context than in the middle. The canonical study is Liu et al. (TACL 2024, arXiv 2307.03172), whose accuracy-versus-position result is a U-shaped curve. → [The context window](../part1-fundamentals/context-windows.md)

## M

**model API** — The provider-specific interface through which a conversation goes to a model and sampled output comes back. It is not MCP: two protocols are in play whenever an IDE agent invokes an MCP tool, and the client is the translator between them. → [The wire protocol](../part3-mcp/wire-protocol.md)

**Model Context Protocol (MCP)** — An open protocol in which a client connects to a server, asks what it offers, and invokes those offerings on a model's behalf — with message shapes, discovery, and error rules standardized so any compliant client can use any compliant server. Runtime discovery is what turns N×M bespoke integrations into N+M. → [What problem MCP solves](../part3-mcp/why-mcp.md)

**model routing** — Selecting, in client code, which model serves each call: a cheap model for easy steps, escalating to an expensive one for hard steps. It is a client-layer concern because the client owns the loop and pays the bill. → [Cost and efficiency](../part4-agents/cost-efficiency.md)

## N

**next-token prediction** — The single operation an LLM performs: given a sequence of tokens, compute a probability for every token in its vocabulary being the next one. Chat, code review, translation, and tool use are all built by running this one function repeatedly. → [What an LLM actually does](../part1-fundamentals/what-llms-do.md)

## O

**orchestrator** — The agent, or plain program, that splits a job into subtasks, starts subagents, and integrates what they send back. The common topologies are fan-out (many independent subtasks in parallel), pipeline (sequential stages passing summaries forward), and orchestrator-worker (dynamic delegation as the plan evolves). → [Agents, subagents, and orchestration](../part4-agents/agents-subagents.md)

## P

**persistent memory** — A store outside the model that survives across sessions, holding facts an application selectively re-injects into the context window at request time. Its four design axes are granularity, retrieval mode, scoping, and provenance. → [Persistent memory](../part2-context/persistent-memory.md)

**pooling** — The rule that collapses an embedding model's per-token vectors into one vector for the whole text: take the special first-position vector (CLS) or average them all (mean). Use the rule the model was trained with — the classic bug is mean-pooling a CLS-trained model, which runs fine and scores subtly wrong. → [Embeddings and similarity](../part1-fundamentals/embeddings.md)

**primitive (MCP)** — One of the three standard capability shapes — tool, resource, prompt — in which a server exposes everything it offers. What separates them is not payload but initiative: who invokes each — model, application, or user. → [Tools, resources, and prompts](../part3-mcp/primitives.md)

**prompt** — The complete text input a model receives for a single call: standing instructions, conversation history, pasted or retrieved material, and the immediate request, concatenated into one token sequence. The model receives this sequence, not your intent. → [Prompting basics](../part1-fundamentals/prompting-basics.md)

**prompt (MCP primitive)** — A parameterized message template a server exposes — the user-invoked primitive: the human picks it from a menu, the server fills it in, and the filled text enters the conversation. → [Tools, resources, and prompts](../part3-mcp/primitives.md)

**prompt caching** — A provider feature that recognizes when the opening span of a request is byte-identical to a recent request's opening span and bills those re-read tokens at a discounted rate. Agent loops benefit because the system prompt, tool definitions, and history form a stable, append-only prefix. → [Cost and efficiency](../part4-agents/cost-efficiency.md)

**prompt composition** — The mechanical assembly of a final prompt from independently produced parts — task, retrieved code, durable facts, constraints — each with its own source and its own share of the token budget. Done deterministically, it becomes golden-testable. → [Grounded prompting and composition](../part4-agents/grounded-prompting.md)

**prompt injection** — Attacker-authored text that, once inside the context window, steers the model's output toward the attacker's goal. There is no exploit and no malformed packet: the payload is ordinary prose, because ordinary prose is what programs the model. → [Safety and judgment](../part4-agents/safety.md)

**prompt template** — A prompt with named slots — task, retrieved code, output rules — filled in at request time, separating the fixed scaffold you version from the per-request variables. → [Prompting basics](../part1-fundamentals/prompting-basics.md)

**protocol error** — A JSON-RPC-level failure — unknown method, malformed request — returned in the `error` object in place of `result`. Its audience is the client software; the model typically never sees it. → [The wire protocol](../part3-mcp/wire-protocol.md)

**provenance** — Where a memory or claim came from and when: a source field and a timestamp. It lets you resolve contradictions, expire stale facts, and audit what the assistant was told — and it is one of grounding's two properties. → [Persistent memory](../part2-context/persistent-memory.md)

## Q

**query-targeted collapse** — Body collapse steered by the request: extract keywords from the query, keep the bodies that match them, collapse the rest — so a request about "how does login validate" keeps `ValidateRequest` intact while unrelated bodies shrink to signatures. → [Structural minimization](../part2-context/structural-minimization.md)

## R

**ReDoS** — Regular-expression denial of service: a pattern whose worst-case matching time explodes on crafted input, letting one string pin a CPU. → [Safety and judgment](../part4-agents/safety.md)

**resource (MCP primitive)** — Read-only content a server exposes under a URI — the application-invoked primitive: the client, or the user through the client's UI, reads it and attaches it as context. → [Tools, resources, and prompts](../part3-mcp/primitives.md)

**resource server** — The OAuth 2.1 role MCP assigns servers: validate the access tokens presented to you and serve your own resources — never issue tokens, never forward them. Whatever the server needs from upstream services, it obtains with credentials of its own. → [Safety and judgment](../part4-agents/safety.md)

**retrieval-augmented generation (RAG)** — Fetching relevant material from your own data at request time and placing it in the model's context, so the output is grounded in what your project actually contains rather than in whatever the training data happened to include. → [Retrieval for code](../part2-context/rag-for-code.md)

## S

**sampling** — The step after the forward pass that picks one token from the probability distribution: a weighted random draw, not a lookup of "the answer". It is why the same prompt can produce different outputs on different runs. → [What an LLM actually does](../part1-fundamentals/what-llms-do.md)

**Sankshep** — This site's running example: a local-first MCP server written in C# on .NET 9 that retrieves, structurally compresses, remembers, and measures code context for AI coding assistants. Its source is proprietary while the binary is free (ADR-0014), and it appears on this site only in clearly marked, skippable sections. → [The running example](../part0-orientation/running-example.md)

**semantic search** — Retrieval by embedding similarity to the query, matching meaning without shared words — "auth check" can surface password-verification code that never contains the string "auth". → [Retrieval for code](../part2-context/rag-for-code.md)

**server (MCP)** — The program on the other end of an MCP session, exposing capabilities — tools, resources, prompts — to whichever compliant client connects. → [What problem MCP solves](../part3-mcp/why-mcp.md)

**server-sent events (SSE)** — A standard web mechanism in which the server holds an HTTP response open and delivers a sequence of events over it, one-way, until it closes the stream. In Streamable HTTP it is plumbing inside the transport, not a separate endpoint. → [Transports](../part3-mcp/transports.md)

**session (MCP)** — An identifier a Streamable HTTP server may issue at initialization, which the client attaches to every later request so that independent HTTP calls can be tied to one logical conversation. → [Transports](../part3-mcp/transports.md)

**signal-to-noise ratio** — Of a prompt: the fraction of delivered tokens the task actually requires — signal tokens divided by total tokens sent. → [Why raw context is wasteful](../part2-context/why-raw-context-fails.md)

**stateless mode** — Declining sessions: the server treats every request as self-contained, buying operational freedom — any replica can answer any request, and restarts break no clients — at the cost of holding no per-client state between calls. → [Transports](../part3-mcp/transports.md)

**stdio transport** — Running the MCP server as a subprocess of the client: JSON-RPC messages go to the server's standard input, responses come back on standard output — and nothing else may touch stdout, so all logging goes to stderr. One stray print corrupts the protocol. → [Transports](../part3-mcp/transports.md)

**stemming** — Reducing a word toward its root so related forms match — "validated" reaching `ValidateRequest`. The safe variant strips a single suffix and requires the stem to remain a prefix of the original keyword, so stemming can only add matches, never silently drop them. → [Structural minimization](../part2-context/structural-minimization.md)

**stop condition** — The rule that ends an agent loop. There are exactly two kinds: the natural exit, where the sampled continuation contains no tool call and stands as the final answer, and the forced exits — an iteration cap, a token budget, or the user cancelling. → [The agent loop](../part4-agents/agent-loop.md)

**Streamable HTTP** — The MCP transport for servers that run independently of any one client: the entire protocol is exposed through a single HTTP endpoint, each message sent as a POST, with the server free to answer any request with one plain JSON body or an SSE stream. → [Transports](../part3-mcp/transports.md)

**structural minimization** — Compressing source code by parsing it into a syntax tree and deleting or collapsing regions identified structurally — comments, function bodies, unused imports — rather than paraphrasing with a model. Deterministic, fast, and the output is still real code, just less of it. → [Structural minimization](../part2-context/structural-minimization.md)

**structured content** — The optional machine-readable half of a tool result (`structuredContent`), described by an output schema and traveling alongside the readable blocks so client code can consume results without parsing prose. The governing rule: one result in two encodings, not two payloads. → [Tools, resources, and prompts](../part3-mcp/primitives.md)

**subagent** — A fresh agent loop started on behalf of another agent: it receives a narrow task and an empty context window of its own, runs to its stop condition, and returns a short result — not its transcript — to whoever launched it. Context isolation is the point. → [Agents, subagents, and orchestration](../part4-agents/agents-subagents.md)

**system prompt** — The message slot reserved for standing instructions — persona, rules, output policy — that apply to the whole conversation rather than to one turn. It is not a security boundary. → [Prompting basics](../part1-fundamentals/prompting-basics.md)

## T

**temperature** — A number that reshapes the output distribution before sampling: low temperature sharpens it toward the top tokens, high temperature flattens it. Temperature 0 approximates greedy decoding — always taking the single most probable token. → [What an LLM actually does](../part1-fundamentals/what-llms-do.md)

**token** — The unit a language model reads and writes: a short sequence of characters, often a fragment of a word, mapping to a single integer in the model's fixed vocabulary. Also the unit in which pricing, context limits, and budgets are denominated. → [Tokens and tokenization](../part1-fundamentals/tokens.md)

**token pass-through** — A server forwarding the credential it received to an upstream API instead of presenting its own — the agent-stack form of the confused deputy. MCP's resource-server role exists to rule it out. → [Safety and judgment](../part4-agents/safety.md)

**tokenizer** — The deterministic program that splits text into tokens and looks each one up in a fixed table; the integer assigned to each token is its token ID. Different models use different tokenizers, so the same text yields different counts. → [Tokens and tokenization](../part1-fundamentals/tokens.md)

**tool (MCP primitive)** — A named operation the server executes on request — the model-invoked primitive: the model emits a call, the client carries it out, and the result rejoins the conversation. Defined for discovery by a name, a description, and an input schema. → [Tools, resources, and prompts](../part3-mcp/primitives.md)

**tool error** — A failure that travels inside a successful response, flagged `isError: true`, with a readable explanation in its content. Its audience is the model: because the explanation lands in the conversation like any result, the loop can adjust arguments and retry. → [The wire protocol](../part3-mcp/wire-protocol.md)

**tool selection** — The step where the model, given the conversation so far plus the serialized tool definitions, emits a structured block naming one tool and its arguments. It is next-token prediction over your names, descriptions, and schemas — which is why description text is the design surface. → [Tool calling in depth](../part4-agents/tool-calling.md)

**training** — The phase in which a model's weights are adjusted by processing a huge corpus. It ends before you ever type a prompt. → [What an LLM actually does](../part1-fundamentals/what-llms-do.md)

**transport** — The mechanism that carries protocol messages between an MCP client and server — a pipe between local processes, or HTTP to another machine — deliberately separated from what the messages mean. → [Transports](../part3-mcp/transports.md)

**tree-sitter** — A parsing framework with grammars for many languages, per-request speed, and error tolerance: a file with a syntax error still produces a tree, with an error node wrapping the broken region while everything else parses normally. → [Structural minimization](../part2-context/structural-minimization.md)

**tree-sitter query** — An S-expression pattern, conventionally stored in a `.scm` file, that matches structure in a syntax tree — grep for syntax trees. → [Structural minimization](../part2-context/structural-minimization.md)

**trust boundary** — A line in a system where the provenance or privilege of data changes, so anything crossing it must be validated rather than believed. Inside a context window there are no author labels — tokens you typed and tokens from a stranger's README are the same kind of token — which is what makes injection possible. → [Safety and judgment](../part4-agents/safety.md)

## V

**verbosity bias** — The tendency of judge scoring to favor longer text independently of its content — exactly the wrong defect for compression evals, where the uncompressed baseline is longer by construction. The guards are structural: per-fact binary questions, content-oriented rubrics, hand-checked samples. → [Measuring context quality](../part2-context/measuring-quality.md)

**verify-on-read** — Checking, synchronously at the moment of each read, whether the data behind an index or cache has changed — and refreshing exactly what did before serving the result. Any file watcher layered on top is a latency optimization, never a correctness dependency. → [Case study: verify-on-read](../part5-capstone/case-verify-on-read.md)

## W

**waste ratio** — The complement of the signal-to-noise ratio: the fraction of delivered tokens the task never needed. → [Why raw context is wasteful](../part2-context/why-raw-context-fails.md)

**weights** — The billions of numeric parameters fixed when training ended; at generation time they are read-only constants. A model's output is arithmetic over weights plus context — nothing else participates. → [What an LLM actually does](../part1-fundamentals/what-llms-do.md)

## Z

**zero-shot prompting** — Prompting with the instruction alone, no worked examples; contrast few-shot prompting. → [Prompting basics](../part1-fundamentals/prompting-basics.md)
