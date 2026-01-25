# Full Code Review — 2026-01-23

## Overview

This review evaluates the Feature Flags Web (Angular 20) codebase against the standards defined in `CLAUDE.md` and `.claude/CLAUDE.md`. It covers SOLID principles, functional programming patterns, Angular 20 best practices, separation of concerns, and architectural adherence.

---

## 1. Structural/Architectural Deviations from Design

### A. Missing `core/` directory

The design specifies:

```
src/app/core/
├── auth/
├── api/
├── error-handling/
└── config/
```

None of this exists. There are no API services, no error handling layer, no auth, no interceptors, no guards. All data is hardcoded mock data inside stores.

### B. `layout/` in wrong location

Design says `src/app/layout/` but actual location is `src/app/shared/layout/`. Minor, but diverges from the spec.

### C. Cross-feature coupling with `EnvironmentStore`

`EnvironmentStore` lives in `features/flags/store/environment.store.ts` but is imported by:

- `features/environments/` components
- `features/dashboard/` components
- `app.ts` (root component)

This violates feature module encapsulation. Since environments are a cross-cutting concern, this store should live in `core/` or `shared/store/`.

### D. No API integration layer

The design defines a typed API client interface (`FeatureFlagApi`) with HttpClient. The codebase has no HTTP integration at all — stores contain inline seed data and operate purely in-memory.

### E. No error handling

The design specifies `Result<T, E>` types, `AppError` interface, and an error handler service. None of these exist anywhere.

---

## 2. SOLID Principles Issues

### A. Single Responsibility Violation — `FlagDetailComponent`

**File:** `src/app/features/flags/components/flag-detail/flag-detail.ts:29-206`

This component handles:

- Route param extraction
- Flag lookup
- Form state management (6 mutable fields)
- Value parsing and validation (JSON, number, boolean, string)
- Environment toggling
- Navigation

The parsing/validation logic (`resolveDefaultValue`, `parseValue`, `setDefaultValueFields`) should be extracted to a utility function or service.

### B. Single Responsibility Violation — `FlagCreateComponent`

**File:** `src/app/features/flags/components/flag-create/flag-create.ts:19-158`

Same issue — mixes form state, validation, key generation, and value resolution.

### C. Code Duplication — `matchesSearch`

The search matching logic is duplicated in:

- `FlagListComponent` (`flag-list.ts:103-117`)
- `DashboardComponent` (`dashboard.ts:95-99`)

This should be a shared pure utility function.

### D. Code Duplication — `highlightParts`

`DashboardComponent.highlightParts()` (`dashboard.ts:65-92`) is a pure function embedded inside a component. It should be extracted to `shared/utils/`.

### E. Dependency Inversion — No abstractions for stores

Stores are injected as concrete classes. The design specifies interfaces for API services. While Angular DI supports token-based injection, all stores are directly coupled as concretions rather than injecting through abstractions.

---

## 3. Functional Programming Issues

### A. Mutable class-level state

Several components use mutable `protected` properties for form state:

- `FlagDetailComponent`: `name`, `description`, `tags`, `booleanValue`, `stringValue`, `numberValue`, `jsonValue` (lines 40-47)
- `FlagCreateComponent`: same pattern (lines 24-34)
- `EnvironmentListComponent`: `name`, `key`, `color` (lines 35-37)
- `ProjectListComponent`: `name`, `key`, `description` (lines 34-36)
- `SegmentListComponent`: `name`, `key`, `description` (lines 32-34)

The `CLAUDE.md` explicitly says "Never mutate, always return new objects/arrays" and to prefer Reactive Forms. These template-driven form bindings with `ngModel` and mutable properties contradict both the functional programming principle and the Reactive Forms preference.

### B. Impure helper in `FlagStore`

`createEnvValue` (`flag.store.ts:238-251`) calls `nowStamp()` making it impure. The timestamp should be passed as a parameter.

### C. Duplicated `nowStamp()` and `createId()` across stores

These identical utility functions are duplicated across 4 separate store files:

- `flag.store.ts`
- `environment.store.ts`
- `project.store.ts`
- `segment.store.ts`

They should be extracted to a shared utility.

---

## 4. Angular 20 Best Practices Issues

### A. Redundant `standalone: true`

14 components still explicitly set `standalone: true`, which is the default in Angular 20:

- `app.ts`
- `header.ts`
- `sidebar.ts`
- `icon.ts`
- `nav-section.ts`
- `stat-card.ts`
- `dashboard.ts`
- `flag-detail.ts`
- `environment-list.ts`
- `environment-detail.ts`
- `project-list.ts`
- `project-detail.ts`
- `segment-list.ts`

