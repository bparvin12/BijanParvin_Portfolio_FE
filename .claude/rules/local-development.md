# Local Development Environment

This document covers how to run the GECOM monorepo locally, common pitfalls, and troubleshooting.

---

## Service Architecture (Local)

The local dev environment runs multiple services that compose into an Apollo Federation gateway (BFF):

| Service           | Package                      | Port     | Role                                                 |
| ----------------- | ---------------------------- | -------- | ---------------------------------------------------- |
| Commerce          | `@phoenix/commerce`          | 4200     | CommerceTools GraphQL subgraph                       |
| Payment           | `@phoenix/payment`           | 4300     | Payment processing subgraph                          |
| Amplience         | `@phoenix/refapp-amplience`  | 4400     | CMS content subgraph                                 |
| Discounts         | `@phoenix/discounts`         | 4600     | Discount/promo subgraph                              |
| Algolia Recommend | `@phoenix/algolia-recommend` | remote   | Product recommendations (uses remote DEV by default) |
| **BFF**           | `@phoenix/refapp-bff`        | **4000** | Apollo Federation gateway (composes all subgraphs)   |
| **Webapp**        | `@phoenix/refapp-webapp`     | **3000** | Next.js frontend                                     |

### Request Flow

```
Browser (3000) → Webapp (Next.js SSR) → BFF (4000, Apollo Gateway)
                                          ├→ Commerce (4200)
                                          ├→ Amplience (4400)
                                          ├→ Discounts (4600)
                                          ├→ Payment (4300)
                                          └→ Algolia Recommend (remote DEV)
```

---

## Starting Services

### VS Code Tasks (Recommended)

- **`Ctrl+Shift+D`** — Start full dev environment (all services)
- **`Ctrl+Alt+D`** — Terminate all running tasks
- **`Cmd+Shift+P` → "Tasks: Run Task"** — Run individual services

Tasks are defined in `.vscode/tasks.json`. They use `yarn workspace` to bypass turbo caching.

### Manual Startup

Start services in this order (subgraphs before gateway):

```bash
# 1. Subgraphs (can start in parallel)
yarn workspace @phoenix/commerce dev          # :4200
yarn workspace @phoenix/refapp-amplience dev  # :4400
yarn workspace @phoenix/discounts dev         # :4600
yarn workspace @phoenix/payment dev           # :4300

# 2. BFF (AFTER all subgraphs are listening)
yarn workspace @phoenix/refapp-bff dev        # :4000

# 3. Webapp
yarn workspace @phoenix/refapp-webapp dev     # :3000
```

### Startup Order Matters

**BFF must start AFTER all subgraphs are running.** At startup, BFF uses Apollo `IntrospectAndCompose` to fetch SDL from every subgraph. If any subgraph is unreachable, BFF crashes with:

```
Error: Couldn't load service definitions for "commerce" at http://localhost:4200/commerce/graphql
```

BFF uses nodemon but does NOT auto-retry after crash — it waits for file changes. To restart BFF after subgraphs are up:

- Type `rs` in the BFF terminal, or
- Touch a source file: `touch apps/refapp/refapp-bff/src/index.ts`

The VS Code task adds `sleep 15` before BFF startup to give subgraphs time.

---

## Critical Pitfalls

### 1. Do NOT use `yarn dev --filter=<package>` for dev servers

`yarn dev` at the monorepo root maps to `turbo run dev`. Despite `persistent: true` in turbo.json, turbo sometimes **caches dev task output** and replays logs without actually starting the server. The process exits immediately.

**Always use `yarn workspace @phoenix/<package> dev`** — this runs the dev script directly, bypassing turbo.

### 2. Amplience uses `serverless offline` (without `start`)

The Amplience dev command is `serverless offline` (not `serverless offline start`). This is consistent with how it runs on `main` and other environments.

### 3. esbuild memory leak in `serverless-offline` (Amplience)

The `serverless-esbuild` plugin runs esbuild as a long-lived Go process (`--service` mode) for hot-rebuilds. esbuild 0.15.12 has a known memory leak in this mode — RSS can grow to 5+ GB over time, causing macOS to report ~90 GB virtual memory.

**Symptoms**: System slowdown, Activity Monitor showing "code" or "esbuild" using tens of GB.

**Fix**: Restart the Amplience dev server periodically. Kill the leaking process:

```bash
# Find and kill leaky esbuild processes (>1 GB RSS)
ps aux | grep '[e]sbuild.*--service' | awk '$6 > 1048576 {print $2}' | xargs kill
```

**Root cause**: esbuild 0.15.12 (pinned across the monorepo). A monorepo-wide upgrade to 0.19.x would fix it but requires build validation across all packages.

### 4. BFF env vars read at module level require restart

Some BFF modules read `process.env` at the top level:

```typescript
const SOME_SERVICE_URL = process.env.SOME_SERVICE_URL;
```

Changes to `.env` require a full BFF restart — nodemon file-change detection won't re-read env vars.

---

## Environment Configuration

### BFF `.env` (apps/refapp/refapp-bff/.env)

Key local overrides:

```bash
# Subgraph URLs (local)
COMMERCE_GRAPHQL_URL=http://localhost:4200/commerce/graphql
AMPLIENCE_GRAPHQL_URL=http://localhost:4400/ampl/graphql
DISCOUNTS_GRAPHQL_URL=http://localhost:4600/discounts/graphql
PAYMENT_GRAPHQL_URL=http://localhost:4300/payment/graphql
```

### Checking Running Services

```bash
lsof -i -P -n 2>/dev/null | grep LISTEN | grep -E ':(3000|4000|4200|4300|4400|4600|8000)\b'
```

### Testing BFF Directly

```bash
# Simple page query
curl -s http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ page(locale: \"en-us\", slug: \"home\") { __typename } }"}'
```

---

## Troubleshooting

| Symptom                                             | Cause                                         | Fix                                                  |
| --------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| BFF crashes with `ECONNREFUSED`                     | Subgraph not running                          | Start the missing subgraph, then restart BFF         |
| Commerce task exits immediately                     | Turbo cached the dev output                   | Use `yarn workspace @phoenix/commerce dev`           |
| Amplience: `Cannot find module .esbuild/.build/...` | esbuild build not triggered                   | Delete `.esbuild/` and restart Amplience dev server  |
| Webapp: "No page data returned from query"          | BFF not running or page resolver not matching | Check BFF is on :4000, check slug matching           |
| BFF ignores new env vars                            | Module-level `process.env` read               | Full BFF restart required                            |
| esbuild using 5+ GB RAM / system slow               | Memory leak in esbuild 0.15.12 service mode   | Restart Amplience dev server or kill esbuild process |
