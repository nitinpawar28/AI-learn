# AI-learn

A practical, diagram-heavy curriculum: **LLMs → embeddings & retrieval → the Model Context Protocol (MCP) → agents → real-server architecture.**

📖 **Read the site: <https://nitinpawar28.github.io/AI-learn/>**

AI-learn teaches modern AI engineering progressively, from "what is a token?" to "I understand how and why a production MCP server is built the way it is." Every concept is taught generically first, then grounded in a real system: [Sankshep](https://github.com/nitinpawar28), a C#/.NET token-minimizing, memory-augmented codebase-context MCP server, appears throughout as a recurring, conceptual case study. Every mechanism gets a Mermaid diagram; every chapter ends with checkpoints; fast-moving facts are web-verified and dated.

## Curriculum

| Part | What it covers |
|------|----------------|
| 0. Orientation | What the site is, the running example, and a one-page map of everything |
| 1. LLM fundamentals | Tokens, next-token prediction, context windows, embeddings, prompting |
| 2. Context engineering | Why raw context is wasteful; retrieval, structural minimization, persistent memory, and measuring quality |
| 3. MCP | The problem MCP solves, its primitives, transports, the wire protocol, writing servers, and IDE integration |
| 4. Agents | The agent loop, tool calling, subagents and orchestration, grounded prompting, cost, and safety |
| 5. Capstone | Anatomy of a real MCP server: architecture plus seven engineering-judgment case studies |
| 6. Reference | Glossary, further reading, and a build-your-own minimal MCP server walkthrough |

## Local development

```bash
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt   # (macOS/Linux: .venv/bin/python)
.venv/Scripts/python -m mkdocs serve                      # http://127.0.0.1:8000/
.venv/Scripts/python -m mkdocs build --strict             # what CI runs
```

## Deployment

Pushing to `main` triggers a GitHub Actions workflow that builds the site with `mkdocs build --strict` and deploys it via the native GitHub Pages artifact flow (Pages source: "GitHub Actions").

> **Tooling note (as of 2026-07-18):** this site is built on mkdocs-material 9.7.x, which entered maintenance mode in November 2025 (its successor, "Zensical," is in development; patches are expected through roughly November 2026). The version is pinned in `requirements.txt`.

## Custom domain (optional)

With the Actions-based deploy flow there is no `CNAME` file to commit — set a custom domain in **Settings → Pages**, then update `site_url` in `mkdocs.yml` to match.

## License

Prose content is licensed [CC BY 4.0](LICENSE). Code snippets in the tutorials may be used freely.
