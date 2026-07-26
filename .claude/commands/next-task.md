# /next-task

Pick up the next task from the task list, prepare a plan, and save it.

## Instructions

1. Read `docs/TASKS.md` and find the next uncompleted task (`[ ]`), respecting
   dependency order (a task's `Deps` must all be done first).

2. **Reconcile task status first.** Before selecting the next task, verify that
   `docs/TASKS.md` accurately reflects reality:
   - Check `CLAUDE.md` status section and recent git history (`git log --oneline`)
     for completed work.
   - Mark any tasks as `[x]` done if the acceptance criteria are already met in
     the codebase but the task file was not updated.
   - This prevents re-planning already-completed work.

3. Read `CLAUDE.md` and `docs/PROJECT_PLAN.md` for current conventions.

4. Explore the codebase to understand the current state relevant to this task:
   - Existing patterns, files, and dependencies.
   - What needs to change and why.

5. Write a plan for the selected task covering:
   - **Task ID and title**.
   - **Goal**: One sentence.
   - **Acceptance criteria** (from TASKS.md).
   - **Approach**: Strategy and rationale.
   - **Files** that will be created or modified, with descriptions.
   - **Key decisions** and their rationale.
   - **Testing strategy**.
   - **Dependencies** and whether they are satisfied.
   - **Risks or questions** that should be resolved before starting.
   - **Out of scope**.

6. **Save the plan** to `.claude/_plans/<TASK_ID>-<short-slug>.md` (e.g.
   `.claude/_plans/M1-02-prettier-editorconfig.md`). Include the task ID,
   status (`Planned`), and creation date in the file header.

7. Present a summary to the user and tell them:
   - To implement: `/implement-plan <plan-filename>`
   - To plan differently: `/plan-feature <task description>`

## Bookkeeping (do this after every completed task)

After any task is implemented and verified, ensure these files stay in sync:

- **`docs/TASKS.md`** — Mark completed tasks `[x]`. Mark in-progress tasks `[~]`.
  Add notes if acceptance criteria changed or follow-up work was discovered.
- **`docs/PROJECT_PLAN.md`** — Update if any architectural decisions changed,
  new technology was introduced, or the plan's assumptions no longer hold. Keep
  sections like tech stack, folder structure, and database design current.
- **`CLAUDE.md`** — Update the status section at the bottom to reflect the last
  completed task and the next task ID.

These updates should happen in the same commit as the task implementation,
not deferred to a later time.

Do NOT start implementation. This command produces a plan file only.
