# Writing for AI-learn

The conventions an author needs. [`docs/index.md`](docs/index.md) explains the same devices to
*readers*; this file is the contract for whoever is adding or editing a page.

## Why this file exists

The binding version of these conventions lived in a planning document outside the repository, and
**it is gone** — no copy, no backup, never tracked. Two appendices went with it: the writing
conventions, and the ground truth for every Sankshep fact on this site.

This file reconstructs what can be honestly reconstructed: the conventions the site visibly and
consistently follows, plus the sourcing rule. It is tracked so that it cannot vanish a second time.
Where it is a reconstruction rather than a recovered rule, it says so.

Do not spend time searching for the original. It has been looked for.

## Sourcing Sankshep facts

Sankshep is a **private** repository. A reader cannot open it, so a claim a reader cannot check is
not usable here.

**Source every Sankshep fact from the public documentation**, <https://nitinpawar28.github.io/sankshep-docs/>,
and cite it where the fact would otherwise look like an assertion.

That sets an order, and getting it backwards produces a page that contradicts its own source:

1. **`sankshep-docs` is updated first**, after a release is tagged and published.
2. **AI-learn follows**, from the published page rather than from the private source.

Updating this site from the private repository makes it cite a public source that disagrees with it.
This has happened; it is the reason the rule is written down.

## Dated facts

Anything that moves — model behaviour, context sizes, protocol revisions, package versions, published
benchmark numbers — carries the date it was checked:

```markdown
!!! warning "Evolving — verified 2026-09-20"
    The claim, and what would change it. Link the official source. Where this site and the source
    disagree, the source wins.
```

Use `!!! note "Settled"` for the opposite case: a fact that *looks* like it should churn and does not.
It tells a reader they need not re-check, which is worth as much as a warning.

## The admonition vocabulary

Four blocks, each with one job. Using the wrong one is a content bug, not a styling one.

| Block | For |
|---|---|
| `!!! warning "Evolving — verified <date>"` | A fact with a shelf life |
| `!!! note "Settled"` | A fact that looks volatile and is not |
| `!!! failure "Common misconception"` | A believable belief, quoted in the reader's own words, then dismantled |
| `??? info "Going deeper — …"` | The layer underneath. **Collapsed, and always optional** |

The `??? info` rule is strict: every chapter must be complete with all of them closed. If a point only
lands when a deeper block is open, it belongs in the body.

## One fact, one owning page

A fact is explained **once**, on the page that owns it. Every other page links to that page instead of
restating it.

This is the convention most often broken, and the damage is delayed: a restated fact is a second copy
that nobody remembers to update, so the site starts disagreeing with itself. When you find yourself
explaining something a chapter already covers, link it and move on. When correcting a fact, search the
whole site for restatements — `grep -rn` on a distinctive phrase — and either fix or de-duplicate them.

## Page shape

Chapters run: what you will be able to do → the body → `## Checkpoints` → `## Try it`.

The seven capstone case studies run the template from
[the capstone index](docs/part5-capstone/index.md): context → decision → alternatives → tradeoffs →
what would change it → `## Checkpoints` → `## Try it`.

**"What would change it" is not optional.** A decision record with no flip condition is advocacy. State
the measurable condition that would reverse the call, and if a flip condition has since fired, say so on
the page rather than quietly editing the recommendation.

**`## Try it` is hands-on and runnable without Sankshep.** The reader cannot open that repository, so an
exercise that depends on it is not an exercise.

## Diagrams

Every mechanism worth teaching gets a Mermaid diagram — the site's defining feature, and the reason a
chapter is worth reading rather than skimming. If a sequence of events matters, draw it.

Charts (`xychart-beta`) carry real measured values. When the numbers change, the chart's arrays and its
title's date change with them; a refreshed table above a stale chart is the easiest inconsistency to ship.

## Numbers

Any published number carries its **date**, its **source**, and — where a model or a human did the
scoring — its **error bar**. A judged score quoted to two decimals with no spread implies a precision
the instrument does not have. Arithmetic (tokens, bytes, timings) repeats exactly and can be quoted
plainly; say which kind a number is when a page mixes both.

## Before opening a pull request

```bash
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt   # macOS/Linux: .venv/bin/python
.venv/Scripts/python -m mkdocs build --strict             # what CI runs; a bad link fails the build
```

`--strict` turns a broken internal link into a failure, so run it before pushing. New pages go into
`mkdocs.yml`'s `nav` or they ship unreachable.
