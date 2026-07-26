# Testing Requirements

This document defines testing standards for the GECOM monorepo.

---

## Testing Hierarchy

| Test Type           | Purpose                                           | Required            |
| ------------------- | ------------------------------------------------- | ------------------- |
| Unit Tests          | Test individual functions/components in isolation | ✅ Required         |
| Integration Tests   | Test component interactions with mocked backends  | ⚠️ Where applicable |
| E2E Tests           | Test complete user flows                          | ⚠️ Critical paths   |
| Accessibility Tests | Validate WCAG compliance                          | ✅ Required for UI  |

---

## Unit Testing Standards

### Requirements

- **Coverage Target**: 80%+ for new code
- **Framework**: Jest + React Testing Library
- **Mock Strategy**: Mock external dependencies, test logic in isolation

### React Component Tests

Use React Testing Library following accessibility-first selection:

```typescript
// ✅ GOOD - Select by role (accessible)
const button = screen.getByRole('button', { name: 'Submit' });
const heading = screen.getByRole('heading', { level: 1 });

// ⚠️ ACCEPTABLE - When role isn't available
const element = screen.getByText('Welcome');
const input = screen.getByLabelText('Email');

// ❌ AVOID - Test IDs are last resort
const element = screen.getByTestId('submit-button');
```

### Test Structure

```typescript
describe('ProductCard', () => {
  // Arrange
  const mockProduct = createMockProduct();

  it('should render product name', () => {
    // Act
    render(<ProductCard product={mockProduct} />);

    // Assert
    expect(screen.getByRole('heading', { name: mockProduct.name })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const onClick = jest.fn();
    render(<ProductCard product={mockProduct} onClick={onClick} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledWith(mockProduct.id);
  });
});
```

---

## Integration Testing

### When to Write Integration Tests

- API integrations with mocked backends
- State management flows (Zustand stores)
- Multi-component interactions
- Form submissions and validation

### Mocking External Services

```typescript
// Mock CommerceTools client
jest.mock('@/services/commercetools', () => ({
  getProduct: jest.fn().mockResolvedValue(mockProduct),
  addToCart: jest.fn().mockResolvedValue(mockCart),
}));

// Mock GraphQL with MSW
const server = setupServer(
  graphql.query('GetProduct', (req, res, ctx) => {
    return res(ctx.data({ product: mockProduct }));
  }),
);
```

---

## Accessibility Testing

### Chrome DevTools Accessibility Tree

Use Chrome's accessibility tree for validation:

1. Open DevTools → Elements panel
2. Click accessibility icon in sidebar
3. Enable "Enable full-page accessibility tree"

### Automated A11y Testing

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<ProductCard product={mockProduct} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Screen Reader Testing

Test complex features with screen readers:

- VoiceOver (macOS)
- NVDA (Windows)

---

## Snapshot Testing

### When to Use

- UI consistency validation for stable components
- Visual regression prevention
- Complex styled components

### Usage

```bash
# Generate/update snapshots
yarn test:updateSnapshots --filter=webapp-shared-ui

# Run tests with snapshot comparison
yarn test --filter=webapp-shared-ui
```

**Caution**: Use sparingly. Too many snapshots create maintenance burden.

---

## Running Tests

### Commands

```bash
# Run all tests
yarn test

# Run tests for specific package
yarn test --filter=@phoenix/refapp-webapp

# Run tests for changed packages
yarn turbo run test --filter='[origin/main]'

# Run with coverage
yarn test --filter=@phoenix/refapp-webapp -- --coverage

# Run single test file
yarn workspace @phoenix/refapp-webapp test -- path/to/test.tsx
```

### Pre-PR Checklist

- [ ] All tests pass: `yarn test`
- [ ] Coverage meets threshold: `yarn test -- --coverage`
- [ ] No console errors in test output
- [ ] Snapshots updated if UI changed

---

## Confluence References

- [Testing Process](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2826436632/GECOM+WoW+Ways+of+Working#Testing-Process)
- [Development WoW](https://catalina.atlassian.net/wiki/spaces/NEA/pages/2826207304/Development+Ways+of+Working)
