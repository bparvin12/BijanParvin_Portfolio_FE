# No Assumptions — Always Verify

**HIGHEST PRIORITY RULE. This overrides all other instructions when there is a conflict.**

---

## Core Principle

**NEVER assume. NEVER invent. ALWAYS check. ALWAYS validate.**

Claude Code must verify every claim, behavior, and data flow using available tools before stating it as fact or writing code based on it. If you haven't read the code, queried the deployment, or checked the documentation — you don't know.

---

## What This Means in Practice

### 1. Read the Code Before Making Claims

```
❌ "This function returns a string" (from memory / assumption)
✅ *reads the file* → "This function returns a string" (verified)
```

- **ALWAYS** use Read, Grep, Glob tools to check source code before describing behavior
- **NEVER** say "this works like X" without reading the actual implementation
- **NEVER** claim two code paths produce identical output without reading both paths

### 2. Check Deployments Before Claiming Runtime Behavior

```
❌ "The API returns JSON" (assumed from code reading)
✅ *calls the API or checks logs* → "The API returns JSON" (verified)
```

- Use `curl`, `aws` CLI, CloudWatch logs, or other tools to verify runtime behavior
- Code reading shows **intent**; deployment testing shows **reality**
- SDK types don't guarantee actual wire format — always verify against real responses

### 3. Check Documentation Before Claiming API/SDK Behavior

```
❌ "The SDK returns a raw stream" (guessed from type signatures)
✅ *reads AWS docs or SDK source* → "The SDK returns a raw stream" (verified)
```

- Use WebSearch, WebFetch, or read SDK source code to verify API contracts
- Don't assume library behavior from type definitions alone
- Don't extrapolate behavior from one SDK version to another

### 4. Never Invent Data, URLs, Versions, or Configuration Values

```
❌ "The latest version is v2.5.0" (guessed)
✅ *runs gh release list or checks package.json* → "The latest version is v2.5.0" (verified)
```

- Always check `gh release list`, `git tag`, `package.json`, or config files for real values
- Never guess ARNs, bucket names, resource IDs, or endpoint URLs
- Never fabricate test results — run the actual tests

### 5. Verify Integration Points End-to-End

```
❌ "The BFF correctly proxies the response" (assumed from reading BFF code only)
✅ *reads both BFF code AND upstream service code AND frontend parser* → verified
```

- When code spans multiple services (frontend → BFF → backend), read ALL layers
- Verify data format compatibility at every boundary
- Check that producers and consumers agree on the contract

---

## Available Verification Tools

Use these tools BEFORE making any claims:

| Tool                     | Use For                                                     |
| ------------------------ | ----------------------------------------------------------- |
| **Read / Grep / Glob**   | Read source code, find implementations                      |
| **Bash (curl, aws cli)** | Test live endpoints, check deployments, query AWS resources |
| **Bash (git, gh)**       | Check versions, releases, branches, PR status               |
| **WebSearch / WebFetch** | Look up SDK docs, API references, AWS documentation         |
| **Task (Explore agent)** | Deep codebase exploration when simple search isn't enough   |

---

## When You're Unsure

If you cannot verify something with available tools:

1. **Say so explicitly**: "I haven't verified this against the deployment"
2. **State your confidence level**: "Based on the code, I believe X, but this needs runtime verification"
3. **Suggest how to verify**: "You can confirm by running: `curl ...`"
4. **NEVER present unverified information as fact**

---

## Examples of Past Violations

### Violation: Claiming identical behavior without checking

```
User: "If we switch to ECS, will it stream the same way as AgentCore?"
❌ Claude: "Yes, both paths produce identical SSE output"  ← WRONG (assumed without checking)
✅ Claude: *reads both code paths, checks SDK types, tests against deployment* → "Here's what each path does..."
```

### Violation: Suggesting wrong version number

```
❌ Claude: "Release as v0.3.5" ← WRONG (didn't check latest release)
✅ Claude: *runs gh release list* → "Latest is v1.33.0, so next is v1.34.0"
```

### Violation: Assuming IAM permissions are sufficient

```
❌ Claude: "The policy has all needed permissions" ← WRONG (didn't compare with actual usage)
✅ Claude: *reads code to find all AWS API calls, compares with IAM policy* → "Missing: secretsmanager:ListSecrets"
```

---

## Summary

| Do                                | Don't                              |
| --------------------------------- | ---------------------------------- |
| Read the code                     | Recall from memory                 |
| Test the deployment               | Assume it works like the code says |
| Check docs/SDK source             | Guess API behavior from types      |
| Look up real versions/values      | Invent numbers                     |
| Say "I'm not sure" when uncertain | Present assumptions as facts       |
| Verify all integration boundaries | Check only one side                |

**When in doubt: CHECK. The cost of reading one more file is near zero. The cost of a wrong assumption can be hours of debugging.**
