# Chatbot Development (UG-8647)

This document covers chatbot-specific development patterns and local setup.

---

## Amplience Mock Data Pattern

When creating mock page data for Amplience, slots must be flat arrays:

```typescript
// ✅ CORRECT - Amplience pattern (flat array)
mainSlot: [
  {
    features: [{ __cms_typename: 'MyFeature', ... }],
  },
]

// ❌ WRONG - Contentful pattern (nested items)
mainSlot: {
  items: [{ features: [...] }],
}
```

The `resolveSlot` utility at `apps/refapp/refapp-amplience/src/http/graphql/utils/resolveSlot.ts` expects a flat array. The `Slot` resolver reads `data.features` directly.

---

## Local Docker Setup (chatbot-ai)

The chatbot AI service runs in Docker locally:

```bash
# From apps/generic/chatbot-ai/
docker-compose up -d
```

- **Source is volume-mounted** (`./src:/app/src`) — code changes are reflected without rebuild
- **uvicorn runs without `--reload`** — container restart is needed after code changes:
  ```bash
  docker-compose restart chatbot-ai
  ```
- Health check: `curl http://localhost:4700/health`

---

## Architecture

- **SSE over HTTP** (not WebSocket) — no WS precedent in codebase
- **BFF proxies chatbot requests** at `/api/v1/chat/message` → chatbot-ai service
- **Webapp rewrites** proxy `/api/v1/chat/:path*` to BFF in Next.js config
- **Feature gated** by `CHATBOT_ENABLED` env var in BFF and `isFeatureProtected('CHATBOT')` in webapp

---

## Pre-PR Lint Check (MANDATORY)

**CRITICAL**: Before creating ANY PR that modifies chatbot-ai Python code, you MUST run ruff linting and formatting checks locally. PRs that fail CI due to lint errors waste deployment cycles (each fix requires merge → release → MACH version bump → deploy).

### Required Commands

Run from the `apps/generic/chatbot-ai/` directory:

```bash
cd apps/generic/chatbot-ai

# 1. Lint check (catches unused imports, undefined names, etc.)
ruff check src tests

# 2. Format check (catches formatting violations)
ruff format --check src tests
```

### Fix Issues Before PR

If either check fails, fix the issues:

```bash
# Auto-fix lint issues where possible
ruff check --fix src tests

# Auto-format code
ruff format src tests

# Re-run checks to confirm all clean
ruff check src tests && ruff format --check src tests
```

### When This Applies

- **Every PR** that touches any `.py` file under `apps/generic/chatbot-ai/`
- Run AFTER all code changes are complete, BEFORE `git commit`
- Both `ruff check` AND `ruff format --check` must pass with zero errors

### Common Issues

| Ruff Code | Description     | Example                               |
| --------- | --------------- | ------------------------------------- |
| F401      | Unused import   | `import json` when json is never used |
| F841      | Unused variable | `x = compute()` but x is never read   |
| E501      | Line too long   | Lines exceeding configured max length |
| I001      | Import sorting  | Imports not in isort-compatible order |

### Why This Matters

Each failed CI run requires a new release cycle:

1. Fix the lint error
2. Create new PR → merge
3. Create new release tag (version bump)
4. Update MACH Composer version
5. Wait for deployment

This wastes 20-40 minutes per cycle. Running ruff locally takes 2 seconds.

---

## Pre-PR Gate (chatbot-ai): invariant TCs first — FULL eval is the DEMOTED safety net

**Do NOT run the ~750-q LLM eval on every PR** — it is slow and token/LLM-cost
expensive. The **per-PR gate is deterministic, ticket-keyed invariants**; the full
merged eval is demoted to a **periodic / broad-blast-radius safety net** (see below).

### Per-PR (MANDATORY): add + run invariant TCs for the developed case(s)

Every substantive `apps/generic/chatbot-ai/` change MUST add or extend a
**ticket-keyed invariant spec** covering its cases, and run it green:

- **Spec:** `src/chatbot_ai/evaluation/invariants/specs/<ticket>.yaml` — multiple TCs,
  **anon + auth**, plus the edge/negative cases the change fixes or could regress.
  ~36 specs already exist as models (e.g. `ug-9861-allergen-exclusion.yaml`,
  `ug-9862.yaml`, `ug-10104-no-internal-output-leaks.yaml`).
- **Run locally against the local stack** (deterministic assertions own the verdict):
  ```bash
  make local-up-agentcore
  python -m chatbot_ai.evaluation.invariants.runner --env local --spec <ticket-id> --output /tmp/inv.json
  #   --env local → http://localhost:4700 ; drop --spec to run the whole suite for the touched area ;
  #   --no-judge = deterministic-only (fastest, no LLM) ; --list = show spec ids ;
  #   anon+auth run by default ; exit code non-zero iff a deterministic failure.
  make local-down
  ```
- Plus unit tests + `ruff check/format`. The SAME suite runs in CI against
  **deployed DEV** (anon+auth) as the UG-10380 release-contract promotion gate — so
  a ticket's committed TCs become permanent, deployed regression protection.

### FULL merged LLM eval — DEMOTED (not per-PR)

