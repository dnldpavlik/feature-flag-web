# Definition of Done

This document defines the criteria that must be met before any feature, bug fix, or enhancement can be considered complete.

## Pre-Development

- [ ] **Requirements clarified** - User stories or requirements are understood and any ambiguities resolved
- [ ] **Acceptance criteria defined** - Clear, testable acceptance criteria exist for the work
- [ ] **Design reviewed** (if applicable) - UI/UX designs are approved and assets available

## Development Standards

### Code Quality

- [ ] **TDD followed** - Tests written before implementation (Red-Green-Refactor)
- [ ] **SOLID principles applied** - Code follows Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- [ ] **Functional patterns used** - Pure functions, immutability, composition over inheritance
- [ ] **No console.log statements** - Debug statements removed
- [ ] **No commented-out code** - Dead code removed
- [ ] **Meaningful naming** - Variables, functions, and classes have descriptive names

### Angular Standards

- [ ] **Standalone components** - All new components are standalone
- [ ] **Signals used** - State management uses Angular signals where appropriate
- [ ] **OnPush change detection** - Components use `ChangeDetectionStrategy.OnPush`
- [ ] **New control flow syntax** - Uses `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`
- [ ] **inject() function** - Uses `inject()` instead of constructor injection

## Testing Requirements

### Unit Tests (Jest)

- [ ] **All new code has unit tests** - No untested production code
- [ ] **Coverage threshold met** - Minimum 80% coverage, aim for 90%+
- [ ] **Tests are meaningful** - Tests verify behavior, not implementation details
- [ ] **Edge cases covered** - Null values, empty arrays, error states tested
- [ ] **Tests pass locally** - `npm test` passes without failures

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage
```

### E2E Tests (Playwright)

- [ ] **Journey tests written** - User workflows have end-to-end coverage
- [ ] **Regression tests pass** - `npm run e2e:regression` has no failures
- [ ] **Journey tests pass** - `npm run e2e:journeys` has no failures
- [ ] **Page objects used** - E2E tests use page object pattern
- [ ] **Tests are deterministic** - No flaky tests introduced

```bash
# Run regression tests
npm run e2e:regression

# Run journey tests
npm run e2e:journeys

# Run all E2E tests
npm run e2e
```

### Test Checklist by Feature Type

#### New Component
- [ ] Unit tests for component logic
- [ ] Unit tests for inputs/outputs
- [ ] Unit tests for user interactions
- [ ] E2E test for component in context

#### New Service
- [ ] Unit tests for all public methods
- [ ] Unit tests for error handling
- [ ] Mock external dependencies

#### New Feature/Page
- [ ] Unit tests for all components
- [ ] Unit tests for all services
- [ ] Journey test for happy path
- [ ] Journey test for error scenarios
- [ ] Regression tests for edge cases

#### Bug Fix
- [ ] Regression test that reproduces the bug
- [ ] Test passes after fix
- [ ] No existing tests broken

## Static Analysis

- [ ] **TypeScript compiles** - `npm run typecheck` passes with no errors
- [ ] **Linting passes** - `npm run lint` shows no errors
- [ ] **Formatting applied** - `npm run format` has been run

```bash
# Run all checks
npm run typecheck
npm run lint
npm run format
```

## Accessibility

- [ ] **Keyboard navigation works** - All interactive elements are keyboard accessible
- [ ] **Focus indicators visible** - Focus states are clearly visible
- [ ] **ARIA attributes correct** - Proper roles, labels, and states
- [ ] **Form fields labeled** - All inputs have associated labels
- [ ] **Color contrast sufficient** - Text meets WCAG AA standards
- [ ] **Screen reader tested** (for significant UI changes)

## Responsive Design

- [ ] **Mobile viewport works** - UI functions at 375px width
- [ ] **Tablet viewport works** - UI functions at 768px width
- [ ] **Desktop viewport works** - UI functions at 1280px+ width
- [ ] **No horizontal scroll** - Content doesn't overflow viewport

## Documentation

- [ ] **Code comments** - Complex logic has explanatory comments
- [ ] **JSDoc for public APIs** - Public functions/methods are documented
- [ ] **README updated** (if applicable) - New setup steps or features documented
- [ ] **CHANGELOG updated** (if applicable) - Notable changes recorded

## Git & Version Control

- [ ] **Commits are atomic** - Each commit represents one logical change
- [ ] **Commit messages follow convention** - Uses `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`
- [ ] **No sensitive data committed** - No secrets, API keys, or credentials
- [ ] **Branch is up to date** - Rebased on latest main/master

## Pre-Merge Checklist

```bash
# Run this sequence before considering work complete:

# 1. Type checking
npm run typecheck

# 2. Linting
npm run lint

# 3. Unit tests with coverage
npm run test:coverage

# 4. E2E regression tests
npm run e2e:regression

# 5. E2E journey tests
npm run e2e:journeys

# 6. Build verification
npm run build
```

## Review Criteria

- [ ] **Self-review completed** - Developer has reviewed their own code
- [ ] **PR description complete** - Clear summary of changes and testing done
- [ ] **Screenshots included** (for UI changes) - Before/after or new UI shown
- [ ] **Breaking changes noted** - Any breaking changes clearly documented

## Definition of Done Summary

A feature is **DONE** when:

1. All acceptance criteria are met
2. All tests pass (unit + E2E)
3. Code coverage thresholds are met
4. Static analysis passes (TypeScript, ESLint)
5. Code is formatted
6. Accessibility requirements are met
7. Responsive design is verified
8. Documentation is updated
9. Code is reviewed and approved
10. Changes are merged to main branch

---

## Quick Reference Commands

```bash
# Full verification sequence
npm run typecheck && npm run lint && npm test && npm run e2e:regression && npm run e2e:journeys && npm run build

# Development workflow
npm run test:watch    # TDD - run tests in watch mode
npm start             # Start dev server
npm run lint:fix      # Auto-fix linting issues

# E2E debugging
npm run e2e -- --ui   # Open Playwright UI
npm run e2e -- --debug # Debug mode
```
