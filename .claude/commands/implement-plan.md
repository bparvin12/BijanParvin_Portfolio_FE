# /implement-plan

Execute an approved implementation plan step by step.

## Input

Plan name or task ID: $ARGUMENTS

## Instructions

1. **Locate the plan.** Look for a matching file in `.claude/_plans/`:
   - If $ARGUMENTS is a filename (e.g. `M1-02-prettier-editorconfig.md`), read
     `.claude/_plans/$ARGUMENTS`.
   - If $ARGUMENTS is a task ID (e.g. `M1-02`), find the plan file in
     `.claude/_plans/` whose name starts with that ID.
   - If no plan file is found, read `docs/TASKS.md` for the task's acceptance
     criteria and file list, then ask the user if they want to create a plan
     first with `/plan-feature`.

2. Read `CLAUDE.md` and `docs/PROJECT_PLAN.md` for current conventions and
   architecture.

3. Mark the task as `[~]` in progress in `docs/TASKS.md`.

4. Implement the plan ONE step at a time:
   - Read every file you intend to modify BEFORE making changes.
   - Follow existing patterns and conventions in the codebase.
   - Write tests alongside or immediately after production code.
   - Keep changes minimal and focused. No unrelated refactors.

5. After each logical step, verify:
   - `npx tsc --noEmit` passes (TypeScript strict).
   - `npm run lint` passes.
   - Any new tests pass.

6. When implementation is complete:
   - Run the full check suite: typecheck, lint, and build.
   - Mark the task `[x]` done in `docs/TASKS.md`.
   - Update the plan file status from `Planned` to `Implemented`.
   - Update `CLAUDE.md` status section (last completed task + next task ID).
   - Update `docs/PROJECT_PLAN.md` if any architectural decisions changed,
     new technology was introduced, or the plan's assumptions no longer hold.
     Keep sections like tech stack, folder structure, and database design current.
   - Report: what changed, why, any risks, and the next task ID.

7. Do NOT commit unless the user asks. Leave that for `/pre-commit` or explicit
   request.
