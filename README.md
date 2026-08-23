# AI-learn

A practical, diagram-heavy curriculum: **LLMs → embeddings & retrieval → the Model Context Protocol (MCP) → agents → real-server architecture.**

📖 **Read the site: <https://nitinpawar28.github.io/AI-learn/>**

AI-learn teaches modern AI engineering progressively, from "what is a token?" to "I understand how and why a production MCP server is built the way it is." Every concept is taught generically first, then grounded in a real system: [Sankshep](https://github.com/nitinpawar28), a C#/.NET token-minimizing, memory-augmented codebase-context MCP server, appears throughout as a recurring, conceptual case study. Every mechanism gets a Mermaid diagram; every chapter ends with checkpoints; fast-moving facts are web-verified and dated.

## Curriculum

| Part | What it covers |
|------|----------------|
| 0. Orientation | What the site is, the running example, and a one-page map of everything |
| 1. LLM fundamentals | Tokens, next-token prediction (attention, the KV cache, sampling knobs), context windows, embeddings and model selection, prompting |
| 2. Context engineering | Why raw context is wasteful; retrieval (hybrid ranking, reranking), structural minimization, persistent memory, and measuring quality |
| 3. MCP | The problem MCP solves, its primitives, transports, the stateless wire protocol (revision 2026-07-28), writing servers, and IDE integration |
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

## The PDF book

The whole curriculum also builds into a single A4 PDF (~311 pages) for printing
or offline reading.

```bash
pip install -r requirements.txt -r requirements-pdf.txt
npm install --prefix scripts        # puppeteer-core + mermaid, ~40 MB
python scripts/build-pdf.py -o AI-learn.pdf
```

The build uses the Chrome already installed on your machine (set `CHROME_PATH`
to override) and takes a couple of minutes. It is driven by `mkdocs-print.yml`,
which inherits `mkdocs.yml` and adds the print plugin plus `docs/assets/print.css`
— the website build is unaffected.

Three things the print pipeline has to fix, which a naive "print to PDF" gets wrong:

| Problem | Fix |
|---|---|
| 158 collapsed `???` blocks — 13% of the book, including every checkpoint answer — print empty | expanded in the DOM before printing, and styled as tinted "Answer" boxes |
| 22 tabbed blocks show only one language | every panel revealed and labelled, so both Python and TypeScript print |
| 77 Mermaid diagrams never render headless (Material lazy-loads Mermaid from a CDN, and destroys the source when that import stalls) | Material's JS bundle is blocked and Mermaid is injected from `node_modules`, so rendering is deterministic and offline |

## Deployment

Pushing to `main` triggers a GitHub Actions workflow that builds the site with `mkdocs build --strict` and deploys it via the native GitHub Pages artifact flow (Pages source: "GitHub Actions").

> **Tooling note (as of 2026-07-18):** this site is built on mkdocs-material 9.7.x, which entered maintenance mode in November 2025 (its successor, "Zensical," is in development; patches are expected through roughly November 2026). The version is pinned in `requirements.txt`.

## Custom domain (optional)

With the Actions-based deploy flow there is no `CNAME` file to commit — set a custom domain in **Settings → Pages**, then update `site_url` in `mkdocs.yml` to match.

## License

Prose content is licensed [CC BY 4.0](LICENSE). Code snippets in the tutorials may be used freely.
