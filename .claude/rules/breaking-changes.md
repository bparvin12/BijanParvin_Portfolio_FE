# Breaking Changes: Expand & Contract Pattern

This document defines how to handle schema and API changes without causing downtime.

---

## The Problem

Breaking changes in a distributed system cause failures:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │ ──► │    BFF      │ ──► │ CommerceTools│
│  (expects   │     │ (changed    │     │             │
│  old field) │     │  schema)    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       ❌ BREAKS because frontend expects old field
```

---

## What Is a Breaking Change?

### ❌ Breaking Changes (AVOID)

| Action                         | Why It Breaks                          |
| ------------------------------ | -------------------------------------- |
| Removing a field               | Clients expecting the field will fail  |
| Renaming a field               | Same as removing + adding new          |
| Changing field type            | Type mismatches cause errors           |
| Making optional field required | Existing data may be invalid           |
| Changing enum values           | Existing code may reference old values |

### ✅ Non-Breaking Changes (SAFE)

| Action                    | Why It's Safe                 |
| ------------------------- | ----------------------------- |
| Adding new optional field | Clients ignore unknown fields |
| Adding new enum value     | Existing code won't use it    |
| Deprecating a field       | No immediate impact           |
| Adding new endpoint       | Doesn't affect existing code  |

---

## Expand & Contract Pattern

### The Solution

Make changes in three phases:

```
Phase 1: EXPAND          Phase 2: MIGRATE         Phase 3: CONTRACT
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ old_field ✓     │      │ old_field ⚠️     │      │                 │
│ new_field ✓     │      │ new_field ✓     │      │ new_field ✓     │
└─────────────────┘      └─────────────────┘      └─────────────────┘
   Both exist              Frontend migrated         Old field removed
```

### Step-by-Step Process

#### Step 1: Expand (Add New Field)

```typescript
// GraphQL Schema - ADD new field, keep old
type Product {
  name: String @deprecated(reason: "Use localizedName")
  localizedName: LocalizedString!  // NEW
}

// Resolver - Return both
const ProductResolver = {
  Product: {
    name: (product) => product.name,  // Keep for now
    localizedName: (product) => product.localizedName,  // New
  }
};
```

**PR**: `feat(bff): [UG-XXXX] add localizedName field to Product`

Deploy to all environments.

#### Step 2: Migrate Frontend

```typescript
// Before
const ProductName = ({ product }) => <h1>{product.name}</h1>;

// After
const ProductName = ({ product }) => <h1>{product.localizedName.en}</h1>;
```

**PR**: `feat(webapp): [UG-XXXX] use localizedName in ProductCard`

Deploy to all environments.

#### Step 3: Contract (Remove Old Field)

```typescript
// GraphQL Schema - REMOVE old field
type Product {
  localizedName: LocalizedString!
  // name field removed
}

// Resolver - Remove old field
const ProductResolver = {
  Product: {
    localizedName: (product) => product.localizedName,
    // name resolver removed
  }
};
```

**PR**: `chore(bff): [UG-XXXX] remove deprecated name field from Product`

**IMPORTANT**: This must be a SEPARATE PR after frontend is fully migrated.

---

## Real-World Example: Cart Price Change

### Scenario

Need to change cart total from `centAmount: number` to `Money` type.

### Implementation

**Step 1: Expand**

```graphql
type Cart {
  totalCentAmount: Int @deprecated(reason: "Use totalPrice")
  totalPrice: Money! # NEW
}
```

**Step 2: Migrate**

```tsx
// Old
<Price amount={cart.totalCentAmount} currency="USD" />

// New
<Price
  amount={cart.totalPrice.centAmount}
  currency={cart.totalPrice.currencyCode}
/>
```

**Step 3: Contract**

```graphql
type Cart {
  totalPrice: Money!
  # totalCentAmount removed
}
```

---

## Common Scenarios

### Renaming a Field

```graphql
# Step 1: Add new field
type User {
  userName: String @deprecated(reason: "Use displayName")
  displayName: String!
}

# Step 2: Update all consumers
# Step 3: Remove old field
type User {
  displayName: String!
}
```

### Changing Field Type

```graphql
# Step 1: Add new typed field
type Product {
  price: Int @deprecated(reason: "Use priceInfo")
  priceInfo: PriceInfo!
}

# Step 2: Migrate consumers
# Step 3: Remove old field, optionally rename new
type Product {
  price: PriceInfo! # Can reuse name after migration
}
```

### Making Optional Required

```graphql
# Step 1: Add required field with different name
type Address {
  postalCode: String # Optional
  zipCode: String! # Required, new name
}

# Step 2: Ensure all data has zipCode populated
# Step 3: Remove optional version
type Address {
  postalCode: String! # Now required (can reuse name)
}
```

---

## Checklist

Before removing a deprecated field:

- [ ] New field deployed to ALL environments
- [ ] All frontend code migrated to new field
- [ ] Frontend deployed to ALL environments
- [ ] Monitoring shows no usage of old field
- [ ] Separate PR for field removal
- [ ] Tested in DEV/QA before Staging/Production

---

## Anti-Patterns

### ❌ Removing and Adding in Same PR

```
// WRONG - Single PR that breaks clients
- totalCentAmount: Int
+ totalPrice: Money
```

### ❌ Renaming Without Deprecation Period

```
// WRONG - Instant rename
- name: String
+ displayName: String
```

### ❌ Removing Before Frontend Migration

```
// WRONG - Remove backend field while frontend still uses it
Backend PR: Remove field
Frontend PR: Still pending
Result: 💥 Production errors
```

---

## Confluence References

- [Breaking vs Non-Breaking Changes](https://catalina.atlassian.net/wiki/spaces/NEA/pages/XXXXX)
- [GECOM WoW](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2826436632)
