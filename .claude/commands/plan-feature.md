# /plan-feature

Plan the implementation of a feature before writing any code.

## Input

Feature or task: $ARGUMENTS

## Instructions

1. Read `docs/PROJECT_PLAN.md` and `docs/TASKS.md` to understand the architecture,
   constraints, and where this feature fits in the roadmap.

2. Read `CLAUDE.md` to refresh on development rules and conventions.

3. Explore the codebase to understand:
   - Existing patterns, abstractions, and conventions relevant to this feature.
   - Which files and modules will be affected.
   - What dependencies (other tasks, modules, data) this feature has.
   - What tests exist for related code.

4. Identify risks and open questions:
   - Are there ambiguous requirements? Ask the user to clarify.
   - Are there multiple valid approaches? Present trade-offs.
   - Are there security, performance, or data-integrity concerns?

5. Write a plan covering:
   - **Goal**: One sentence stating what this feature achieves.
   - **Approach**: The chosen strategy and why.
   - **Files to create or modify**: List each file with a brief description of changes.
   - **Key decisions**: Any architectural choices and their rationale.
   - **Testing strategy**: What tests to write and what they verify.
   - **Risks**: Anything that could go wrong or needs follow-up.
   - **Out of scope**: What this feature intentionally does NOT do.

6. **Save the plan** to `.claude/_plans/<TASK_ID>-<short-slug>.md` (e.g.
   `.claude/_plans/M1-02-prettier-editorconfig.md`). Use the task ID from
   `docs/TASKS.md` if available; otherwise use a descriptive slug. Include the
   task ID, status (`Planned`), and creation date in the file header.

7. Present a summary of the plan to the user for approval. Tell the user they
   can implement it with `/implement-plan <plan-filename>` (without the path).

Do NOT write any code during planning. The goal is alignment before effort.
