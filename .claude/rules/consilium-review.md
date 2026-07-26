# Consilium Review — Pre-PR Adversarial Multi-Agent Review

**PREREQUISITE**: Read [no-assumptions.md](no-assumptions.md) and [code-review.md](code-review.md). The consilium is the multi-agent extension of those — every finding must be PROVEN by running the real code, and the orchestrator verifies load-bearing findings itself.

---

## The Principle

Before opening a PR for **substantive** work, convene a **consilium**: a panel of **N independent reviewers (default 3)**, each attacking the change from a **distinct point of view**, spawned **in parallel** as isolated agents. Consolidate their findings, fix the real ones, **then** open the PR.

A single reviewer — human, or the automated GitHub "Claude Code review" — tends to validate that the diff is internally clean. It rarely catches the class of defect where **the change is internally correct but solves the wrong problem**: it patches a code path the feature doesn't actually use, mislabels fallback output, or ships a test that doesn't exercise the surface that was broken. Independent adversaries with different lenses catch these because each is looking for a different failure mode and none is invested in the change being "done."

This is not a substitute for [code-review.md](code-review.md) (one strict senior-engineer pass) or [address-pr-feedback.md](../commands/address-pr-feedback.md) (the post-push GitHub review loop). It runs **before** the PR exists, and it is adversarial and plural by design.

---

## When It Applies

Run a consilium at the **end of a working session, before creating the final PR**, for any change that is more than mechanical:

- New feature, bug fix, or refactor touching real logic
- Anything that changes a data flow, an integration boundary, a shared utility, a search/ranking path, a guardrail, or money/price/safety logic
- Anything where "looks right in the diff" and "actually fixes the reported problem" can diverge

**Skip it** (a single `/code-review` is enough) for: typo/comment/doc-only edits, version bumps, dependency pins, generated-file updates, or a one-line change with an obvious blast radius.

**Scale N to the blast radius:** 3 for a normal fix; 4–5 (add a security/data lens and a completeness lens) for a large feature, a security-sensitive change, or anything touching pricing, auth, PII, or guardrails.

---

## How the Consilium Works

1. **Gather the change + its intent.** Diff vs `main`, changed files, the ticket/AC, and — critically — a one-paragraph statement of *what the change is supposed to fix or do*. The reviewers need the intended behavior to judge whether the diff achieves it.

2. **Derive distinct POV lenses from the change.** Don't reuse a fixed checklist — pick the lenses that fit *this* diff. A solid default trio for code changes:
   - **Correctness & regressions** — edge cases, null/empty, boundary values; does it break existing behavior or the existing tests/eval datasets? Does it do what the ticket actually says?
   - **Integration & "right code path"** — does the change reach the code path / tool / caller the feature *actually* uses at runtime? All consumers across the boundary (frontend ↔ BFF ↔ service, LLM tool-routing, callers of a shared util)? Cross-ticket regressions? This lens catches the "fixed the wrong tool" class.
   - **Tests & completeness** — do the tests exercise the *real failure surface* (not just the part that already worked)? Coverage gaps, still-broken input shapes, honest labeling / UX, narrative↔data consistency.
   - *(Add for sensitive changes)* **Security / data / safety** — secrets, injection, PII, authz, cache poisoning, money math, clinical/safety correctness.

3. **Spawn N independent reviewers in parallel — read-only.** One message, multiple `Agent` calls, `run_in_background: true`. Each reviewer:
   - Gets only the diff + intent + its single lens (independent — no shared running commentary).
   - Works in its **own isolated worktree** and is strictly **read-only**: it must NOT edit, push, or comment on the PR/GitHub. It reports back only.
   - **PROVES findings by running the real code/tests** (per no-assumptions) — execute the function over a battery, run the suite, diff against base. Reason-only claims are marked "suspected", executed claims "proven".
   - Returns a structured block: **Verdict** (SHIP / FIX-NEEDED / RISKY), **Real defects** (each with severity + `file:line` + proven-vs-suspected), **Regressions**, **Nits**.

4. **Consolidate — and verify load-bearing findings yourself.** Dedupe across reviewers, rank by severity, separate real defects from nits. **Do NOT take a reviewer's word on a CRITICAL/load-bearing claim** — the orchestrator independently re-verifies it (read the code, run the case) before acting. (Reviewers can be wrong too; a consolidated verdict is only as good as its proven core.)

5. **Fix-round.** Address the real findings — typically a dedicated fix agent on an isolated worktree (see the worktree pattern in the team's notes). Re-run the relevant lens (or the whole consilium) if a CRITICAL was fixed, since fixes can introduce new issues.

6. **Then open the PR.** Cite the consilium in the PR body (lenses run, what was found, what was fixed). After the push, the GitHub "Claude Code review" + [`/address-pr-feedback`](../commands/address-pr-feedback.md) handle the automated review loop — the consilium has already removed the substantive defects that loop would otherwise miss.

The executable workflow lives in [`/consilium`](../commands/consilium.md).

---

## Guardrails

- **Reviewers are read-only.** Never let a review agent edit code, push, merge, or resolve/comment on PR threads. Reviews report; fixes happen in a separate, explicit fix-round.
- **Never merge from the consilium.** It gates PR *creation*, not merge. Merge still needs the normal 2 approvals (see [git-workflow.md](git-workflow.md)).
- **Verify before you act.** Independently confirm any CRITICAL finding before spending a fix-round on it.
- **No silent scope creep.** If a finding implies a scope/design change (not a mechanical fix), surface it to the user and decide together — don't quietly redesign.
- **Scale, don't ritualize.** Three real adversaries beat ten box-checkers. Pick lenses that genuinely stress *this* change; skip the consilium entirely for trivial diffs.

---

## Why This Exists (real example)

On UG-9815 (chatbot budget search), the initial fix was internally clean: the GitHub "Claude Code review" **APPROVED** it with zero actionable items, and a topic-stripping adversary returned SHIP. But a 3-POV consilium ran in parallel, and the **integration / "right code path"** lens proved — by code-trace — that the system prompt routes the failing query to `search_bedrock_kb`, the one tool the fix never touched, so the fix would not have resolved the QA failure. A second lens proved a fallback mislabeled off-category products (a narrative↔data regression). Both were fixed *before* the PR went up for human approval. A single reviewer would have approved a PARTIAL fix.

---

**Last Updated**: 2026-06-17
**Applies To**: All substantive GECOM PRs (chatbot-ai, webapp, BFF, services, infra)
