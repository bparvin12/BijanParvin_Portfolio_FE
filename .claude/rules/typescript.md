# TypeScript Standards

This document defines TypeScript coding standards for the GECOM monorepo.

---

## Core Principles

1. **Type Safety First** - Prefer explicit types over `any`
2. **Immutability** - Use `Readonly<>` for props and data structures
3. **Inference** - Let TypeScript infer when types are obvious
4. **Documentation** - Use JSDoc for complex logic

---

## Forbidden Patterns

### ❌ Using `any` Without Justification

```typescript
// ❌ BAD - Never use any without justification
const data: any = fetchData();
function process(input: any): any {}

// ✅ GOOD - Use proper types
const data: ProductResponse = fetchData();
function process(input: ProductInput): ProductOutput {}

// ⚠️ ACCEPTABLE - With documented justification
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyData: any = legacyApi.getData(); // TODO: Type after API migration
```

### ❌ Missing Return Types

```typescript
// ❌ BAD - Missing return type
function getProduct(id: string) {
  return productService.find(id);
}

// ✅ GOOD - Explicit return type
function getProduct(id: string): Promise<Product> {
  return productService.find(id);
}
```

### ❌ Type Assertions Over Type Guards

```typescript
// ❌ BAD - Unsafe type assertion
const product = data as Product;

// ✅ GOOD - Type guard
function isProduct(data: unknown): data is Product {
  return typeof data === 'object' && data !== null && 'id' in data;
}

if (isProduct(data)) {
  // data is typed as Product here
}
```

---

## Required Patterns

### Readonly Props

Mark React component props as `Readonly<>`:

```typescript
// ✅ Required pattern
type ProductCardProps = Readonly<{
  product: Product;
  onClick?: (id: string) => void;
  isLoading?: boolean;
}>;

const ProductCard = ({ product, onClick, isLoading = false }: ProductCardProps) => {
  // ...
};
```

### Strict Null Checks

Handle nullable values explicitly:

```typescript
// ❌ BAD - Ignoring potential null
const name = product.name.toUpperCase();

// ✅ GOOD - Handle null case
const name = product.name?.toUpperCase() ?? 'Unknown';

// ✅ GOOD - Type narrowing
if (product.name) {
  const name = product.name.toUpperCase();
}
```

### Union Types for State

Use discriminated unions for complex state:

```typescript
// ✅ GOOD - Discriminated union
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Usage
if (state.status === 'success') {
  // TypeScript knows state.data exists here
  console.log(state.data);
}
```

---

## GraphQL Types

### Generated Types

After schema changes, regenerate types:

```bash
yarn generate  # Regenerates all workspaces
yarn workspace @phoenix/refapp-webapp generate  # Specific workspace
```

### Using Generated Types

```typescript
import type { GetProductQuery, ProductFragment } from '@/generated/graphql';

// Use generated types directly
const product: ProductFragment = data.product;

// For query variables
const variables: GetProductQueryVariables = { id: '123' };
```

---

## Module Boundaries

### Import Restrictions

```typescript
// ❌ BAD - Importing from private module paths
import { helper } from '@phoenix/shared-ui/src/utils/internal';

// ✅ GOOD - Import from public exports
import { Button } from '@phoenix/webapp-shared-ui';
```

### Re-exports

```typescript
// index.ts - Public API only
export { Button } from './Button';
export type { ButtonProps } from './Button';
// Don't export internal utilities
```

---

## Error Handling

### Custom Error Classes

```typescript
// Define custom errors
class CommerceError extends Error {
  constructor(message: string, public readonly code: string, public readonly statusCode: number) {
    super(message);
    this.name = 'CommerceError';
  }
}

// Usage
throw new CommerceError('Product not found', 'PRODUCT_NOT_FOUND', 404);
```

### Error Boundaries

```typescript
// Type error handler props
type ErrorFallbackProps = Readonly<{
  error: Error;
  resetErrorBoundary: () => void;
}>;
```

---

## JSDoc for Complex Logic

```typescript
/**
 * Calculates the discounted price for a product.
 *
 * @param basePrice - Original price in cents
 * @param discount - Discount percentage (0-100)
 * @param maxDiscount - Maximum discount cap in cents
 * @returns Final price in cents, never below 0
 *
 * @example
 * calculateDiscountedPrice(10000, 20, 3000) // Returns 8000 (20% of 10000 = 2000)
 * calculateDiscountedPrice(10000, 50, 3000) // Returns 7000 (capped at 3000)
 */
function calculateDiscountedPrice(basePrice: number, discount: number, maxDiscount?: number): number {
  // ...
}
```

---

## Tooling

### ESLint Rules

Key TypeScript ESLint rules enforced:

- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/explicit-function-return-type`
- `@typescript-eslint/strict-boolean-expressions`
- `@typescript-eslint/no-non-null-assertion`

### VS Code Settings

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```
