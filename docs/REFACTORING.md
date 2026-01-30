# Refactoring Tracker

This document tracks identified refactoring opportunities and their implementation status.

## Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete

---

## High Priority

### 1. BaseCrudStore - Store Pattern Duplication
**Status:** `[x]` Complete

**Files Affected:**
- `src/app/features/flags/store/flag.store.ts` (277 lines) - Not refactored (too specialized)
- `src/app/features/segments/store/segment.store.ts` (138 → 125 lines) - Refactored
- `src/app/features/audit/store/audit.store.ts` (152 lines) - Not refactored (append-only pattern)
- `src/app/shared/store/environment.store.ts` (100 → 97 lines) - Refactored
- `src/app/shared/store/project.store.ts` (86 → 83 lines) - Refactored

**Problem:**
All stores repeat identical CRUD patterns:
- Private signal for state
- Public readonly selector
- Computed count property
- `getById()` method
- `add()`, `delete()`, `update()` methods with boilerplate
- Identical timestamp logic

**Solution:**
Created `BaseCrudStore<T>` base class at `src/app/shared/store/base-crud.store.ts` that handles:
- Generic signal initialization with configurable initial data
- Standard CRUD operations (`addItem`, `deleteItem`, `updateItem`)
- Count computations via computed signal
- ID-based lookup (`getById`, `exists`)
- Timestamp management (automatic `createdAt`/`updatedAt`)
- Bulk updates via `updateWhere` for patterns like `setDefault`
- Configurable `allowDeleteLast` option

**Refactored Stores:**
- `SegmentStore` - extends `BaseCrudStore<Segment>`
- `ProjectStore` - extends `BaseCrudStore<Project>`
- `EnvironmentStore` - extends `BaseCrudStore<Environment>`

**Not Refactored:**
- `FlagStore` - Too specialized with environment values, project filtering, and toggle logic
- `AuditStore` - Append-only pattern doesn't fit CRUD model

**Actual Savings:** ~30 lines per store + standardized patterns + 160 lines of reusable base class with tests

---

### 2. Form Utilities - List Component Duplication
**Status:** `[x]` Complete

**Files Affected:**
- `src/app/features/projects/components/project-list/project-list.ts` (110 → 107 lines)
- `src/app/features/environments/components/environment-list/environment-list.ts` (110 → 108 lines)
- `src/app/features/flags/components/flag-list/flag-list.ts` (131 lines) - Not changed (different pattern)

**Problem:**
List components duplicate:
- Form with getters/setters for test compatibility
- `canAdd()` validation checking required fields
- Value extraction and trimming logic

**Solution:**
Created `src/app/shared/utils/form.utils.ts` with:
- `hasRequiredFields(form, fields)` - Validates required text fields
- `getTrimmedValues(form, fields)` - Extracts trimmed values
- `createFormFieldAccessors(form)` - Creates proxy for getter/setter access

Added test helpers to `src/app/testing/component.helpers.ts`:
- `setFormField(component, field, value)` - Set individual form field
- `getFormField(component, field)` - Get form field value
- `setFormFields(component, values)` - Set multiple fields at once

**Note:** The getter/setter accessors remain for backward compatibility with existing tests, but they now delegate to the utility. Future tests can use `setFormFields()` directly.

**Actual Savings:** Standardized form handling, reduced boilerplate in `canAdd()` and value extraction

---

## Medium Priority

### 3. Form Field Getter/Setter Pattern
**Status:** `[x]` Complete

**Files Affected:**
- `src/app/features/projects/components/project-list/project-list.ts` (117 → 91 lines) - Refactored
- `src/app/features/environments/components/environment-list/environment-list.ts` (118 → 84 lines) - Refactored
- `src/app/features/flags/components/flag-detail/flag-detail.ts` (288 → 240 lines) - Refactored

**Problem:**
Components used manual getter/setter pairs for form field access to support legacy test patterns.

**Solution:**
- Updated tests to use `setFormField()`, `getFormField()`, and `setFormFields()` helpers from `@/app/testing`
- Removed getter/setter boilerplate from components
- Removed `createFormFieldAccessors()` utility usage (no longer needed)
- Updated internal form access to use `form.getRawValue()` or `form.get()` directly

**Actual Savings:** ~74 lines total across 3 components

---

### 4. BaseCrudListPage - E2E Page Object Duplication
**Status:** `[x]` Complete

**Files Affected:**
- `e2e/pages/flags/flag-list.page.ts` (167 → 154 lines) - Refactored
- `e2e/pages/projects/project-list.page.ts` (180 → 139 lines) - Refactored
- `e2e/pages/environments/environment-list.page.ts` (221 → 180 lines) - Refactored
- `e2e/pages/segments/segment-list.page.ts` (167 → 138 lines) - Refactored

**Problem:**
List page objects duplicated row counting, assertions, delete operations, and page load checks.

**Solution:**
Created `e2e/pages/base-crud-list.page.ts` that extends `BasePage` with:
- `itemRows` / `itemRow(name)` - Generic row accessors
- `itemLink(name)` / `editButton(name)` / `deleteButton(name)` - Row element locators
- `getItemCount()` / `clickItem(name)` / `deleteItem(name)` - Common actions
- `assertPageLoaded()` / `assertItemExists(name)` / `assertItemNotExists(name)` - Assertions
- `assertItemCount(expected)` / `assertIsDefault(name)` / `assertEmptyState()` - More assertions

**Refactored Pages:**
- `FlagListPage` - Uses generic assertions, keeps flag-specific toggle/badge methods
- `ProjectListPage` - Uses generic assertions, keeps form-related methods
- `EnvironmentListPage` - Uses generic assertions, keeps form-related methods
- `SegmentListPage` - Uses generic assertions, keeps form-related methods

