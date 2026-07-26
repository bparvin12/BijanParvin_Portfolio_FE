# /create-pr

Create a pull request for the current branch with a well-structured description.

## Input

Optional target branch or additional context: $ARGUMENTS

## Instructions

1. Gather context:
   - `git log main..HEAD --oneline` to see all commits on this branch.
   - `git diff main...HEAD` to see the full diff.
   - Read `docs/TASKS.md` to identify which task(s) this PR addresses.
   - `git status` to verify the working tree is clean.

2. If there are uncommitted changes, ask: "There are uncommitted changes.
   Should I commit them first with /pre-commit?"

3. Verify quality:
   - `npx tsc --noEmit` must pass.
   - `npm run lint` must pass.
   - `npm run build` must pass.
   - If any fail, stop and report. Do not create a PR with failing checks.

4. Push the branch if not already pushed: `git push -u origin HEAD`.

5. Create the PR using `gh pr create` with:
   - **Title**: `type: MX-YY short description` (matching commit convention).
   - **Body**:
     ```
     ## Summary
     <What this PR does and why, 1-3 bullets>

     ## Task
     Closes MX-YY from docs/TASKS.md

     ## Changes
     <List of notable changes by file or area>

     ## Testing
     <What was tested and how>

     ## Checklist
     - [ ] TypeScript strict passes
     - [ ] ESLint passes
     - [ ] Build succeeds
     - [ ] Tests pass
     - [ ] No secrets committed
     - [ ] Docs updated if needed
     ```

6. Return the PR URL.
