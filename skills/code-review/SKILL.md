# Skill: Code Review Checklist

## Purpose
Systematic code review against this project's established conventions and quality standards.

## When to Use
- Reviewing PRs or new code
- Self-review before committing
- Periodic codebase audits

## Checklist

### 1. Angular Conventions
- [ ] Components are standalone (no `standalone: true` needed — it's the default)
- [ ] `ChangeDetectionStrategy.OnPush` on every component
- [ ] Uses `input()` / `output()` functions (not `@Input`/`@Output` decorators)
- [ ] Uses `inject()` for DI (not constructor injection)
- [ ] Uses `host: {}` for host bindings (not `@HostBinding`/`@HostListener`)
- [ ] Templates use `@if`/`@for`/`@switch` (not `*ngIf`/`*ngFor`/`*ngSwitch`)
- [ ] Uses `computed()` for derived state
- [ ] Uses `signal()` for local mutable state
- [ ] Imports specific items (not `CommonModule`)

### 2. State Management
- [ ] Store signals are private (`_items`) with public readonly selectors (`items`)
- [ ] State updates are immutable (`.set()`, `.update()` with spread/map/filter)
- [ ] Uses `firstValueFrom()` to convert Observable → Promise
- [ ] Error handling: catches errors, sets error signal, shows toast
- [ ] Audit logging on successful mutations
- [ ] Loading state managed (set true before, false in finally)

### 3. API Layer
- [ ] Extends `CrudApi<T, C, U>` for standard CRUD entities
- [ ] FlagApi normalizes `resourceName` → `name` on all responses
- [ ] PATCH responses merged with existing store data (not used directly)
- [ ] Uses `API_BASE_URL` injection token

### 4. Type Safety
- [ ] No `any` type (except in `.spec.ts` files)
- [ ] Separate input types from domain models (e.g., `CreateFlagInput` vs `Flag`)
- [ ] Discriminated unions for variant types
- [ ] `as const` for option arrays
- [ ] Explicit return types on functions (ESLint enforced)

### 5. File Naming
- [ ] Components: `kebab-case.ts` (no `.component` suffix)
- [ ] Services: `kebab-case.service.ts`
- [ ] Stores: `kebab-case.store.ts`
- [ ] Models: `kebab-case.model.ts`
- [ ] Utilities: `kebab-case.utils.ts`
- [ ] Tests: `kebab-case.spec.ts`
- [ ] Selectors: `app-kebab-case`

### 6. SCSS / Styling
- [ ] BEM naming convention (`.block__element--modifier`)
- [ ] Uses CSS custom properties from `_variables.scss`
- [ ] No inline styles
- [ ] `:host` for component root styling
- [ ] Responsive breakpoints: `(width < 768px)` for mobile
- [ ] Uses `@use 'styles/mixins' as *` when needed

### 7. Testing (TDD)
- [ ] Tests written before implementation
- [ ] 100% coverage maintained
- [ ] AAA pattern (Arrange-Act-Assert)
- [ ] Uses helpers from `src/app/testing/`
- [ ] Store tests use `mockApiProviders`
- [ ] Component tests use `@testing-library/angular`
- [ ] E2E uses page objects extending `BasePage`/`BaseCrudListPage`
- [ ] E2E: `dispatchEvent('click')` on `<app-button>` host elements
- [ ] E2E: 15s timeout for API-dependent assertions

### 8. Functional Programming
- [ ] Pure functions for data transformations (no side effects)
- [ ] Immutable data (no `.push()`, no direct property mutation)
- [ ] Function composition where applicable
- [ ] Higher-order filter functions from `filter.utils.ts`

### 9. Code Quality
- [ ] No `console.log` (only `console.warn`/`console.error` where needed)
- [ ] No commented-out code
- [ ] Single responsibility per file/class/function
- [ ] `prefer-const` enforced
- [ ] `===` only (no `==`)
- [ ] Curly braces on all blocks

### 10. Security
- [ ] No secrets in code or environment.ts
- [ ] Input validation on forms
- [ ] No `innerHTML` bindings (use Angular sanitization)
- [ ] API calls go through typed service layer

## Severity Levels

| Level | Description | Example |
|-------|-------------|---------|
| **Blocker** | Breaks build, tests, or security | Missing tests, `any` types, secrets in code |
| **Major** | Violates core conventions | Constructor injection, `*ngIf`, mutable state |
| **Minor** | Style or optimization issue | Missing BEM modifier, verbose computed signal |
| **Suggestion** | Nice to have improvement | Better function composition, extract utility |
