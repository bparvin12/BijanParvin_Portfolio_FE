# /code-review

Review code changes for correctness, security, performance, and maintainability.

## Input

Scope (optional -- defaults to staged + unstaged changes): $ARGUMENTS

## Instructions

1. Determine what to review:
   - No arguments: review all staged and unstaged git changes.
   - A PR number: fetch the PR diff with `gh pr diff <number>`.
   - A file path or glob: review only those files.
   - A commit range: review that diff.

2. Read `CLAUDE.md` for project conventions and architecture principles.

3. For each changed file, read the FULL file (not just the diff) to understand context.

4. Evaluate against these criteria:

   **Correctness**
   - Does the code do what it claims? Are edge cases handled?
   - Are types correct and specific (no unnecessary `any`)?
   - Are Zod schemas validating all boundaries?

   **Security**
   - No secrets, credentials, or PII in code or logs.
   - SQL injection, XSS, command injection, SSRF prevention.
   - Owner-scoping on all per-user data access.
   - Input validation at system boundaries.

   **Architecture compliance**
   - Engine code has no I/O, HTTP, or DB imports.
   - Provider code goes through the PAL, not called directly.
   - AI orchestrator uses only registered tools.
   - No violations of the two non-negotiable principles.

   **Performance**
   - No N+1 queries or unbounded loops.
   - Appropriate caching through the PAL.
   - No blocking operations on the main thread.

   **Maintainability**
   - Code is readable without excessive comments.
   - No dead code, unused imports, or TODO debris.
   - Tests exist for new logic and cover meaningful cases.
   - Naming is clear and consistent with project conventions.

5. Output a structured review:
   - **Summary**: One paragraph overview.
   - **Issues** (blocking): Must fix before merge. Include file:line references.
   - **Suggestions** (non-blocking): Improvements worth considering.
   - **Verdict**: APPROVE, REQUEST_CHANGES, or NEEDS_DISCUSSION.
