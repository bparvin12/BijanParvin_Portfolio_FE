# /refactor

Safely refactor code with test verification at each step.

## Input

What to refactor and why: $ARGUMENTS

## Instructions

1. Read the target code and all its dependents (files that import it).

2. Read existing tests for the target. If test coverage is insufficient,
   STOP and ask: "Test coverage is thin here. Should I add tests first
   before refactoring?"

3. Read `CLAUDE.md` and `docs/PROJECT_PLAN.md` to verify the refactor
   aligns with architecture principles.

4. Plan the refactor:
   - What changes, in what order.
   - Which files are affected.
   - What the code should look like after.
   - Present the plan and get approval before proceeding.

5. Execute in small, verifiable steps:
   - After each step, run `npx tsc --noEmit` and relevant tests.
   - If a step breaks something, fix it before moving on.
   - Never leave the codebase in a broken intermediate state.

6. After completion:
   - Run the full check suite (typecheck, lint, tests, build).
   - Verify no behavior has changed (unless that was the goal).
   - Update any imports, re-exports, or type references that shifted.

7. Report: what changed, why, before/after comparison, and test results.

Rules:

- Do NOT change public APIs without explicit approval.
- Do NOT combine refactoring with feature work.
- If the refactor scope grows, pause and re-plan.
