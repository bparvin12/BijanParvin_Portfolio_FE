# Worktree Isolation — One Dedicated Worktree Per Branch

**Rule**: When working on or testing more than one branch in a single session —
**especially parallel test/eval/PR pipelines** — **each branch gets its own
dedicated git worktree.** Never check out branch B over branch A's working tree,
never carry uncommitted changes between branches, and never run two branches'
code from the same `src/`.

> "Each branch under test gets its own dedicated worktree so nothing
> cross-contaminates." — agreed working principle (2026-06-25)

---

## Why This Matters

- **Local-dev noise leaks.** The main checkout accumulates gitignored /
  generated dev files (`apps/generic/chatbot-ai/.env`, generated
  `next-env.d.ts`). Switching branches in place mixes those with branch work
  and risks losing or contaminating changes. (The `Makefile` and
  `docker-compose.local-*.yml` are committed, so a worktree gets them for free.)
- **Eval/test runs volume-mount `./src`.** Whatever branch is checked out is
  what actually runs in the container. Two branches sharing one checkout
  **cannot** be evaluated independently — results from branch A bleed into B.
- **Artifacts leak.** `__pycache__`, `.venv`, build caches, and staged-but-
  uncommitted edits carry across an in-place `git checkout`, silently
  invalidating "clean branch" assumptions.

---

## How

```bash
# 1. One worktree per branch, under .claude/worktrees/
git worktree add .claude/worktrees/<branch-slug> <branch>

# 2. The Makefile and docker-compose.local-*.yml ARE committed, so `git worktree
#    add` already checks them out. Only the gitignored .env needs copying
#    (see feedback_worktree_setup_gotchas for the husky / lint-staged caveats).
cp apps/generic/chatbot-ai/.env  .claude/worktrees/<slug>/apps/generic/chatbot-ai/

# 3. Work / test / eval entirely inside the worktree
# 4. When done, remove it
git worktree remove .claude/worktrees/<slug>      # add --force if dirty & intended
```

See [feedback_worktree_setup_gotchas](auto-memory) for the husky (`_/` missing)
and lint-staged (no `node_modules`) workarounds, and
[feedback_gh_pr_create_head_flag](auto-memory): when pushing from outside the
worktree, always pass `gh pr create --head <branch> --base main` explicitly.

---

## Eval-Specific Constraint

Local chatbot eval binds **port 4700** and fixed docker-compose container names.
So **eval runs are SEQUENTIAL even across separate worktrees** — you cannot run
two branches' evals at once. Bring one branch's stack up
(`make local-up-bedrock`), eval, `make local-down`, then move to the next
worktree. The worktree isolation keeps the _code_ separated; the shared docker
runtime forces the _eval_ to be one-at-a-time.

---

## Anti-Patterns

- ❌ `git checkout branch-b` in the main checkout while branch-a work is
  uncommitted or its containers are up.
- ❌ Running `make local-eval` for branch B without confirming branch B's `src`
  is the one checked out in the worktree whose stack is running.
- ❌ Leaving stale worktrees around — they drift and confuse the next session.
  `git worktree list` then `git worktree prune` / `remove`.

---

**Last Updated**: 2026-06-25
**Applies To**: All multi-branch work in GECOM repos (test/eval/PR pipelines)
