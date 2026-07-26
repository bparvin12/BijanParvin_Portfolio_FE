# /architecture-review

Review code against the project's architecture principles and boundaries.

## Input

Scope (optional -- defaults to recent changes): $ARGUMENTS

## Instructions

1. Read `docs/PROJECT_PLAN.md` and `CLAUDE.md` for the canonical architecture.

2. Determine scope:
   - No arguments: review recent git changes.
   - A directory or module: review that area.
   - "full": review all of `src/`.

3. Verify the three service boundaries:

   **Engine** (`src/engine/`):
   - Contains ONLY pure functions. No I/O, no HTTP, no DB, no provider imports.
   - All financial math is here, not in routes/actions/AI tools.
   - Inputs and outputs are plain TypeScript types.

   **Provider Abstraction Layer** (`src/providers/`):
   - Is the SOLE consumer of external APIs.
   - All adapters implement a shared interface.
   - Caching is handled here with proper TTLs.
   - No business logic -- just fetch, normalize, cache.

   **AI Orchestrator** (`src/ai/`):
   - Uses ONLY registered tools to affect the system.
   - Never does arithmetic or invents figures.
   - Tool inputs/outputs are Zod-validated.

4. Check cross-cutting concerns:
   - Zod validation at all boundaries (API routes, server actions, tool I/O).
   - Owner-scoping on all per-user data.
   - No direct DB or provider access from components or routes.
   - Server actions in `src/server/`, not inline in components.

5. Output:
   - **Violations**: Boundary crosses or principle violations with file:line.
   - **Drift**: Areas where implementation diverges from PROJECT_PLAN.md.
   - **Recommendations**: Suggestions to improve alignment.
   - **Verdict**: ALIGNED, MINOR_DRIFT, or NEEDS_CORRECTION.