### B. Missing `ChangeDetectionStrategy.OnPush`

6 components lack OnPush change detection:

- `AppComponent` (`app.ts:25`)
- `EnvironmentListComponent` (`environment-list.ts:11`)
- `EnvironmentDetailComponent` (`environment-detail.ts:12`)
- `ProjectListComponent` (`project-list.ts:11`)
- `ProjectDetailComponent` (`project-detail.ts:10`)
- `SegmentListComponent` (`segment-list.ts:10`)

### C. Template-driven forms instead of Reactive Forms

The `.claude/CLAUDE.md` states "Prefer Reactive forms instead of Template-driven ones." But `FormsModule` with `ngModel` is used in:

- `FlagDetailComponent`
- `FlagCreateComponent`
- `EnvironmentListComponent`
- `ProjectListComponent`
- `SegmentListComponent`

### D. `@if` chains instead of `@switch`

In `flag-detail.html:38-63` and `flag-detail.html:89-124`, multiple `@if (current.type === '...')` blocks are used where `@switch (current.type)` would be more appropriate and readable.

### E. `$any()` usage in templates

`flag-detail.html` and `flag-create.html` use `$any($event.target).checked` and `$any($event.target).value` in multiple places (e.g., lines 84, 93, 104, 113, 120, 122). This bypasses type safety.

### F. `CommonModule` imported unnecessarily

Several components import `CommonModule` only for the `date` pipe. In Angular 20, they should import `DatePipe` directly:

- `FlagListComponent`
- `DashboardComponent`
- `EnvironmentListComponent`
- `EnvironmentDetailComponent`
- `ProjectListComponent`

---

## 5. Separation of Concerns

### A. Logic in templates

The `dashboard.html` template contains complex iteration with `highlightParts()` calls nested inside `@for` loops (lines 48-73). While the function itself is in TypeScript, the template structure is overly complex.

### B. Inline SVG in template

`dashboard.html:95-109` contains a full inline SVG definition. This should be handled by the `IconComponent` or extracted.

---

## 6. What's Done Well

- **Signals-first state management** — All stores correctly use `signal()`, `computed()`, and `asReadonly()`.
- **Immutable updates in stores** — `update()` callbacks use spread operators correctly.
- **Pure utility functions** — `flag-value.utils.ts` is a well-designed set of pure, typed functions.
- **Type safety** — `FlagTypeMap`, discriminated unions for `CreateFlagInput`, and type guards are well-designed.
- **No `ngClass`/`ngStyle`** — Not used anywhere.
- **No old structural directives** — No `*ngIf`, `*ngFor`, `*ngSwitch` anywhere.
- **New control flow syntax** — `@if`, `@for`, `@else` used consistently.
- **`inject()` function** — Used consistently, no constructor injection.
- **Lazy-loaded routes** — All features use `loadChildren` with dynamic imports.
- **Component naming and file structure** — Consistent and follows conventions.
- **Test coverage** — Every component, store, and utility has a corresponding spec file (28 total).

---

## 7. Priority Summary

| Priority | Issue | Impact |
|----------|-------|--------|
| High | Missing `core/` layer (API, error handling, auth) | Architecture gap |
| High | `EnvironmentStore` cross-feature coupling | Violates feature boundaries |
| Medium | Template-driven forms should be Reactive Forms | Contradicts stated preference |
| Medium | Missing `OnPush` on 6 components | Performance |
| Medium | Mutable form state in components | Violates FP principles |
| Low | Redundant `standalone: true` on 14 components | Code noise |
| Low | Duplicated `matchesSearch` / `highlightParts` / `nowStamp` / `createId` | DRY violation |
| Low | `$any()` in templates | Type safety bypass |
| Low | `@if` chains instead of `@switch` | Readability |
| Low | `CommonModule` instead of direct pipe imports | Bundle optimization |

---

## 8. Recommended Fix Order

1. Remove redundant `standalone: true` from all components (quick win, low risk)
2. Add `ChangeDetectionStrategy.OnPush` to all components missing it
3. Replace `CommonModule` imports with direct `DatePipe` imports
4. Extract duplicated utilities (`nowStamp`, `createId`, `matchesSearch`, `highlightParts`)
5. Move `EnvironmentStore` to `shared/store/` to fix cross-feature coupling
6. Replace `@if` chains with `@switch` for type-based rendering
7. Convert template-driven forms to Reactive Forms
8. Build out `core/` layer (API services, error handling, config)
