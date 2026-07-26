# GECOM Development Guidelines

This document provides development standards and ways of working for the GECOM engineering team and Claude Code (AI assistant).

---

## 📋 GECOM Ways of Working (WoW)

### Core Principles

- **Trunk-based development**: All work merges to `main` branch
- **Small, focused PRs**: Changes should be reviewable in ~30 minutes
- **Test coverage required**: Unit tests for all code, integration tests where applicable
- **No breaking changes**: Always use expand & contract pattern for schema changes
- **Cross-functional teams**: Dev, QA, BA, UX, DevOps collaboration

### Team Structure

Teams are organized by geography and domain area:

- Small, cross-functional teams (5-9 people)
- Available roles: Engineers, QA, BA, UX (accessible), DevOps (accessible)
- Governance team coordinates across all teams

---

## 🌳 Branching & Git Workflow

### Branch Naming Convention

**Format**: `<type>/<ticket-number>-<description>`

**Types**:

- `feature/` or `feat/` - New feature development
- `fix/` - Bug fixes and patches
- `hotfix/` - Urgent production issues
- `experiment/` - Investigations/spikes (not merged to main)
- `chore/` - Maintenance, refactoring, dependency updates

**Examples**:

```
feature/UG-7903-acp-checkout-sessions
fix/UG-8194-event-broker-bug
hotfix/UG-9001-payment-critical-fix
chore/update-dependencies
```

**Rules**:

- Branch from latest `main`
- Keep branches short-lived (merge within 1-2 days)
- Delete feature branches after merge
- Use semantic branch naming (enforced via `.branchnamelintrc`)

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): [TICKET-ID] <description>

[optional body]

[optional footer]
```

**Types**:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code restructuring without changing behavior
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `ci` - CI/CD changes

**Examples**:

```
feat(payment): [UG-1234] add Stripe payment integration
fix(commerce): [UG-5678] resolve cart calculation error
docs(acp): update API documentation
```

**Breaking Changes**:

```
feat(api)!: [UG-9999] remove deprecated endpoints

BREAKING CHANGE: The /v1/legacy endpoint has been removed.
Use /v2/checkout instead.
```

---

## 🔀 Pull Request Process

### 1. Creating a PR

**PR Title Format**:

```
<type>(<scope>): [TICKET-ID] description
```

**PR Description Must Include**:

- **Summary**: What changed and why
- **Screenshots/Videos**: For UI changes (use Loom, CloudApp, or GitHub attachments)
- **Testing Instructions**: Clear steps to verify changes
- **JIRA Link**: Link to ticket (e.g., https://catalina.atlassian.net/browse/UG-1234)
- **Deployment Notes**: Any special deployment steps or environment changes
- **Breaking Changes**: If applicable, clearly marked

**PR Template**:

```markdown
## Summary

Brief description of what this PR does.

## Changes

- Added feature X
- Fixed bug Y
- Updated documentation Z

## Testing

1. Step-by-step testing instructions
2. Expected results
3. Edge cases tested

## Screenshots/Videos

[Attach or link here]

## JIRA

