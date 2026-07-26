# /security-scan

Quick security review of the codebase or recent changes.

## Input

Scope (optional -- defaults to full codebase): $ARGUMENTS

## Instructions

1. Determine scope:
   - No arguments: scan the full `src/` directory.
   - A file path or glob: scan only those files.
   - "changes": scan only staged + unstaged git changes.

2. Check for these categories:

   **Secrets and credentials**
   - API keys, tokens, passwords hardcoded in source.
   - `.env` or credential files tracked by git.
   - Secrets in comments, logs, or error messages.

   **Injection vulnerabilities**
   - SQL injection (raw queries without parameterization).
   - XSS (unsanitized user input rendered in HTML).
   - Command injection (user input in shell commands).
   - SSRF (user-controlled URLs in server-side requests).
   - Prompt injection (user content passed unsanitized to LLM).

   **Auth and authorization**
   - Routes missing authentication checks.
   - Data access missing owner-scoping.
   - Privilege escalation paths.

   **Data handling**
   - PII logged without scrubbing.
   - Sensitive data in client-side state or localStorage.
   - Missing input validation at system boundaries.

   **Dependencies**
   - Run `npm audit` and report findings.
   - Flag known-vulnerable packages.

3. Output a structured report:
   - **Critical**: Must fix immediately (secrets, injection, auth bypass).
   - **High**: Should fix before deploy (missing validation, PII exposure).
   - **Medium**: Fix when convenient (dependency warnings, hardening).
   - **Info**: Best-practice suggestions.

4. For each finding, include: file:line, description, and suggested fix.
