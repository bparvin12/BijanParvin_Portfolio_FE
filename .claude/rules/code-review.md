# Code Review and Quality Assurance

This document defines the mandatory review process that Claude Code must perform after completing any feature development or bugfix before committing code.

**PREREQUISITE**: Read and follow [no-assumptions.md](no-assumptions.md) — NEVER assume behavior, ALWAYS verify with tools.

---

## Mandatory Pre-Commit Review Checklist

**CRITICAL**: Before committing and pushing any feature or bugfix, Claude Code MUST perform a thorough self-review of all changes. This is a final quality gate to catch issues before they enter the codebase.

**CRITICAL**: Every claim about code behavior, data format, or integration compatibility MUST be verified by reading the actual code or testing against the deployment. Do NOT rely on memory or assumptions.

### 1. End-to-End Flow Verification ✅

**Walk through the entire feature/fix from entry point to final output:**

- Trace data flow through all functions, components, and services
- Verify parameter passing between all entity boundaries (e.g., backend → BFF → frontend, hook → component → store)
- Check all function signatures match their call sites
- Verify return values are correctly used by callers
- Confirm async/await patterns are correctly implemented
- Check error propagation paths work as expected

**Example checks:**

```typescript
// ✅ VERIFY: Does the caller expect this return type?
function fetchOrders(): Promise<Order[]> {
  return client.get('/orders'); // Does this return Order[]?
}

// ✅ VERIFY: Are all parameters correctly passed?
<OrderList
  orders={orders} // Is this the right data structure?
  onSelect={handleSelect} // Does handleSelect accept the right params?
/>;
```

### 2. Architectural Alignment ✅

**Verify implementation follows established patterns:**

- **Expand & Contract**: Schema changes use non-breaking pattern (add new field, migrate, remove old)
- **Connector Pattern**: React components use connectors for data fetching (see [react-patterns.md](react-patterns.md))
- **State Management**: Zustand for global state (no prop drilling)
- **Styled Components**: All styles use styled components with `.displayName`
- **Error Handling**: Proper try-catch with logging, graceful degradation
- **Separation of Concerns**: UI components don't contain business logic
- **DRY Principle**: No duplicated code; extract common logic into utilities

**Anti-patterns to catch:**

```typescript
// ❌ BAD: Breaking change without expand & contract
- totalCentAmount: Int
+ totalPrice: Money

// ❌ BAD: Prop drilling instead of Zustand
<Header cart={cart} user={user} settings={settings} />

// ❌ BAD: Business logic in UI component
const ProductCard = ({ product }) => {
  const discountedPrice = calculateDiscount(product.price, ...);  // Should be in connector
}
```

### 3. SOLID Principles Compliance ✅

Evaluate adherence to SOLID principles:

**Single Responsibility Principle (SRP)**

- ✅ Each function/class has ONE clear purpose
- ✅ No "god functions" that do multiple unrelated things
- ❌ Check: Does any function have multiple reasons to change?

**Open/Closed Principle (OCP)**

