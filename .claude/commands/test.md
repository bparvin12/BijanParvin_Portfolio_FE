# /test

Write or update tests for a specific module or file.

## Input

Target file, module, or description: $ARGUMENTS

## Instructions

1. Read the target file(s) to understand the code being tested.

2. Read existing tests for the target (if any) to avoid duplication and
   follow established patterns.

3. Read `CLAUDE.md` for testing conventions (Vitest, golden-value tests for
   engine code, Zod validation at boundaries).

4. Write tests following these principles:

   **For engine code** (`src/engine/`):
   - Golden-value tests: hand-computed expected values for each function.
   - Edge cases: zero values, negative numbers, boundary conditions.
   - Property tests where appropriate (e.g., NOI cannot exceed gross income).
   - No mocks. Engine code is pure functions.

   **For provider code** (`src/providers/`):
   - Mock external HTTP calls. Never hit real APIs in tests.
   - Test cache hit/miss behavior.
   - Test error handling (network failure, malformed response, rate limit).
   - Verify Zod validation on provider responses.

   **For API routes and server actions**:
   - Test input validation (valid + invalid payloads).
   - Test auth/authz (unauthenticated, wrong user).
   - Test the happy path end-to-end.

   **For UI components**:
   - Test rendering with expected props.
   - Test user interactions (clicks, form submission).
   - Test accessibility (labels, roles, keyboard).

5. Run the tests and verify they pass: `npm test -- <path>`.

6. Report: number of tests added, what they cover, and any gaps remaining.
