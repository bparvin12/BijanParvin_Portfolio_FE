# /dep-check

Audit project dependencies for security, updates, and bloat.

## Instructions

1. Run dependency checks:
   - `npm audit` for known vulnerabilities.
   - `npm outdated` for available updates.
   - Check `package.json` for unused dependencies by searching for imports.

2. For each vulnerability:
   - Severity (critical, high, moderate, low).
   - Which package and version.
   - Whether a fix is available (`npm audit fix` safe?).
   - If no fix, assess the actual risk to this project.

3. For outdated packages:
   - Flag major version bumps that may have breaking changes.
   - Prioritize security-related updates.
   - Note if any updates conflict with project constraints (e.g., Next.js 16,
     React 19, Tailwind 4, ESLint 9).

4. For potentially unused dependencies:
   - Search `src/` for imports of the package.
   - Check config files that might reference it (next.config, eslint, etc.).
   - Recommend removal if genuinely unused.

5. Output a structured report with action items sorted by priority.
