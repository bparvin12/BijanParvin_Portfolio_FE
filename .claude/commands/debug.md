# /debug

Systematically investigate and fix a bug.

## Input

Bug description: $ARGUMENTS

## Instructions

1. **Reproduce**: Understand the bug from the description. Identify the expected
   vs. actual behavior. If a stack trace or error message is provided, start there.

2. **Locate**: Trace the code path from the symptom to the root cause.
   - Read the relevant files fully, not just the suspected lines.
   - Check recent git changes that might have introduced the regression:
     `git log --oneline -20` and `git diff` on suspicious commits.
   - Look for related tests that should have caught this.

3. **Diagnose**: Identify the root cause. Explain:
   - What is actually happening and why.
   - Why the current code produces the wrong behavior.
   - Whether this is a logic error, data issue, race condition, etc.

4. **Fix**: Propose a minimal fix.
   - Change only what is necessary. No drive-by refactors.
   - If the fix is non-obvious, explain the reasoning.

5. **Verify**: After applying the fix:
   - Run `npx tsc --noEmit` and `npm run lint`.
   - Run related tests. If no test covers this case, write one.
   - Confirm the fix does not break other behavior.

6. **Report**:
   - Root cause (one sentence).
   - What changed and why.
   - Test added or updated.
   - Any related code that might have the same bug.