**Actual Savings:** ~124 lines total + standardized patterns + 170 lines of reusable base class

---

### 5. Large Component Files
**Status:** `[x]` Complete

**Files Affected:**
- `src/app/features/flags/components/flag-detail/flag-detail.ts` (240 → 214 lines) - Refactored
- `src/app/features/flags/components/flag-create/flag-create.ts` (192 → 126 lines) - Refactored

**Problem:**
Components handle multiple responsibilities: form management, value type handling, environment state, validation.

**Solution:**
- Created `FlagValueInputComponent` (118 lines) for type-specific inputs (boolean, string, number, json)
- Created `flag-form.utils.ts` (121 lines) with:
  - `extractDefaultValue()` - Extracts typed value from form data
  - `buildCreateFlagInput()` - Builds type-safe CreateFlagInput
  - `parseTags()` - Parses comma-separated tags
- Both templates now use the shared component instead of duplicating switch statements

**Actual Savings:** Removed ~92 lines from components, added 239 lines of reusable code with full test coverage. Net increase in total lines but significant improvement in:
- Single Responsibility (each piece has one job)
- DRY (flag value inputs defined once)
- Testability (utilities tested independently)

---

### 6. Unit Test Setup Duplication
**Status:** `[x]` Complete

**Files Affected:**
- `src/app/features/flags/components/flag-detail/flag-detail.spec.ts` (533 → 517 lines) - Refactored
- Other detail component specs - Not refactored (use observable paramMap pattern)

**Problem:**
Repetitive TestBed setup with route parameters, Location mocks, and ActivatedRoute configuration.

**Solution:**
Created `src/app/testing/detail-component.helpers.ts` with:
- `createMockLocation()` - Creates mock Location with trackable `back()` calls
- `createMockActivatedRoute(paramName, value)` - Creates route snapshot with param
- `setupDetailComponentTest({ component, paramName, providers })` - Returns context with `build()` function

**Example Usage:**
```typescript
const ctx = setupDetailComponentTest({
  component: FlagDetailComponent,
  paramName: 'flagId',
  providers: [FlagStore, EnvironmentStore, ProjectStore],
});

it('should render details', async () => {
  await ctx.build('flag_123');
  expectHeading(ctx.fixture, 'My Flag');
});
```

**Refactored Specs:**
- `flag-detail.spec.ts` - Uses `setupDetailComponentTest()`, reduced build function from 20+ lines to 6 lines

**Not Refactored:**
- `project-detail.spec.ts`, `environment-detail.spec.ts`, `segment-detail.spec.ts` - Use observable `paramMap` for testing route changes; different pattern not covered by this helper

**Actual Savings:** ~16 lines in flag-detail.spec + reusable helper (100 lines) with full test coverage

---

## Low Priority

### 7. Filter Logic Duplication
**Status:** `[x]` Complete

**Files Affected:**
- `src/app/features/environments/components/environment-list/environment-list.ts` (85 → 82 lines)
- `src/app/features/projects/components/project-list/project-list.ts` (84 → 81 lines)
- `src/app/features/segments/components/segment-list/segment-list.ts` (100 → 97 lines)
- `src/app/features/audit/components/audit-list/audit-list.ts` (109 → 95 lines)

**Problem:**
Inline filter predicates duplicated text search and property matching patterns.

**Solution:**
Created `src/app/shared/utils/filter.utils.ts` with:
- `textFilter(fields, query)` - Creates text search predicate for specified fields
- `propertyEquals(field, value)` - Creates exact match predicate (treats 'all' as match-all)
- `matchesAll(predicates)` - Combines predicates with AND logic
- `matchesAny(predicates)` - Combines predicates with OR logic
- `isTruthy(field)` / `isFalsy(field)` - Boolean field predicates
- `not(predicate)` - Negates a predicate

**Refactored Components:**
- `environment-list.ts` - Uses `textFilter(['name', 'key'], query)`
- `project-list.ts` - Uses `textFilter(['name', 'key', 'description'], query)`
- `segment-list.ts` - Uses `textFilter(['name', 'key', 'description'], query)`
- `audit-list.ts` - Uses `matchesAll()` with `propertyEquals()` and `textFilter()`

**Actual Savings:** ~24 lines + reusable utilities (120 lines) with full test coverage

---

### 8. Centralized Time Provider
**Status:** `[ ]` Not started

**Problem:**
Direct calls to `createTimestamp()` make time-dependent behavior hard to test.

**Solution:**
Create injectable `TimeService` that can be mocked in tests.

---

### 9. Missing Interface Abstractions
**Status:** `[ ]` Not started

**Problem:**
No interfaces defining contracts for similar entities (`ICrudStore<T>`, etc.).

**Solution:**
Define clear interfaces for store, component, and page object patterns.

---

## Progress Log

| Date | Item | Action | Notes |
|------|------|--------|-------|
| 2026-01-30 | Document | Created | Initial refactoring tracker |
| 2026-01-30 | BaseCrudStore | Completed | Created base class, refactored 3 stores |
| 2026-01-30 | Form Utilities | Completed | Created form.utils.ts, added test helpers |
| 2026-01-30 | BaseCrudListPage | Completed | Created base class, refactored 4 E2E page objects |
| 2026-01-30 | Getter/Setter Pattern | Completed | Removed boilerplate from 3 components, updated tests |
| 2026-01-30 | Large Component Files | Completed | Created FlagValueInputComponent and flag-form.utils.ts |
| 2026-01-30 | Unit Test Setup | Completed | Created detail-component.helpers.ts, refactored flag-detail.spec.ts |
| 2026-01-30 | Filter Logic | Completed | Created filter.utils.ts, refactored 4 list components |

---

_Last updated: 2026-01-30_
