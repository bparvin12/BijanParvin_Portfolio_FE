# Git Workflow Rules

This document defines Git conventions and workflow for the GECOM monorepo.

---

## Branching Strategy

### Trunk-Based Development

All work merges to `main` branch. No long-lived feature branches.

### Branch Naming Convention

**Format**: `<type>/<ticket-number>-<description>`

| Type          | Purpose                  | Merges to main? |
| ------------- | ------------------------ | --------------- |
| `feature/`    | New feature development  | ✅ Yes          |
| `fix/`        | Bug fixes and patches    | ✅ Yes          |
| `hotfix/`     | Urgent production issues | ✅ Yes          |
| `experiment/` | Investigations, spikes   | ❌ No           |

**Examples**:

```
feature/UG-7903-checkout-sessions
fix/UG-8194-event-broker-bug
hotfix/UG-9001-cart-crash
experiment/spike-algolia-v2
```

---

## Commit Messages

### Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, semicolons)
- `refactor` - Code change that neither fixes nor adds
- `perf` - Performance improvement
- `test` - Adding or fixing tests
- `chore` - Build process or auxiliary tools

**Examples**:

```
feat(cart): add quantity selector to cart drawer
fix(algolia): prevent duplicate API calls on search
docs(acp): update integration guide
refactor(shared-ui): extract Button base styles
```

---

## Pull Request Process

### PR Title Format

```
<type>(<scope>): [<TICKET>] <description>
```

**Examples**:

```
feat(webapp): [UG-1234] add product comparison feature
fix(commerce): [NGE-5678] handle null prices in cart
```

### Required in PR Description

1. **Summary** - Brief description of changes
2. **Screenshots/Recordings** - For UI changes
3. **Testing Instructions** - How to verify
4. **JIRA Link** - Link to ticket

### Approval Requirements

- 2 approvers (not the author)
- All CI checks must pass
- No merge conflicts

### Merge Strategy

- **Squash merge** into `main`
- Branch auto-deleted after merge

---

## Pre-Commit Hooks

The following hooks run before each commit:

| Hook                   | Purpose                    |
| ---------------------- | -------------------------- |
| Branch name validation | Enforces naming convention |
| ESLint                 | Linting check              |
| Prettier               | Code formatting            |
| Type check             | TypeScript compilation     |

If hooks fail, fix issues before committing.

---

## Pre-Commit Deep Review (Claude Code)

**MANDATORY**: Before committing and pushing any bugfix or feature work, Claude Code must perform a thorough self-review of all changes. This is a final quality gate — not a quick glance.

### What to Review

1. **End-to-end flow trace** — Walk through the entire feature or fix from entry point to final output. Verify that data flows correctly between all functions, components, and services involved.
2. **Parameter correctness** — Check that all parameters passed between functions and across entity boundaries (e.g., backend → BFF → frontend, or hook → component → store) are correct in name, type, and value.
3. **Architectural alignment** — Confirm the implementation follows established patterns in the codebase (expand & contract for schema changes, connector pattern for React, Zustand for state, etc.).
4. **Edge cases and error handling** — Verify that error paths, null/undefined cases, and boundary conditions are handled appropriately.
5. **Test coverage** — Ensure all new and changed code paths have corresponding tests, and that tests actually verify the correct behavior (not just that code runs without crashing).
6. **No leftover artifacts** — Check for debug logs, TODO comments, commented-out code, or temporary workarounds that should be cleaned up before commit.

### How to Perform the Review

- **Read every changed file** — Do not rely on memory of what was written. Re-read the actual file content.
- **Trace the call chain** — For a feature touching multiple files, follow the data from source to destination across all layers.
- **Verify against requirements** — Cross-check the implementation against what was originally requested.
- **Run tests for ALL affected packages** — Execute tests for every package with changed files, not just the primary one. Use `git diff --name-only` to identify all affected packages, then run their test suites. ALL must pass before committing. This is a **blocking requirement**.

### When This Applies

- After completing any feature development (before first commit)
- After completing any bugfix (before first commit)
- After resolving merge conflicts (before the merge commit)
- Before pushing to remote (final check)

---

## Release Process

### Creating Releases

**ALWAYS** use `gh release create`, **NEVER** just `git tag`:

```bash
# ✅ CORRECT - Creates release AND triggers CI/CD
gh release create "@phoenix/<component>-v<version>" \
  --title "@phoenix/<component>-v<version>" \
  --notes "## Changes\n\n- Description of changes"

# ❌ WRONG - Creates tag but NO CI/CD trigger
git tag "@phoenix/acp-v1.37.2"
git push --tags
```

### Version Format

```
@phoenix/<component>-v<major>.<minor>.<patch>
```

**Examples**:

```
@phoenix/acp-v1.37.2
@phoenix/refapp-webapp-v2.5.0
@phoenix/algolia-v1.12.0
```

### After Release

1. Wait for CI/CD to complete
2. Verify artifacts uploaded to S3
3. Update version in MACH Composer
4. Deploy to DEV (automatic)
5. Promote to higher environments

---

## Daily Push Requirement

**Push your work daily** (end of day mandatory)

Reasons:

- Prevents work loss
- Enables collaboration
- Allows CI to catch issues early
- Visible progress for standup

---

## Feature Workflow

1. **Start Work**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/UG-XXXX-description
   ```

2. **During Development**

   ```bash
   # Make changes
   git add .
   git commit -m "feat(scope): description"
   git push origin feature/UG-XXXX-description
   ```

3. **Create PR**

   - Title: `feat(scope): [UG-XXXX] description`
   - Add description, screenshots, JIRA link
   - Request reviewers

4. **After Approval**

   ```bash
   # Squash merge via GitHub UI
   # Branch auto-deleted
   ```

5. **Verify on DEV**
   - Check deployment succeeded
   - Test functionality

---

## Hotfix Workflow

For urgent production issues:

1. Branch from `main`:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/UG-XXXX-critical-fix
   ```

2. Apply minimal fix
3. Create PR (expedited review - 1 approver may suffice)
4. Merge and create release
5. Deploy directly to affected environment

---

## Confluence References

- [Development WoW](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2826207304/Development+Ways+of+Working)
- [Release Ways of Working](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2831220779/Release+Ways+of+Working)
- [Technical Hotfix Process](https://catalina.atlassian.net/wiki/spaces/NEA/pages/XXXXX/Technical+Hotfix+Release+Process)