[UG-1234](https://catalina.atlassian.net/browse/UG-1234)

## Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or marked as BREAKING CHANGE)
- [ ] All checks passing
```

### 2. PR Review Requirements

**Approval Rules**:

- Minimum **2 approvers** required (not the author)
- All automated checks must pass:
  - ✅ Unit tests
  - ✅ Integration tests
  - ✅ Linting (ESLint, TypeScript)
  - ✅ Code coverage threshold
  - ✅ Security scans
  - ✅ Build successful

**What Reviewers Should Check**:

- Code quality and readability
- Test coverage and quality
- Breaking changes (should use expand & contract)
- Security vulnerabilities
- Performance implications
- Accessibility compliance (for UI changes)
- Documentation accuracy

**Review Turnaround**:

- Aim to review within 24 hours
- Use GitHub review features (Approve, Request Changes, Comment)
- Be constructive and specific in feedback

### 3. PR Visibility & Communication

**Post PR in Teams**:

- Channel: **👨‍👩‍👧‍👦 MG+VT PRs**
- Include: PR link, brief description, reviewers needed

**Update JIRA**:

- Move ticket to **"Code Review"** status
- Add PR link to ticket
- Update with any blockers or dependencies

### 4. Merging

**Merge Strategy**: **Squash and Merge**

- Squashes all commits into single commit on `main`
- Maintains clean git history
- Automatic branch deletion after merge

**After Merge**:

- GitHub Actions triggers DEV deployment
- Move JIRA to **"Ready for QA"** or **"DEV"**
- Verify deployment on DEV environment
- Monitor for errors in Datadog/CloudWatch

---

## 🧪 Testing Requirements

### Test Categories

**1. Unit Tests (Required)**

- Test individual functions/components in isolation
- Mock external dependencies (APIs, databases, services)
- Use Jest + ts-jest for Node.js
- Use Jest + React Testing Library for React
- Target: **80%+ code coverage**
- Location: `__tests__/` or `*.test.ts` / `*.spec.ts`

**2. Integration Tests (Where Applicable)**

- Test multiple components working together
- Use real implementations where feasible, mock external services
- Test API integrations with mocked backends
- Test state management flows
- Examples: GraphQL resolvers with mocked CommerceTools

**3. E2E Tests (Critical Flows)**

- Test complete user journeys through browser
- Use Playwright for browser automation
- Run on staging/QA environments
- Cover critical business flows (checkout, payments, orders)
- Location: `apps/refapp/refapp-tests/`

**4. API/Contract Tests**

- Validate GraphQL schemas with graphql-inspector
- Test REST API contracts with Supertest
- Ensure backward compatibility

**5. Accessibility Tests**

- Validate with Chrome DevTools accessibility tree
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Use React Testing Library accessibility queries
- Run automated a11y checks in tests

**6. Visual Regression Tests**

- Playwright visual comparisons
- Storybook snapshot tests
- Compare against baseline images

**7. Performance Tests**

- Lighthouse scores (PWA, performance, accessibility)
- Bundle size analysis (webpack-bundle-analyzer)
- Load testing for critical endpoints

**8. Security Tests**

- Dependency vulnerability scans (npm audit, Snyk)
- Static code analysis (SonarQube)
- PEN tests (scheduled separately)

### Testing Best Practices

**React Component Tests**:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('button click increments counter', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  // Query by role (accessibility-first)
  const button = screen.getByRole('button', { name: /increment/i });
  const count = screen.getByText(/count:/i);

  await user.click(button);

  expect(count).toHaveTextContent('Count: 1');
});
```

**Lambda/API Tests**:

```typescript
import { handler } from '../src/handlers/checkout';
import { mockDynamoDB } from '@aws-sdk/client-dynamodb-mock';

test('creates checkout session', async () => {
  const event = { body: JSON.stringify({ items: [...] }) };

  const response = await handler(event);

  expect(response.statusCode).toBe(201);
  expect(JSON.parse(response.body)).toHaveProperty('sessionId');
});
```

### Running Tests

```bash
# Run all tests
npm run test
```

---

## 💻 Code Quality Standards

### TypeScript

**Type Safety**:

```typescript
// ✅ Good - Explicit types
interface UserProps {
  name: string;
  email: string;
  age?: number;
}

function getUser(id: string): Promise<UserProps> {
  // implementation
}

// ❌ Bad - Using any
function getUser(id: any): any {
  // avoid this
}
```

**Readonly Props**:

```typescript
// ✅ Good - Immutable props
type Props = Readonly<{
  title: string;
  onClose: () => void;
}>;

// ❌ Bad - Mutable props
type Props = {
  title: string;
  onClose: () => void;
};
```

**Proper Type Inference**:

```typescript
// ✅ Good - Let TypeScript infer
const items = [1, 2, 3]; // inferred as number[]

// ❌ Bad - Unnecessary annotation
const items: number[] = [1, 2, 3];
```

### React Components

**Functional Components with Hooks**:

```typescript
import { useState, useEffect } from 'react';

export const UserProfile: React.FC<Props> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  if (!user) return <Loading />;

  return <div>{user.name}</div>;
};
```

**No Prop Drilling** - Use Zustand for state:

```typescript
// ✅ Good - Use state management
import { useCartStore } from '@/stores/cart';

const CartButton = () => {
  const items = useCartStore(state => state.items);
  return <button>Cart ({items.length})</button>;
};

// ❌ Bad - Prop drilling through multiple levels
<App>
  <Header cart={cart}>
    <Navigation cart={cart}>
      <CartButton cart={cart} />
```

### Styled Components

**Use displayName for Debugging**:

```typescript
import styled from '@emotion/styled';

const Button = styled.button`
  padding: 1rem;
`;
Button.displayName = 'StyledButton';

// Or with component name prefix
const CardTitle = styled.h2``;
CardTitle.displayName = 'Card.Title';
```

**Avoid className** - Use styled components:

```typescript
// ✅ Good
const Container = styled.div`
  display: flex;
`;

// ❌ Bad
<div className="container">
```

**Use shouldForwardProp**:

```typescript
import styled from '@emotion/styled';
import { shouldForwardProp } from '@mui/system';

const Button = styled('button', {
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'variant',
})<{ variant?: 'primary' | 'secondary' }>`
  background: ${(props) => (props.variant === 'primary' ? 'blue' : 'gray')};
`;
```

### ESLint & Prettier

**Auto-fix on Save**:

- Configure editor to run Prettier on save
- ESLint auto-fix enabled

**Pre-commit Hooks** (Husky + lint-staged):

- Automatically formats and lints staged files
- Runs before commit
- Blocks commit if errors exist

**Run Manually**:

```bash
# Lint all files
yarn lint

# Lint and fix
yarn lint --fix

# Format all files
yarn format
```

---

## 🚫 Breaking vs Non-Breaking Changes

### What is a Breaking Change?

A breaking change forces users/consumers to update their code. Common examples:

**❌ Breaking Changes** (Avoid):

- Removing fields from API responses
- Renaming fields in GraphQL schemas
- Making optional fields required
- Changing field types (string → number)
- Removing endpoints
- Changing function signatures

### Expand & Contract Pattern

Use this pattern to avoid breaking changes:

**Phase 1 - Expand**:

```typescript
// Add new field alongside old field
type User = {
  email: string; // old
  emailAddress: string; // new (same value)
  name: string;
};
```

**Phase 2 - Deploy Backend**:

- Deploy API with both fields
- Both fields return the same value
- Log usage of old field (optional)

**Phase 3 - Update Consumers**:

```typescript
// Frontend/consumers switch to new field
const email = user.emailAddress; // use new field
```

**Phase 4 - Deploy Frontend**:

- Deploy frontend changes
- Verify no errors in production

**Phase 5 - Contract** (Separate PR):

```typescript
// Remove old field after grace period (2+ weeks)
type User = {
  emailAddress: string; // only new field remains
  name: string;
};
```

### Non-Breaking Additions

**✅ Safe Changes**:

- Adding new optional fields
- Adding new endpoints
- Adding new function overloads
- Extending enums (append only)
- Adding default values

---

## 🚀 Deployment & Release Workflow


### Release Process

**1. Merge to Main**:

```bash
# PR approved and merged
git checkout main
git pull origin main
```

**2. Create Release Tag**:

```bash
# Tag format: @phoenix/<package>-v<semver>
git tag @phoenix/payment-v2.5.0
git push origin @phoenix/payment-v2.5.0
```

**3. GitHub Actions**:

- Builds application
- Runs tests
- Packages for deployment
- Uploads to S3 (for Lambda) or deploys to Vercel (for webapp)


## 🛠️ Technology Stack

### Backend (Generic Apps)

**Runtime**:

- Node.js 20
- TypeScript 4.8+

**Frameworks**:

- Serverless Framework 3.x (AWS Lambda deployment)
- Express.js 4.x (HTTP server)
- Apollo Server 3.x (GraphQL)

**Testing**:

- Jest 29.x + ts-jest
- Supertest (HTTP testing)
- nock (HTTP mocking)

**AWS Services**:

- Lambda, S3, DynamoDB, Cognito
- Secrets Manager, SNS, SQS, EventBridge
- CloudFront, ALB, API Gateway

**Third-Party Integrations**:

- CommerceTools 7.x (Commerce platform)
- Stripe 19.x / Adyen 5.x (Payments)
- Amplience (Content CMS)
- Klaviyo (Email marketing)
- Datadog (Monitoring)

### Frontend (RefApp)

**Framework**:

- Next.js 12.3.x (React 18.2)
- Server-side rendering (SSR)
- Static generation (SSG)

**UI Libraries**:

- Material-UI (MUI) 5.x
- Emotion (CSS-in-JS)
- React Hook Form 7.x
- Zustand 4.x (State management)

**GraphQL**:

- Apollo Client 3.x
- GraphQL Code Generator

**Testing**:

- Jest + React Testing Library
- Playwright (E2E)
- MSW (API mocking)

**Deployment**:

- Vercel (hosting & CDN)

### Build Tools

- **Turborepo 1.13.x** - Monorepo task orchestration
- **ESBuild** - Fast JavaScript bundling
- **Webpack 5** - Asset bundling
- **Yarn 1.22.x** - Package management
- **Terraform** - Infrastructure as Code

### Code Quality

- **ESLint 8.x** - Linting
- **Prettier 2.8** - Formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **commitlint** - Commit message validation

---

## 📦 Package Scripts

### Common Scripts (All Packages)

```bash
# Development
yarn dev              # Start development server
yarn build            # Build for production
yarn test             # Run tests
yarn test:watch       # Run tests in watch mode
yarn test:coverage    # Run tests with coverage

# Code Quality
yarn lint             # Run ESLint
yarn lint:fix         # Fix ESLint issues
yarn format           # Run Prettier
yarn typecheck        # Run TypeScript compiler

# Deployment
yarn release          # Create release (semantic versioning)
```

### Monorepo Scripts (Root Level)

```bash
# Run across all workspaces
yarn build            # Build all packages
yarn test             # Test all packages
yarn lint             # Lint all packages

# Turborepo commands
yarn dev --filter=@phoenix/payment  # Dev mode for specific package
yarn test --since-main              # Test only changed packages

# Terraform
yarn tf:check         # Validate Terraform configurations
```

---

## 🔐 Security Best Practices

### Secrets Management

**❌ Never**:

- Commit secrets to git (`.env`, API keys, passwords)
- Log sensitive data (tokens, credit cards, PII)
- Hard-code credentials in source code
- Share secrets in Slack/Teams

**✅ Always**:

- Use AWS Secrets Manager for production secrets
- Use `.env` files for local development (git-ignored)
- Use environment variables for configuration
- Rotate secrets regularly

**Example**:

```typescript
// ✅ Good - From Secrets Manager
const apiKey = await getSecretValue('stripe-api-key');

// ❌ Bad - Hard-coded
const apiKey = 'sk_live_abc123';
```

### Dependency Security

```bash
# Check for vulnerabilities
yarn audit

# Fix vulnerabilities
yarn audit fix

# Use Snyk (if available)
snyk test
```

### API Security

- Always validate input (schema validation)
- Sanitize user input (prevent XSS, SQL injection)
- Use rate limiting (API Gateway, ALB)
- Implement authentication (API keys, JWT, OAuth)
- Use HTTPS only (enforce TLS 1.2+)
- Set proper CORS headers

---

## ♿ Accessibility Standards

### Requirements

- **WCAG 2.1 Level AA** compliance
- Keyboard navigation support
- Screen reader compatibility
- Proper ARIA labels
- Color contrast ratios (4.5:1 for text)

### Testing

```typescript
// Use semantic HTML
<button onClick={handleClick}>Submit</button> // ✅
<div onClick={handleClick}>Submit</div>       // ❌

// Query by role
screen.getByRole('button', { name: /submit/i }); // ✅
screen.getByTestId('submit-button');             // ❌

// Add ARIA labels when needed
<button aria-label="Close dialog">×</button>
```

### Tools

- Chrome DevTools Accessibility Tree
- axe DevTools browser extension
- NVDA / JAWS / VoiceOver screen readers
- Lighthouse accessibility audit

---


## 🚨 Common Pitfalls to Avoid

### ❌ Never Do This

- **Commit directly to `main`** - Always use feature branches
- **Skip tests** - All code must have tests
- **Use `any` types** - Use proper TypeScript types
- **Create breaking changes** - Use expand & contract pattern
- **Ignore linting errors** - Fix all ESLint warnings
- **Deploy without testing** - Test in lower environments first
- **Merge without approvals** - Require 2 reviewers
- **Use `console.log`** - Use proper logger
- **Prop drill** - Use state management (Zustand)
- **Ignore accessibility** - Follow WCAG guidelines

### ✅ Always Do This

- **Pull latest `main` before creating branch**
- **Write tests alongside code**
- **Run `yarn lint` and `yarn test` before pushing**
- **Keep PRs small** (< 400 lines changed)
- **Update documentation** when changing APIs
- **Add JIRA ticket references** in commits
- **Post PRs in Teams channel**
- **Monitor deployments** in Datadog/CloudWatch
- **Use semantic commit messages**
- **Document complex logic** with comments

---

## 📚 Key Resources

### External Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [React Testing Library](https://testing-library.com/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools & Repositories

- **Main Repo**: [gecom-apps](https://github.com/Metagenics/gecom-apps)
- **Infrastructure**: [gecom-mach-composer](https://github.com/Metagenics/gecom-mach-composer)
- **JIRA**: https://catalina.atlassian.net/
- **Teams Channel**: 👨‍👩‍👧‍👦 MG+VT PRs

---

## 💡 Tips for Claude Code

### When Writing Code

1. **Read Before Writing**: Always read existing similar files for patterns
2. **Follow Conventions**: Match naming, structure, and style
3. **Add Types**: Use proper TypeScript types
4. **Write Tests**: Include unit tests for new code
5. **Document**: Add JSDoc for complex functions

### When Making Changes

1. **Check Breaking Changes**: Use expand & contract if needed
2. **Update Tests**: Modify tests alongside code
3. **Update Docs**: Keep documentation in sync
4. **Backward Compatibility**: Consider existing consumers

### When Reviewing Code

1. **Check WoW Compliance**: Follow all guidelines
2. **Verify Tests**: Ensure adequate coverage
3. **Look for Breaking Changes**: Validate expand & contract
4. **Check Types**: No `any` without justification
5. **Accessibility**: Validate a11y for UI changes

---

## 🔧 Production Troubleshooting Access

Claude Code has access to production monitoring and infrastructure tools for troubleshooting performance issues, debugging, and investigating incidents.

### Vercel Access

**Common Investigations**:

- Check for "data for page exceeds threshold" warnings in build logs
- Monitor serverless function cold starts
- Verify Edge caching behavior
- Check for slow GraphQL queries in function logs

### Performance Investigation Workflow

1. **Start with Datadog RUM** - Identify slow pages and patterns
2. **Check Vercel Logs** - Look for payload size warnings and slow queries
3. **Analyze Page Data** - Inspect `__NEXT_DATA__` payload sizes
4. **Review CloudFront** - Check caching and compression settings
5. **Trace to Code** - Find specific components causing issues


---

**Maintained By**: Bijan
