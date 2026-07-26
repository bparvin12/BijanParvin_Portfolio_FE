# /check

Run all quality checks and report results.

## Instructions

Run the following checks in sequence and report a pass/fail summary:

1. **TypeScript**: `npx tsc --noEmit`
2. **ESLint**: `npm run lint`
3. **Build**: `npm run build`
4. **Tests**: `npm test` (if test runner is configured)

For each check:

- Report PASS or FAIL.
- If FAIL, show the relevant errors (first 20 lines if verbose).
- Suggest a fix for each failure.

End with a summary table:

| Check      | Status | Notes            |
| ---------- | ------ | ---------------- |
| TypeScript | PASS   |                  |
| ESLint     | FAIL   | 2 errors in x.ts |
| Build      | PASS   |                  |
| Tests      | PASS   | 42 passed        |
