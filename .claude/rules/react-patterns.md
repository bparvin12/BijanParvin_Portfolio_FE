# React Patterns and Standards

This document defines React development patterns for the GECOM webapp.

---

## Component Architecture

### Component Types

| Type       | Location                              | Purpose                             |
| ---------- | ------------------------------------- | ----------------------------------- |
| Elements   | `libs/webapp/shared-ui/src/Elements/` | Basic UI primitives (Button, Input) |
| Modules    | `libs/webapp/shared-ui/src/Modules/`  | Composed elements (ProductCard)     |
| Features   | `libs/webapp/shared-ui/src/Features/` | Business logic components           |
| Connectors | `apps/refapp/refapp-webapp/src/api/`  | Data fetching layer                 |

### Separation of Concerns

```
Shared-UI (Presentational)          Webapp API (Logic)
┌─────────────────────────┐        ┌─────────────────────────┐
│  - No data fetching     │   ←──  │  - GraphQL queries      │
│  - No API calls         │        │  - State management     │
│  - Props only           │        │  - Event handlers       │
│  - Render data          │        │  - Business logic       │
└─────────────────────────┘        └─────────────────────────┘
```

---

## Styled Components

### Required: displayName

Add `.displayName` to ALL styled components:

```typescript
// ✅ REQUIRED
const StyledButton = styled.button`
  padding: 8px 16px;
`;
StyledButton.displayName = 'Button.StyledButton';

const StyledContainer = styled.div`
  display: flex;
`;
StyledContainer.displayName = 'ProductCard.Container';
```

This enables easier debugging in React DevTools.

### No className Usage

```typescript
// ❌ BAD - Using className
<div className="product-card">

// ✅ GOOD - Using styled components
const ProductCardContainer = styled.div`
  // styles here
`;
<ProductCardContainer>
```

### shouldNotForwardProps

Prevent custom props from being passed to DOM elements:

```typescript
import { shouldNotForwardProps } from '@phoenix/webapp-shared-ui';

const StyledButton = styled.button.withConfig({
  shouldForwardProp: shouldNotForwardProps(['isActive', 'variant']),
})<{ isActive: boolean; variant: 'primary' | 'secondary' }>`
  background: ${({ isActive }) => (isActive ? 'blue' : 'gray')};
`;
```

---

## State Management

### Zustand for Global State

No prop drilling. Use Zustand stores:

```typescript
// ❌ BAD - Prop drilling
<App>
  <Header cart={cart} />
    <Nav cart={cart} />
      <CartIcon count={cart.items.length} />

// ✅ GOOD - Zustand store
import { useCartStore } from '@/stores/cart';

const CartIcon = () => {
  const itemCount = useCartStore((state) => state.items.length);
  return <Badge count={itemCount} />;
};
```

### Store Pattern

```typescript
// stores/cart.ts
import { create } from 'zustand';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  clearCart: () => set({ items: [] }),
}));
```

---

## Functional Components

### Required Pattern

Always use functional components with hooks:

```typescript
// ❌ BAD - Class components (deprecated)
class ProductCard extends React.Component { }

// ✅ GOOD - Functional component
const ProductCard = ({ product }: Readonly<ProductCardProps>) => {
  const [isHovered, setIsHovered] = useState(false);
  return (/* ... */);
};
```

### Props Pattern

```typescript
// Define props type with Readonly
type ProductCardProps = Readonly<{
  product: Product;
  onClick?: (id: string) => void;
  isLoading?: boolean;
}>;

// Destructure with defaults
const ProductCard = ({ product, onClick, isLoading = false }: ProductCardProps) => {
  // ...
};

// Export component
export { ProductCard };
export type { ProductCardProps };
```

---

## Hooks Best Practices

### Dependency Arrays

```typescript
// ❌ BAD - Missing dependencies
useEffect(() => {
  fetchProduct(productId);
}, []); // Missing productId

// ✅ GOOD - Complete dependencies
useEffect(() => {
  fetchProduct(productId);
}, [productId, fetchProduct]);

// ✅ GOOD - Stable callback with useCallback
const fetchProduct = useCallback(async (id: string) => {
  const product = await api.getProduct(id);
  setProduct(product);
}, []);
```

### Custom Hooks

Extract reusable logic into custom hooks:

```typescript
// hooks/useProduct.ts
export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getProduct(id)
      .then(setProduct)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
};
```

---

## File Structure

### Component Folder

```
Button/
├── Button.tsx              # Main component
├── Button.styled.tsx       # Styled components
├── Button.test.tsx         # Tests
├── Button.stories.tsx      # Storybook stories
├── types.ts                # Type definitions
├── index.ts                # Exports
└── __snapshots__/          # Optional snapshot tests
```

### Index Exports

```typescript
// index.ts
export { Button } from './Button';
export type { ButtonProps } from './types';
```

---

## Connector Pattern

Features require connectors to bind data:

```typescript
// src/api/features/ProductCard/ProductCardConnector.tsx
import { ProductCard } from '@phoenix/webapp-shared-ui';
import { useProductQuery } from '@/generated/graphql';

export const ProductCardConnector = ({ productId }: { productId: string }) => {
  const { data, loading, error } = useProductQuery({ variables: { id: productId } });

  if (loading) return <ProductCard.Skeleton />;
  if (error) return <ProductCard.Error />;

  return <ProductCard product={mapProduct(data.product)} onAddToCart={handleAddToCart} />;
};
```

---

## Storybook

### Story Structure

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Elements/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

// Default story - minimal props
export const Default: Story = {
  args: {
    children: 'Click me',
  },
};

// Variants
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Loading...',
  },
};
```

### Running Storybook

```bash
yarn storybook  # At repo root
```

---

## Confluence References

- [UI Development WoW](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2826207304/Development+Ways+of+Working#UI-Development)
- [Shared-UI Library Structure](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2826207304/Development+Ways+of+Working#Creating-New-Elements-or-Modules-in-Shared-UI-Library)
