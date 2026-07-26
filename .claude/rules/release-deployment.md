# Release & Deployment Workflow

Single source of truth for the end-to-end release cycle across gecom-apps and gecom-mach-composer.

---

## Release Cycle Overview

```
gecom-apps                          gecom-mach-composer
┌─────────────────────────┐         ┌──────────────────────────────┐
│ 1. PR → merge to main   │         │ 5. Update components.yml     │
│ 2. Create GitHub release │───────► │ 6. Create PR (scope=component)│
│ 3. CI/CD builds artifact │         │ 7. Merge → auto-deploy to DEV│
│ 4. Verify S3 artifact    │         │ 8. Verify deployment         │
└─────────────────────────┘         └──────────────────────────────┘
```

---

## Step 1: Merge Code to Main

```bash
# Create PR in gecom-apps
gh pr create --title "feat(<scope>): [UG-XXXX] description" --body "..."

# After 2 approvals + CI passes → squash merge
```

## Step 2: Create GitHub Release

**CRITICAL**: ALWAYS use `gh release create`. NEVER just `git tag`.

```bash
# ✅ CORRECT — Creates release AND triggers CI/CD
gh release create "@phoenix/<component>-v<VERSION>" \
  --title "@phoenix/<component>-v<VERSION>" \
  --notes "## Changes

- Description of changes

## Jira
- [UG-XXXX](https://catalina.atlassian.net/browse/UG-XXXX)"

# ❌ WRONG — Creates tag but NO CI/CD trigger
git tag "@phoenix/<component>-v1.25.0"
git push --tags
```

**Why**: CI/CD is triggered by `release: types: [published]`, NOT tag pushes. If you only push a tag, Lambda packages won't be built and MACH deployment will fail with `S3 Bucket Object NotFound`.

### Version Format

```
@phoenix/<component>-v<major>.<minor>.<patch>
```

Examples:

- `@phoenix/chatbot-ai-v1.24.0`
- `@phoenix/acp-v1.37.2`
- `@phoenix/refapp-webapp-v3.1942.0`

### Version Bumping

- **Patch** (`v1.0.1`): Bug fixes, lint fixes, doc changes
- **Minor** (`v1.1.0`): New features, non-breaking changes
- **Major** (`v2.0.0`): Breaking changes (rare, requires migration plan)

## Step 3: Wait for CI/CD

```bash
# Check release workflow status
gh run list --workflow=deploy-s3-apps-<component>.yml --limit=3

# Or check specific run
gh run view <RUN_ID>
```

**NEVER update MACH Composer until CI/CD completes and S3 artifacts are uploaded.**

## Step 4: Verify S3 Artifact

```bash
# For Lambda-based components
aws s3 ls s3://<bucket>/<component>/ --profile ai-agent-readonly

# For ECR-based components (ECS Fargate)
aws ecr describe-images --repository-name <repo> --profile ai-agent-readonly --region us-east-1
```

## Step 5: Update MACH Composer

```bash
# In gecom-mach-composer repo
cd /path/to/gecom-mach-composer

# Update version in components.yml
# development/components.yml for DEV
# qa/components.yml for QA, etc.
```

```yaml
- name: <component>
  version: '@phoenix/<component>-v<NEW_VERSION>'
```

## Step 6: Create MACH Composer PR

**CRITICAL**: Use `component` scope, NOT the component name.

```bash
# ✅ CORRECT
gh pr create --title "feat(component): [UG-XXXX] update <component> to v<VERSION>" --body "..."

# ❌ WRONG — Semantic check will fail
gh pr create --title "feat(acp): [UG-XXXX] update ACP to v<VERSION>" --body "..."
gh pr create --title "feat(chatbot-ai): [UG-XXXX] update chatbot-ai" --body "..."
```

### Allowed MACH Composer Scopes

| Scope       | Use For                                 |
| ----------- | --------------------------------------- |
| `component` | Component version updates (most common) |
| `common`    | Common infrastructure changes           |
| `infra`     | Infrastructure configuration            |
| `docs`      | Documentation changes                   |

**Any other scope** (`acp`, `webapp`, `chatbot-ai`, `terraform`) **WILL FAIL** the semantic PR title check.

## Step 7: Merge → Auto-Deploy

