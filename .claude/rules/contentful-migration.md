# Contentful Migration Patterns

This document defines conventions for the `apps/generic/contentful/contentful-migration` service.

---

## Directory Structure & What Runs Where

| Directory                                    | Environments                                                          | Use For                                          |
| -------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------ |
| `migrations/universal/`                      | **All environments** including `master` (Production)                  | Content type schemas, production content entries |
| `migrations/universal/test-content-scripts/` | Dev, QA, feature branches only — **excluded from `master` and `uat`** | Seed/dummy data for lower environments           |

The excluded environments are configured in `src/migrationConfig.ts`:

```ts
export const environmentsWithoutTestContent = ['uat', 'master'];
```

To exclude additional environments from test content, add them to this array.

---

## Critical Rule: Production Content Goes in `universal/`, Not `test-content-scripts/`

**If a content entry needs to exist in Production, it must be in `migrations/universal/` — never in `migrations/universal/test-content-scripts/`.**

Common mistakes to avoid:

- ❌ Chatbot nav links, microcopy, or feature configuration in `test-content-scripts/` — these are needed in Production
- ❌ Assuming `test-content-scripts/` reaches all environments — it does NOT reach `master` or `uat`

If you discover a script in `test-content-scripts/` that should be in Production:

1. Move the file to `universal/`
2. Keep the same filename — the migration tracker keys by `{parentFolder}\{scriptName}`, so moving the file changes the key and the script will re-run on environments that haven't seen it under the new path

---

## Migration Tracker

Scripts are tracked per-environment in a Contentful entry. The tracker key format is:

```
{parentFolder}\{scriptNameWithoutExtension}
```

Examples:

- `universal\00258-add-chatbot-nav-link-content-entry`
- `test-content-scripts\00001-add-link-content-entry`

This means moving a script between directories (e.g., `test-content-scripts/` → `universal/`) causes it to be treated as a new, unrun script in all environments — which is the intended behavior when promoting content to Production.

Scripts are **never re-run** on environments where they're already tracked. Use a new script (next sequential number) to amend previously migrated content.

---

## Numbering Convention

Scripts are numbered sequentially across all directories under a space:

```
00271-add-inline-product-card-to-main-section-container.ts  ← last in universal/
00272-next-script.ts                                          ← next to add
```

Always check the highest existing number across `universal/` and `universal/test-content-scripts/` before creating a new script.

---

## Alias Environments

`master` and `uat` are Contentful alias environments (defined in `migrationConfig.ts`). They behave differently from feature branch environments:

- Alias environments clone the current aliased environment during migration
- The migration runner prevents running alias environments locally (throws an error)
- CI sets `RELEASE_TAG` which is required when targeting alias environments

---

**Last Updated**: 2026-05-13
**Applies To**: `apps/generic/contentful/contentful-migration/`
