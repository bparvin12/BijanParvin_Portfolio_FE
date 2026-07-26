# /status

Report current project status, progress, and health.

## Instructions

1. Read `docs/TASKS.md` and compute:
   - Total tasks, completed, in progress, remaining.
   - Current milestone progress (percentage).
   - Next task(s) ready to start (dependencies satisfied).
   - Blocked tasks (dependencies not yet met).

2. Check codebase health:
   - Run `npx tsc --noEmit` -- report pass/fail.
   - Run `npm run lint` -- report pass/fail.
   - Check git status for uncommitted changes.
   - Check if current branch is up to date with remote.

3. Read `CLAUDE.md` status section for any notes.

4. Output a structured report:

   ```
   ## Project Status

   **Milestone**: M1 -- Foundation
   **Progress**: 1/8 tasks done (12%)
   **Current**: M1-02 (Prettier + editorconfig)
   **Blocked**: none

   ## Codebase Health

   | Check      | Status |
   |------------|--------|
   | TypeScript | PASS   |
   | ESLint     | PASS   |
   | Git        | clean  |

   ## Next Steps
   - M1-02: Add Prettier + editorconfig (ready)
   - M1-03: Tailwind + design tokens (ready, parallel with M1-02)
   ```

5. If there are uncommitted changes or failing checks, flag them prominently.