- **DEV**: Auto-deploys on merge to main (1 approval required)
- **QA**: Manual version bump, separate PR (2 approvals)
- **Staging**: Manual version bump, separate PR (2 approvals + Valtech-Devops)
- **Production**: Manual version bump, separate PR (2 approvals + stakeholder)

## Step 8: Verify Deployment

```bash
# Check GitHub Actions deployment status
gh run list --repo Metagenics/gecom-mach-composer --limit=5

# Check application health (example for chatbot-ai)
curl -s https://api.metagenics.com/api/v1/chat/health

# Check CloudWatch logs for errors
aws logs tail /ecs/<site>-<component> --since 10m --profile ai-agent-readonly --region us-east-1
```

---

## Environment Promotion

### Sequential Only (NEVER skip)

```
DEV → QA → Staging → Production
```

### Promotion Checklist

Before promoting from env A to env B:

- [ ] Deployment to env A succeeded (GitHub Actions green)
- [ ] No errors in CloudWatch/application logs
- [ ] Functionality verified (manual testing or automated)
- [ ] Create separate PR for target environment
- [ ] Get required approvals

### Deployment Schedule

| Day            | Activity                                    |
| -------------- | ------------------------------------------- |
| Monday-Tuesday | DEV deployments, QA preparation             |
| Tuesday        | QA freeze                                   |
| Wednesday      | CAB (Change Advisory Board), Staging deploy |
| Thursday       | Production deploy                           |
| Friday         | Monitoring, no new deploys                  |

---

## Batch Changes to Minimize Cycles

Each release cycle takes 20-40 minutes. Batch related changes into single PRs:

```
# ❌ WRONG — 5 separate release cycles
PR1: Fix typo → v1.20.0 → MACH update → deploy → verify
PR2: Add variable → v1.21.0 → MACH update → deploy → verify
PR3: Fix lint → v1.22.0 → MACH update → deploy → verify
PR4: Fix TF error → v1.23.0 → MACH update → deploy → verify
PR5: Fix TF again → v1.24.0 → MACH update → deploy → verify

# ✅ CORRECT — 1 release cycle
PR1: All fixes batched → v1.20.0 → MACH update → deploy → verify
```

**Exception**: Urgent hotfixes should be separate for traceability.

---

## Rollback Procedure

If a deployment causes issues:

1. Identify the last known working version
2. Create a PR reverting `components.yml` to that version
3. Get expedited review (1 approver for emergencies)
4. Merge → auto-deploys previous version
5. Investigate root cause on a separate branch

---

## Post-Merge CI Verification (MANDATORY)

**After any PR you own merges to `main`, you MUST verify the release pipeline succeeded.** A silently broken pipeline blocks every subsequent merge's release until someone notices, and the root cause is often a single earlier PR.

### The signal

A healthy merge to `main` is followed within ~10 minutes by a release-it commit:

```
ci: release succeeded [no ci]
```

If that commit is missing, the release pipeline failed.

### How to check

Immediately after merging (or returning to the repo after a merge):

```bash
# 1. See the last 5 commits on main
git fetch origin main
git log origin/main --oneline -5

# 2. Look at the most recent Release workflow run
gh run list --branch main --workflow=release.yml --limit 3

# 3. If the latest run is FAILURE, pull the error
gh run view <RUN_ID> --log-failed | grep -E "(ERROR|fatal:|Let's release)"
```

### Common failure modes

| Symptom in log                                                     | Root cause                                                         | Fix                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `fatal: tag '@phoenix/<component>-vX.Y.Z' already exists`          | Someone used `gh release create` manually; `package.json` is stale | Bump `package.json` to match the latest git tag in a follow-up PR    |
| `ERROR There are no commits since the latest tag`                  | Normal for packages with no changes                                | Ignore — only the component with real changes is expected to release |
| `error Command failed with exit code 1` without release-it context | Build-script failure upstream of release-it                        | Check earlier steps in the same job (build, test, lint)              |
| No run at all — workflow never dispatched                          | Merge commit title or body contains a skip-CI token                | Manually dispatch: `gh workflow run release.yml --ref main`          |

### ⚠️ Skip-CI tokens in commit messages