- ✅ Code is open for extension (new providers, new tools)
- ✅ Closed for modification (adding features doesn't require changing existing code)
- ✅ Example: LLM provider pattern allows adding Bedrock without modifying Azure/OpenAI code

**Liskov Substitution Principle (LSP)**

- ✅ Subtypes can replace base types without breaking behavior
- ✅ Example: BedrockKBClient and GraphitiClient both implement same search interface

**Interface Segregation Principle (ISP)**

- ✅ Interfaces are focused and minimal (no "fat interfaces")
- ✅ Clients don't depend on methods they don't use

**Dependency Inversion Principle (DIP)**

- ✅ Depend on abstractions (interfaces), not concrete implementations
- ✅ Example: Agent depends on LLM interface, not specific ChatOpenAI class

### 4. Edge Cases and Error Handling ✅

**Verify all boundary conditions are handled:**

- **Null/Undefined**: Check all nullable values with `?.` or explicit checks
- **Empty Arrays/Objects**: Handle `[]` and `{}` cases
- **Network Failures**: API calls have proper error handling and retries (where appropriate)
- **Authentication Failures**: Token expiration, invalid credentials
- **Rate Limiting**: Handle 429 responses gracefully
- **Timeouts**: Don't hang indefinitely on slow operations
- **Data Validation**: User input is validated before processing

**Example checks:**

```typescript
// ✅ VERIFY: What happens if orders is empty?
const formatOrders = (orders: Order[]) => {
  if (!orders || orders.length === 0) {  // Handle empty case
    return "No orders found.";
  }
  return orders.map(...);
};

// ✅ VERIFY: What if the API call fails?
try {
  const data = await api.fetch();
} catch (error) {
  logger.error("api_error", error);
  return { success: false, error: error.message };  // Graceful degradation
}
```

### 5. Test Coverage ✅

**Verify comprehensive test coverage:**

- **Unit Tests**: ALL new functions and classes have tests
- **Integration Tests**: Multi-component interactions are tested (where applicable)
- **Test Quality**: Tests actually verify correct behavior, not just "code runs"
- **Edge Cases**: Tests cover error paths, null cases, boundary conditions
- **Mocking**: External dependencies are properly mocked
- **Assertions**: Tests have meaningful assertions (not just `expect(result).toBeDefined()`)

**Run tests before committing:**

```bash
# ✅ REQUIRED: All tests must pass
pytest tests/unit/
yarn test

# ✅ REQUIRED: Check coverage meets threshold
pytest --cov=src tests/
```

**Test anti-patterns to catch:**

```typescript
// ❌ BAD: Test doesn't verify behavior
it('should work', () => {
  const result = doSomething();
  expect(result).toBeDefined(); // Too weak!
});

// ✅ GOOD: Test verifies specific behavior
it('should return formatted price with currency', () => {
  const result = formatPrice({ centAmount: 1599, currencyCode: 'USD' });
  expect(result).toBe('$15.99 USD');
});
```

### 6. Code Cleanliness ✅

**Remove temporary artifacts:**

- ❌ Debug `console.log()` / `print()` statements
- ❌ Commented-out code blocks
- ❌ TODO comments without JIRA tickets
- ❌ Unused imports/variables
- ❌ Leftover test fixtures in production code
- ❌ Hardcoded values (use config/env vars)

**Code style:**

- ✅ Consistent formatting (handled by prettier/black)
- ✅ Meaningful variable names (no `tmp`, `data`, `x`)
- ✅ Functions are reasonably sized (<50 lines, extract complex logic)
- ✅ Comments explain "why", not "what"

### 7. Type Safety (TypeScript/Python) ✅

**TypeScript:**

- ✅ No `any` types without justification
- ✅ Proper type inference used where obvious
- ✅ Union types for state machines (not magic strings)
- ✅ Return types explicitly declared on exported functions

**Python:**

- ✅ Type hints on function signatures
- ✅ Pydantic models for config and API schemas
- ✅ No bare `except:` clauses (catch specific exceptions)

### 8. Security Review ✅

**Check for common vulnerabilities:**

- ❌ SQL injection (use parameterized queries)
- ❌ XSS (sanitize user input before rendering)
- ❌ Hardcoded secrets (use env vars / secrets manager)
- ❌ Exposed API keys in client code
- ❌ Insufficient input validation
- ❌ Insecure random number generation (use `secrets` module)

### 9. Performance Considerations ✅

**Check for obvious performance issues:**

- ❌ N+1 queries (batch requests where possible)
- ❌ Missing pagination (don't fetch all records)
- ❌ Unnecessary re-renders (React: use `useMemo`, `useCallback`)
- ❌ Synchronous blocking operations in async context
- ❌ Memory leaks (proper cleanup in useEffect, close connections)

### 10. Documentation ✅

**Verify documentation is updated:**

- ✅ JSDoc/docstrings for complex functions
- ✅ README updated if public API changed
- ✅ Architecture docs updated if patterns changed
- ✅ Migration guide if breaking change (should be rare!)

---

## Review Process

### Step 1: Read Every Changed File

**DO NOT rely on memory of what was written. Re-read actual file content.**

```bash
# Get list of changed files
git diff --name-only

# Read each file
cat path/to/changed/file.ts
```

### Step 2: Trace Call Chains

For features touching multiple files, follow data from source to destination:

```
User Input → API Route → Service → Database → Response
         ↓        ↓         ↓          ↓         ↓
      [VERIFY] [VERIFY] [VERIFY] [VERIFY] [VERIFY]
```

### Step 3: Run Tests for ALL Affected Packages

**CRITICAL — BLOCKING REQUIREMENT**: Before committing or pushing, Claude Code MUST run tests for **every package that has changed files**, not just the primary package being worked on. Changes often affect multiple packages (e.g., a Python backend change may coexist with BFF or frontend changes on the same branch).

**Procedure:**

1. Run `git diff --name-only` to identify all changed files
2. Determine which packages are affected (e.g., `chatbot-ai`, `refapp-bff`, `refapp-webapp`)
3. Run tests for EACH affected package
4. ALL tests must pass before committing

```bash
# 1. Identify affected packages
git diff --name-only

# 2. Run tests per package
# Python
cd apps/generic/<service> && python -m pytest tests/ -v

# TypeScript (specific package)
yarn workspace @phoenix/<package> test --no-coverage

# Python lint
cd apps/generic/<service> && python -m ruff check src tests && python -m ruff format --check src tests
```

**Why this matters**: Pre-existing test failures in adjacent packages block other developers and CI pipelines. A 30-second local test run prevents 20-40 minutes of wasted CI cycles.

### Step 4: Manual Smoke Test (if applicable)

For UI changes or API endpoints:

- Start the service locally
- Test the happy path
- Test an error path
- Check browser console / server logs for errors

### Step 5: Review Against Requirements

Cross-check implementation against:

- JIRA ticket acceptance criteria
- User request (if explicit)
- Architecture docs (e.g., GECOM WoW, component-specific docs)

---

## When This Review Applies

**ALWAYS perform this review:**

- ✅ After completing any feature development (before first commit)
- ✅ After completing any bugfix (before first commit)
- ✅ After resolving merge conflicts (before merge commit)
- ✅ Before pushing to remote (final check)

**Even for "small" changes:**

- ⚠️ One-line bug fixes can introduce new bugs
- ⚠️ Refactoring can break existing behavior
- ⚠️ "Simple" changes can have unexpected side effects

---

## Escalation

If the review reveals issues:

1. **Fix the issues immediately** (don't commit broken code)
2. **Re-run tests** after fixes
3. **Repeat review** if significant changes were made
4. **Ask user for clarification** if requirements are ambiguous

If unsure about a design decision:

- Use `AskUserQuestion` tool to clarify before proceeding
- Document assumptions in code comments
- Flag uncertainties in PR description

---

## Examples of Issues Caught by Review

### Example 1: Parameter Mismatch

```typescript
// Implementation
function fetchOrders(userId: string, limit: number): Promise<Order[]> { ... }

// Caller (WRONG)
fetchOrders(limit, userId);  // ❌ Parameters reversed!

// Review would catch: "Are parameters in correct order?"
```

### Example 2: Missing Null Check

```typescript
// Implementation (UNSAFE)
function getTotal(cart) {
  return cart.items.reduce((sum, item) => sum + item.price, 0);
}

// Review would catch: "What if cart.items is undefined?"
// Fix:
function getTotal(cart) {
  if (!cart?.items) return 0;
  return cart.items.reduce((sum, item) => sum + item.price, 0);
}
```

### Example 3: Breaking Change Without Migration

```typescript
// PR changes schema (BAD)
- customerEmail: string
+ customer: { email: string, name: string }

// Review would catch: "This breaks existing queries! Use expand & contract."
// Fix: Add customer field, keep customerEmail, migrate, then remove old field in separate PR
```

### Example 4: Missing Test Coverage

```python
# New function added
def calculate_discount(price: int, discount_pct: float, max_discount: int) -> int:
    discount = int(price * discount_pct / 100)
    return min(discount, max_discount)

# Review would ask: "Where are the tests for this function?"
# Add: test_calculate_discount.py with edge cases (0%, 100%, max cap, etc.)
```

---

## Checklist Summary

Before committing, verify:

- [ ] End-to-end flow traced through all files
- [ ] Parameters correct at all call sites
- [ ] Architectural patterns followed (expand & contract, connectors, Zustand, etc.)
- [ ] SOLID principles adhered to
- [ ] Edge cases and error handling present
- [ ] Unit tests written and passing
- [ ] Test coverage meets threshold (80%+)
- [ ] No debug logs, TODOs, commented code
- [ ] Type safety maintained (no `any`, proper types)
- [ ] Security vulnerabilities checked
- [ ] Performance issues addressed
- [ ] Documentation updated
- [ ] Manual smoke test passed (if applicable)
- [ ] All tests pass locally: `pytest` / `yarn test`

**Only commit after ALL checks pass.**

---

**Last Updated**: 2026-03-13
**Applies To**: All GECOM development (chatbot-ai, webapp, BFF, services)
