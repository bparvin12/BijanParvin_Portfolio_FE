# /pre-commit

Run pre-commit quality gates and prepare a clean commit.

## Instructions

1. Run all checks in sequence:
   - `npx tsc --noEmit` (typecheck)
   - `npm run lint` (ESLint)
   - `npm run build` (production build)
   - `npm test` (if test runner is configured)

2. If any check fails, fix the issues and re-run. Do NOT proceed with
   a failing check.

3. Review staged changes:
   - `git diff --cached` to see what will be committed.
   - Verify no secrets, `.env` files, or large binaries are staged.
   - Verify changes are logically cohesive (one task per commit).

4. Review unstaged changes:
   - `git diff` to see what is NOT staged.
   - Ask if any unstaged changes should be included.

5. Generate a commit message following the project convention:
   - Format: `type: MX-YY short description`
   - Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`
   - The message should describe WHY, not just what.

6. Present the commit message for approval. Do NOT commit without approval.

7. After approval, stage the appropriate files (specific files, not `git add .`)
   and create the commit.
