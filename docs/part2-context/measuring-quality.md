# Measuring context quality

The previous three chapters each promised the same thing: fewer [tokens](../part1-fundamentals/tokens.md), same usefulness.

[Retrieval](rag-for-code.md) picks the right files. [Structural minimization](structural-minimization.md) shrinks them. [Persistent memory](persistent-memory.md) replaces re-discovery with stored facts.

Every one of those claims has a cheap half and an expensive half.

By the end of this chapter you will be able to score curated context against a checklist of atomic facts. You will be able to use a model as a scalable grader without trusting it blindly, and apply four accounting rules that separate a measurement from a marketing number.

## Compression is trivial, lossless enough is the discipline

Deleting tokens is the easy half.

Truncating a file after 100 lines "compresses" it by any percentage you like. So does deleting every other word. A compression figure on its own is not evidence of anything.

**Compression ratio**, as used on this site, is the fraction of the original input's tokens that a transform removed. So 10,000 tokens in and 7,000 delivered is 30% compression.

The expensive half is showing that what survived still does its job. That the compression was *lossless enough* for the task at hand.

So quality claims come in pairs: how much was removed, and how much a reader of the result can still get right. The rest of this chapter builds the second number.

## Judging with a model

Some evaluations have a mechanical oracle. A unit test passes or it does not.

This question has no such oracle: "does this shrunken file still contain what a developer needs in order to answer *how does login validate requests?*" And human review does not scale to every commit.

**LLM-as-judge** is the standard workaround. A separate model call, constrained by a written rubric, labels outputs that have no mechanical oracle.

The rubric is the load-bearing part.

"Rate this context 1 to 10 for usefulness" produces drifting, unauditable scores. "Is the following fact stated or directly implied by this text — yes or no?" produces labels you can spot-check by hand.

The technique has a famous failure mode. **Verbosity bias** is the tendency of judge scoring to favor longer text, regardless of its content.

For compression evals this is exactly the wrong defect to have. The uncompressed baseline is longer *by construction*. So an unguarded judge systematically flatters it, and every compressor looks worse than it is.

The guards are structural. Ask per-fact binary questions instead of holistic scores. Word the rubric to reward presence of content rather than fluency. And hand-check a sample of labels.

!!! note "Settled"
    Judge models favoring longer outputs is a finding replicated across models and years. It is not a quirk of one system. Treat verbosity bias as a property of the technique, and design every rubric around it.

When should you trust a judge? Three tests.

The questions are binary and atomic. A hand-checked sample of its labels agrees with yours. And the judge model plus rubric are pinned and versioned, so scores from different runs can be compared.

Whether the judge "understands" the rubric is the wrong question. The useful one is whether its labels agree with careful human labels often enough to stand in for them. See the operational definitions in [what an LLM actually does](../part1-fundamentals/what-llms-do.md).

## Key-point recall

**Key-point recall** is the fidelity measure this site pairs with compression.

Break the ideal answer to each question into atomic facts. Have the judge label every fact as supported or unsupported by the context under test. Then report recall: supported facts divided by total facts.

An atomic fact is a single checkable statement, small enough that a yes-or-no label is honest.

```yaml
# One eval case (illustrative)
question: "How does login validate a request?"
key_points:
  - "ValidateRequest checks the session token before the password"
  - "Expired tokens return AUTH_EXPIRED, not a generic error"
  - "Validation failures are logged with the request id"
```

A worked micro-example. An ideal answer breaks into five facts. The compressed context supports four of them, and it is 40% smaller than the original.

Report the pair: *0.80 recall @ 40% compression*. Never report either number alone.

Plotted across configurations, the pair traces a frontier. Recall tends not to fall smoothly as compression rises. It holds, then drops off a cliff — because the facts that die first live inside whatever the transform deleted wholesale.

Two configurations where neither beats the other are both legitimate. Choosing between them is a budget decision, not a correctness decision.

## Four rules of honest accounting

A harness produces numbers. These rules decide whether the numbers deserve trust.

!!! note "Rule 1 — Measure the shipped artifact"
    If the harness imports the tool's internals as a library, it measures a program users never run. Transport framing, serialization, configuration, and packaging are all skipped.

    For an [MCP server](../part3-mcp/index.md), that means the harness spawns the real binary and talks to it over [stdio](../part3-mcp/transports.md), exactly as an IDE client would.

```mermaid
flowchart LR
    Y["YAML eval cases<br/>(question + key points)"] --> H[Eval harness]
    H -->|spawns| S["Real server binary<br/>subprocess over stdio"]
    S -->|tool results| H
    H -->|"context + facts"| J["Judge model<br/>rubric, binary labels"]
    J -->|supported / unsupported| R["Report<br/>recall @ compression"]
    R --> G{CI regression gate}
    G -->|scores hold| P[Merge]
    G -->|scores drop| F[Build fails]
```

!!! note "Rule 2 — Publish the unflattering numbers"
    A benchmark page containing only wins is indistinguishable from marketing.

    A harness that can produce bad news — and a team that publishes it — is what makes the good news credible.

!!! note "Rule 3 — Gate regressions, and fail closed"
    **Fail-closed** means that when a check fails or cannot run, the pipeline stops rather than continuing with a warning.

    Applied to evals: if recall drops below the recorded baseline, the build fails. A gate that only warns is a gate everyone learns to walk around.