Run the full merged eval ONLY for **broad-blast-radius** changes — system/planning
prompt, guardrail / intent-routing, grounding/selection, or KB/price logic spanning
many categories — or as a **periodic baseline**. Rationale: invariants only cover the
cases you wrote TCs for; the full eval is the net that catches **unknown-category**
regressions (the low-scored tail). For a narrow, well-scoped change with solid
invariant coverage, **skip it**. When you DO run it — **all ~750+
questions** (repo datasets + S3 datasets), NOT the default 10/25-question sample —
**review the low-scored tail** for regressions.

The small sample (`make local-eval SAMPLE=25`) is for **fast mid-dev iteration**:
it gives an overall score but has ~1 question per category, so it's noisy and
misses weak spots. A change can pass the sample and still regress a category that
only surfaces across the full set. **The low-scored tail is where regressions
hide.** The FULL eval is the pre-PR gate; the sample is not.

### Required commands

Run against the **reliable agentcore env** (real AgentCore Memory + Bedrock KB +
Nova — `local == deployed`; see [local-development.md](local-development.md) and the
mandatory-local-eval note in the root guidelines):

```bash
cd apps/generic/chatbot-ai

# 1. Bring up the prod-like stack with REAL AgentCore Memory (cross-turn matches DEV)
export $(aws configure export-credentials --profile <your-aws-profile> --format env-no-export)
make local-up-agentcore

# 2. FULL merged eval — repo + S3 datasets (~750+ q). A high SAMPLE runs the whole set.
make local-eval-s3 SAMPLE=2000 CONCURRENCY=8 OUTPUT=data/local-eval/full-results.json

# 3. Inspect the low-scored tail (sort results[] by overall_score ascending)
python3 -c "import json; r=json.load(open('data/local-eval/full-results.json'))['results']; \
[print(round(x['overall_score'],2), x.get('category'), x['prompt'][:80]) \
 for x in sorted(r,key=lambda x:x.get('overall_score',1))[:25]]"

make local-down
```

`local-eval-s3` merges repo + S3 datasets (needs S3 read on `leap-dev-chat-kb`) —
the same source set CI uses. The HTML report (`full-results.html`) shows per-question
scores + judge reasoning.

### What to check before the PR

- **Overall score did not regress** vs the prior baseline (compare to the last
  recorded run / the Confluence "Eval" page).
- **Safety/price invariants hold**: `guardrail_accuracy` steady,
  `text_price_hallucinations_total` not increased, `price_filter_accuracy` steady.
- **The low-scored tail** contains no NEW failures introduced by your change
  (distinguish your change's effect from pre-existing known deflections, e.g.
  out-of-scope / order-account handoffs).

### Why this matters

A full run takes ~30-45 min (real LLMs + Bedrock + judge at concurrency 8), but it
runs entirely on your laptop and catches the regressions the 25-q sample cannot.
The cost of one local full run is far less than shipping a category regression to
DEV/QA and discovering it post-deploy.

---

## Feature-Flag Rollout (two-tier — match the mechanism to blast radius)

How a chatbot-ai change is enabled per environment. Not every change needs a
dark-launch flag with a per-environment activation treadmill. A fully flag-gated
feature costs ~6 PRs (code + flag plumbing in `config.py`/`ecs.tf`/`agentcore_runtime.tf`/compose,
then a MACH flip PR for **each** of DEV/QA/Staging/Prod, then a flag-removal "contract"
PR). The **only** step in that chain that adds safety local testing can't is the
**deployed-DEV validation** — because this bot has a repeated history of local-pass /
deployed-fail (real AgentCore Memory, real BFF↔SSE, concurrency). Keep that step; drop
the rest by default.

**Tier 1 — Default (most changes): ship default-ON, no dark-launch flag.**
Develop → local eval + consilium → merge with the behavior ON → it auto-bumps to DEV →
**validate on the deployed DEV** → normal version promotion (DEV→QA→Staging→Prod) carries
the behavior. No per-env flip PRs, no flag-removal PR. Rollback = revert the code PR.

**Tier 2 — High blast radius only: keep a kill-switch flag, default it ON once proven.**
For safety/guardrails, money/prices, streaming, or anything hard to validate locally —
keep a feature flag, but once locally + DEV-proven, **default it ON** so normal promotion
carries the behavior. The flag is an emergency **kill-switch** (flip OFF via one MACH
variable, no code revert), NOT a per-env activation gate. Delete it lazily. Do **not**
gate the merge on "flag OFF + byte-flat eval" and do **not** require a separate flip PR
per environment. (Example: UG-10427 `single_terminal_generate_enabled` ships `= True`
with terraform `lookup(..., "true")` — a kill-switch defaulted ON.)

**"Ship OFF at merge" (deprecated framing).** The old wording — "flags default OFF at
merge; enable per-env via MACH after eval sign-off" — conflated *"the merge is inert"*
with *"the behavior stays disabled,"* and produced the per-env flip treadmill. It is
superseded by the two tiers above. (Note: DEV `main.yml` already runs most chatbot-ai
flags `"true"` — DEV reality was always "on"; the tax was the extra PRs, not DEV state.)

**PROD is the one hard gate.** Regardless of tier, PROD activation waits for promotion
approval (and, where required, the UG-10380 release-contract promotion gate). Everything
above is about DEV/QA velocity, not PROD. General release mechanics (versioning, MACH,
promotion cadence) live in [release-deployment.md](release-deployment.md).
