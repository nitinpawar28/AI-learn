# Further reading

Every chapter on this site cites its sources inline. This page collects them in one place: the specifications, papers, and official documents the curriculum stands on, grouped by the part they support. Each entry says why it is worth your time and carries the date it was last checked.

Two rules govern the list. First, every fast-moving fact on this site — a context-window size, a protocol revision, a package version — is owned by exactly one chapter; this page points you at the source, and the owning chapter states what was true on the verification date. Second, the list is deliberately short: primary sources and official documentation only, no aggregators or commentary.

## Part 1 — LLM fundamentals

### Counting tokens

- [tiktoken](https://github.com/openai/tiktoken) — OpenAI's open-source tokenizer library; the quickest way to count [tokens](../part1-fundamentals/tokens.md) locally, and the library behind the hands-on exercise in [Tokens and tokenization](../part1-fundamentals/tokens.md). *Verified 2026-07-18.*
- [Anthropic token counting](https://docs.anthropic.com/en/docs/build-with-claude/token-counting) — the official token-counting endpoint for Claude models; [Tokens and tokenization](../part1-fundamentals/tokens.md) explains when you need an endpoint instead of a local library. *Verified 2026-07-18.*

### Context windows

- [Claude models overview](https://docs.anthropic.com/en/docs/about-claude/models) — Anthropic's official model listing, including [context-window](../part1-fundamentals/context-windows.md) sizes; [The context window](../part1-fundamentals/context-windows.md) is the owning chapter for every figure this site quotes. *Verified 2026-07-18.*
- [OpenAI models](https://platform.openai.com/docs/models) — the equivalent listing for the GPT family. *Verified 2026-07-18.*
- [Gemini models](https://ai.google.dev/gemini-api/docs/models) — the equivalent listing for the Gemini family. *Verified 2026-07-18.*

### Long context, measured

- [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172) — Liu et al., TACL 2024. The canonical result behind the U-curve in [The context window](../part1-fundamentals/context-windows.md): material placed mid-context is used worst. Read it before trusting any "just paste everything in" workflow. *Verified 2026-07-18.*
- [RULER: What's the Real Context Size of Your Long-Context Language Models?](https://arxiv.org/abs/2404.06654) — a synthetic benchmark suite whose recurring finding is that the effective context length is often shorter than the advertised window. *Verified 2026-07-18.*
- [HELMET: How to Evaluate Long-Context Language Models Effectively and Thoroughly](https://arxiv.org/abs/2410.02694) — application-shaped long-context evaluation; complements RULER's synthetic tasks with realistic ones. *Verified 2026-07-18.*
- [NoLiMa: Long-Context Evaluation Beyond Literal Matching](https://arxiv.org/abs/2502.05167) — long-context performance drops sharply when the question and the relevant passage share little vocabulary, so literal string matching can no longer carry the task. *Verified 2026-07-18.*

### Embeddings

- [Sentence Transformers](https://sbert.net) — the Python library used in the hands-on in [Embeddings and similarity](../part1-fundamentals/embeddings.md); its documentation covers pooling, normalization, and similarity search in practical terms. *Verified 2026-07-18.*

## Part 2 — context engineering

- [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — Anthropic's engineering guidance; it names "context rot" and makes the vendor's own case for the thesis of [Part 2](../part2-context/index.md): curate the window, don't fill it. *Verified 2026-07-18.*

The measured numbers in Part 2 — recall held against compression — come from Sankshep's benchmark summary rather than a public web source; [Measuring context quality](../part2-context/measuring-quality.md) presents them together with the method and its caveats.

## Part 3 — MCP

### The specification

- [MCP specification, revision 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25) — the stable revision this site teaches. It is shorter than its reputation suggests; read it after [The wire protocol](../part3-mcp/wire-protocol.md) and it will feel familiar. *Verified 2026-07-18.*
- [Changelog for 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/changelog) — what the stable revision changed relative to its predecessor; the fastest way to see the protocol's direction of travel. *Verified 2026-07-18.*
- [Draft changelog](https://modelcontextprotocol.io/specification/draft/changelog) — the changes queued for the next revision. As of 2026-07-18 this documents the release candidate dated 2026-07-28; [What problem MCP solves](../part3-mcp/why-mcp.md) owns the status facts. *Verified 2026-07-18.*
- [Versioning policy](https://modelcontextprotocol.io/specification/versioning) — how MCP names revisions and which one is current; consult it before trusting a version string in any tutorial, including this site. *Verified 2026-07-18.*
- [Transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) — the normative text behind [Transports](../part3-mcp/transports.md), including the stdio rules that turn one stray print statement into a protocol failure. *Verified 2026-07-18.*

### Governance

- [MCP joins the Agentic AI Foundation](https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/) — the project's own account of its December 2025 move to vendor-neutral governance. *Verified 2026-07-18.*
- [Linux Foundation announcement](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) — the founding press release for the Agentic AI Foundation, with the full list of founding projects and members. *Verified 2026-07-18.*

### SDKs

- [Official SDKs index](https://modelcontextprotocol.io/docs/sdk) — the complete SDK list with tier classifications; the tier system is introduced in [What problem MCP solves](../part3-mcp/why-mcp.md). *Verified 2026-07-18.*
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) — Tier 1; the SDK behind the TypeScript tabs in [Build your own MCP server](build-your-own.md). *Verified 2026-07-18.*
- [Python SDK](https://github.com/modelcontextprotocol/python-sdk) — Tier 1; the primary SDK of the walkthrough in [Build your own MCP server](build-your-own.md). *Verified 2026-07-18.*
- [C# SDK](https://github.com/modelcontextprotocol/csharp-sdk) — Tier 1; the SDK discussed in [Writing an MCP server](../part3-mcp/writing-a-server.md), and the one Sankshep confines behind its dependency fence. *Verified 2026-07-18.*
- [Go SDK](https://github.com/modelcontextprotocol/go-sdk) — Tier 1; the fourth first-tier SDK. *Verified 2026-07-18.*
- [`ModelContextProtocol` on NuGet](https://www.nuget.org/packages/ModelContextProtocol) — the C# SDK's package page; its version history is the living evidence examined in [the dependency fence case study](../part5-capstone/case-dependency-fence.md). *Verified 2026-07-18.*

### Clients

- [VS Code: MCP servers](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) — the official configuration docs for the one client whose format differs from the other three; [Connecting servers to IDEs](../part3-mcp/ide-integration.md) explains the difference and its symptom. *Verified 2026-07-18.*
- [Claude Code: MCP](https://code.claude.com/docs/en/mcp) — the official server-configuration docs for Claude Code. *Verified 2026-07-18.*
- [Claude Desktop: MCP quickstart](https://modelcontextprotocol.io/quickstart/user) — the protocol project's user quickstart, which doubles as Claude Desktop's configuration guide. *Verified 2026-07-18.*
- [Cursor documentation](https://cursor.com/docs) — Cursor's documentation home; its MCP pages cover the fourth configuration format in [Connecting servers to IDEs](../part3-mcp/ide-integration.md). *Verified 2026-07-18.*
- [Official reference servers](https://github.com/modelcontextprotocol/servers) — small, readable server implementations, including the filesystem server used in the hands-on in [Connecting servers to IDEs](../part3-mcp/ide-integration.md); good code to read after [Build your own MCP server](build-your-own.md). *Verified 2026-07-18.*

## Part 4 — agents

### Tool platforms and pricing

- [OpenAI function calling guide](https://platform.openai.com/docs/guides/function-calling) — the platform documentation behind the tool-count limits and guidance discussed in [Tool calling in depth](../part4-agents/tool-calling.md). *Verified 2026-07-18.*
- [Anthropic tool use](https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview) — Anthropic's tool-calling documentation, including on-demand tool discovery; the counterpart platform view. *Verified 2026-07-18.*
- [Anthropic pricing](https://docs.anthropic.com/en/docs/about-claude/pricing), [OpenAI pricing](https://platform.openai.com/docs/pricing), and [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) — the pages [Cost and efficiency](../part4-agents/cost-efficiency.md) links instead of hardcoding numbers; when a dollar figure matters, check these, not a blog post. *Verified 2026-07-18.*

### Authorization

- [MCP authorization](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization) — the normative text behind the auth model in [Safety and judgment](../part4-agents/safety.md): the server as an OAuth 2.1 resource server, and why token pass-through is forbidden. *Verified 2026-07-18.*
- [RFC 8707: Resource Indicators for OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc8707) — the mechanism that binds a token to the server it was issued for; short, and the heart of the confused-deputy defense. *Verified 2026-07-18.*
- [RFC 9728: OAuth 2.0 Protected Resource Metadata](https://datatracker.ietf.org/doc/html/rfc9728) — how a client discovers a protected server's authorization server in the first place. *Verified 2026-07-18.*

## Part 5 — capstone

Part 5 is grounded differently from the rest of the site. Its evidence base is Sankshep's own architecture decision records and its published benchmark summary, discussed throughout the case studies, with the facts verified against the project on 2026-07-18. Sankshep's source is private — [The running example](../part0-orientation/running-example.md) explains the arrangement and the redaction rule this site follows — so there is no repository to link.

The external documents that matter most to Part 5 already appear above: the MCP specification (the surface Sankshep implements), the C# SDK and its NuGet package page (the churn behind [the dependency fence](../part5-capstone/case-dependency-fence.md)), and the long-context research that motivates minimization in the first place. [How to read the capstone](../part5-capstone/index.md) sets out the template the case studies share.

## The tools behind this site

- [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) — the documentation framework this site is built with; its documentation is worth reading as a model of clear technical writing even if you never build a docs site. *Verified 2026-07-18.*

!!! warning "Evolving — verified 2026-07-18"
    This site pins `mkdocs-material` 9.7.7. Material entered maintenance mode in November 2025 — its maintainers' successor project is named Zensical — with patch releases expected through roughly November 2026. This changes quickly; check [the MkDocs Material site](https://squidfunk.github.io/mkdocs-material/) for current values.

!!! note "Settled"
    The Mermaid diagrams on this site render through Material's built-in `pymdownx.superfences` custom-fence mechanism — the officially recommended approach — with no separate Mermaid plugin involved.

tiktoken and Sentence Transformers, listed under Part 1, are also the libraries behind this site's hands-on exercises. And if you want to put all of these sources to work rather than just read them, [Build your own MCP server](build-your-own.md) is the page where reading turns into typing.