GitHub auto-skips **all** workflow dispatches for a push when the commit message
(title OR body) contains any of these tokens, even inside quotes or
code blocks:

```
[skip ci]   [ci skip]   [no ci]   [skip actions]   [actions skip]
```

**When squash-merging a PR, the commit body concatenates every commit's body
from the branch.** If any commit on the branch quoted one of those tokens
(e.g., docs referencing the `ci: release succeeded [no ci]` pattern), the
entire post-merge push is silently skipped. This happened on UG-9527
(merge [`d7a5a111a3`](https://github.com/Metagenics/gecom-apps/commit/d7a5a111a3)) — the
CI-verification rule itself quoted `[no ci]`, which GitHub interpreted as a
skip directive.

**To avoid:** in commit messages and PR descriptions, **paraphrase** the
tokens or split them so the full string never appears in raw text — never
a bare `[no ci]`. Code-span markup (backticks) does NOT protect against
CI-skip detection in commit messages because Git stores them as plain
text; the scanner reads the raw bytes. Examples:

- ✅ `release-succeeded commit uses the no-ci suffix` (paraphrase — safe everywhere)
- ✅ splits the token: `` `[no` `` `` `ci]` `` (safe in markdown-rendered contexts: PR descriptions, docs)
- ❌ `` release-succeeded commit uses the `[no ci]` suffix `` (backtick wrap — STILL triggers skip in commit bodies)
- ❌ `the ci: release succeeded [no ci] commit pattern`

**If it already happened:** manually dispatch the workflow with
`gh workflow run release.yml --ref main` (release.yml supports
`workflow_dispatch`). The rebuild runs against the current main SHA, so
you get the same result as if the push had triggered it normally.

### When the pipeline is broken on `main`

- **Do not merge another PR touching the same component** until the pipeline is green again. Every additional merge compounds the backlog and makes the fix harder.
- If you own the failing PR, open a follow-up fix PR immediately. If it's someone else's, ping them in Teams.
- The fix for stale `package.json` is usually a one-line bump. See `feedback_chatbot_release_process.md` in auto-memory and the "Release version sync" pattern above.

### Why this matters

The first failure on UG-9509 (run [24738659973](https://github.com/Metagenics/gecom-apps/actions/runs/24738659973)) wasn't spotted for hours. Four subsequent merges (UG-9510, UG-9513, UG-9525, UG-9527) all failed the same way before someone noticed the missing `ci: release succeeded [no ci]` commits. A 30-second check after each merge would have caught it on merge #1.

---

## Troubleshooting

| Symptom                            | Cause                                  | Fix                                       |
| ---------------------------------- | -------------------------------------- | ----------------------------------------- |
| `S3 Bucket Object NotFound`        | Used `git tag` instead of `gh release` | Create proper GitHub release              |
| `Unknown scope in PR title`        | Used component name as scope           | Change to `component`                     |
| Terraform plan fails               | Missing variables or for_each error    | Run `terraform validate` locally first    |
| 3 workflow runs on MACH PR         | PR open + PR sync + merge triggers     | Only the merge run deploys; ignore others |
| Deployment succeeds but app errors | Runtime issue not caught by TF         | Check CloudWatch logs                     |

---

## Quick Reference Commands

```bash
# Create release
gh release create "@phoenix/<component>-v<VERSION>" --title "@phoenix/<component>-v<VERSION>" --notes "..."

# Check release CI/CD
gh run list --workflow=deploy-s3-apps-<component>.yml --limit=3

# Check MACH deployment
gh run list --repo Metagenics/gecom-mach-composer --limit=5

# Check CloudWatch logs
aws logs tail /ecs/<site>-<component> --since 10m --profile ai-agent-readonly --region us-east-1

# Check Lambda logs
aws logs tail /aws/lambda/<function-name> --since 10m --profile ai-agent-readonly --region us-east-1
```

---

## Confluence References

- [Release WoW](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2831220779) — Version tagging, MACH Composer flow
- [GECOM WoW](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2826436632) — Deployment pipeline overview
- [Development WoW](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2826207304) — PR process, branching
- [PR Process](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2873098287) — Review requirements
- [GECOM NAM](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2646212636) — NAM-specific deployment details

---

**Last Updated**: 2026-03-24
**Applies To**: All GECOM component releases and deployments