!!! note "Rule 4 — State your non-claims"
    An **honest non-claim** is an explicit statement that some plausible-sounding benefit was not measured, and is therefore not claimed.

    It marks the boundary of what you know. That is exactly what makes the claims inside the boundary believable.

## In practice: Sankshep

As of 2026-07-18, Sankshep v1.8.0's published benchmark suite is a direct instance of this chapter. It is called `keypoint-recall-v1` and described in its public `docs/benchmarks.md`.

The suite has 8 questions broken into 50 atomic facts, over a real, private C# trading platform, with files ranging from roughly 750 to 37,000 tokens. Claude Opus serves as judge, with a verbosity guard built into the rubric.

Per ADR-0008, the harness drives the real server binary as a subprocess over stdio. The wire protocol is also the test interface.

The flagship numbers, verified 2026-07-18, by [minimization level](structural-minimization.md):

| Level | Key-point recall | Compression |
| --- | --- | --- |
| Conservative | 0.94 | 19.1% |
| Balanced | 0.94 | 30.4% |
| Aggressive | 0.11 | 87.9% |

```mermaid
xychart-beta
    title "Recall (line) vs compression (bars), verified 2026-07-18"
    x-axis ["Conservative", "Balanced", "Aggressive"]
    y-axis "Fraction (0 to 1)" 0 --> 1
    bar [0.191, 0.304, 0.879]
    line [0.94, 0.94, 0.11]
```

The headline is Balanced. It holds Conservative's 0.94 recall while compressing about 11 points more.

Aggressive's 0.11 is lossy by design, and published anyway. That is rule 2 in action.

On the largest file in the suite, around 37,000 tokens, recall was 1.00 at 35 to 37% compression. The file that needed compression most lost nothing.

Two more honest-accounting details.

First, a published trade-off. In a composed-versus-naive eval, naive context scored 0.96 recall against 0.63 for the composed prompt, at a 32.6% token reduction. An unflattering pair, printed rather than hidden.

Second, per ADR-0017, savings reports compare against delivered files only. Never against everything-in-scope divided by budget. Dollar figures were deleted from reports entirely, on the grounds that "a ratio whose numerator and denominator come from different universes is not a measurement."

And the honest non-claim. "Roundtrips avoided" — the idea that better context saves whole [agent-loop rounds](../part4-agents/cost-efficiency.md) — is explicitly not measured, so it is not claimed. The full story is in the capstone: [case study — measure what you ship](../part5-capstone/case-measure-what-you-ship.md).

## Checkpoints

1. A vendor advertises "up to 90% context compression" with no other numbers. Why does this tell you nothing yet?

    ??? success "Answer"
        Deleting tokens is trivial. Truncation achieves any ratio you like.

        A compression figure only means something when paired with a fidelity measure on the same artifact, such as key-point recall. Then you can see what the deletion cost.

2. An eval breaks ideal answers into 40 atomic facts. For configuration A, the judge marks 34 supported and the context is 45% smaller. Configuration B supports 36 facts at 20% smaller. Compute both pairs. Is either strictly better?

    ??? success "Answer"
        A is 0.85 recall @ 45% compression. B is 0.90 recall @ 20% compression.

        Neither wins outright. A compresses more, B preserves more. They are two points on a frontier, and choosing between them is a budget decision, driven by how much recall the task can afford to lose.

3. What is verbosity bias, and why is it especially dangerous in a compression eval?

    ??? success "Answer"
        Verbosity bias is a judge's tendency to score longer text higher regardless of content.

        In a compression eval, the uncompressed baseline is longer by construction. So an unguarded judge systematically flatters the baseline, and every compressor looks worse than it is.

        The standard guards are per-fact binary questions, and rubric wording that rewards presence rather than fluency.

4. Why should an eval harness spawn the real server binary as a subprocess, instead of importing its internals as a library?

    ??? success "Answer"
        Importing internals measures a program users never run. Serialization, transport framing, configuration, and packaging are all skipped, and bugs in any of them stay invisible.

        Spawning the shipped binary over its real transport measures the artifact users actually get.

5. A tool's published benchmarks include a mode that scores 0.11 recall. Why can that number *increase* your trust in the mode that scores 0.94?

    ??? success "Answer"
        It proves the harness can produce bad news, and that the authors publish it.

        A measurement that can fail — and visibly did, for the lossy-by-design mode — is a real instrument. The flattering number came from that same instrument.

## Try it

Hand-compute your own recall-at-compression pair. No harness required.

1. Pick a source file you know well, roughly 150 to 400 lines.
2. Write three questions a teammate might plausibly ask about it. Break the ideal answers into 12 to 20 atomic facts, one checkable statement each.
3. Make a signatures-only copy. Delete every function body. Keep signatures, types, and doc comments.
4. Estimate tokens for both versions. The tiktoken script from [tokens](../part1-fundamentals/tokens.md) works, or use characters divided by four. Compression is 1 − (compressed ÷ original).
5. Now act as your own judge. For each fact, mark it supported or unsupported using *only* the signatures-only copy. Recall is supported ÷ total.
6. Report the pair, for example "0.65 recall @ 55% compression". Then look at *which* facts died.

    If most of them describe behavior that lived inside function bodies, you have just rediscovered the case for query-targeted collapse from [structural minimization](structural-minimization.md).
