# Module Review: features/audit -- 2026-02-13

## Module Summary
- **Path:** `src/app/features/audit/`
- **Purpose:** Audit logging system providing an API layer, signal-based store, a reusable AuditLogger service for other features to record actions, an AuditBadgeComponent for visual action indicators, and an AuditListComponent for displaying/filtering/searching audit entries.
- **File Count:** 10 production, 4 test
- **Test Coverage:** 4/4 testable files have specs (audit.api, audit.store, audit-logger.service, audit-list, audit-badge)

## Issues Found

### Angular Conventions

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `components/audit-list/audit-list.ts` | 75-81 | `onActionChange` and `onResourceChange` are `protected` but called directly from tests via `component.onActionChange(...)`. Protected members should not be accessed in tests. Either make them public (since they are part of the component's public API via template binding) or test through the template by interacting with the `<ui-labeled-select>` elements. | Major |
| `components/audit-list/audit-list.ts` | -- | Component does not handle `loading` or `error` states from `AuditStore`. The template has no loading spinner or error banner. If entries fail to load, users see the empty state instead of an error message. | Major |
| `components/audit-list/audit-list.ts` | 76, 80 | `onActionChange(value: string)` and `onResourceChange(value: string)` accept `string` and then cast with `as ActionFilter`/`as ResourceFilter`. This is an unsafe cast. The parameter type should be `ActionFilter` / `ResourceFilter` directly, or the cast should be validated. | Minor |

### Type Safety

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `components/audit-list/audit-list.spec.ts` | 213-255, 259-305 | Extensive use of `as unknown as { filteredEntries: () => ... }` to access protected `filteredEntries` computed signal. This is a test smell -- 8 occurrences of unsafe casting to break encapsulation. These tests should either verify rendered output in the DOM or the property should be made accessible for testing. | Major |
| `components/audit-list/audit-list.types.ts` | 7-8 | `formattedAction` and `formattedResourceType` are typed as `string` rather than capitalized literal types. Since these are derived from the union types `AuditAction` and `AuditResourceType`, they could use `Capitalize<AuditAction>` and `Capitalize<AuditResourceType>` for stronger type safety. | Suggestion |

### SOLID Principles

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `store/audit.store.ts` | 49-55 | `entriesByAction()` and `entriesByResourceType()` are regular methods that re-filter on every call. They are not `computed()` signals, so they do not memoize results. If called in a template or computed chain, they would recalculate unnecessarily. Additionally, neither method is used anywhere outside of tests -- the `AuditListComponent` uses its own `filteredEntries` computed with `propertyEquals`. These are dead code candidates. | Minor |
| `store/audit.store.ts` | 45-47 | `getEntryById()` is a regular method, not a computed signal. It is only used in tests. If it were needed, it should be a method that accepts a signal-based id and returns a computed. As-is, it appears to be dead code. | Minor |
| `components/audit-badge/audit-badge.ts` | 5-7 | `BadgeVariant`, `AuditBadgeVariant`, and `ExtendedBadgeVariant` types are exported from the component file. These should be in a dedicated types/model file (e.g., `audit-badge.types.ts`) to follow single-responsibility and match the pattern used by `audit-list.types.ts`. | Suggestion |

### Functional Programming

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `components/audit-list/audit-list.ts` | 20 | `capitalize` is defined as a module-level function in the component file. It should be in a utility file (e.g., `shared/utils/string.utils.ts`) for reusability and testability. | Suggestion |

### SCSS / Styling

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `components/audit-list/audit-list.scss` | 29-31, 44-46 | `.audit-cell--action` and `.audit-cell--user` are defined in SCSS but never used in the template (`audit-list.html`). Dead CSS should be removed. | Minor |
| `components/audit-badge/audit-badge.scss` | 13-32 | Standard badge variants (`--success`, `--warning`, `--error`, `--info`) duplicate styling that already exists in `@watt/ui` BadgeComponent. If AuditBadge is only used for audit-specific variants (created/updated/deleted/toggled), the standard variants add maintenance burden. However, they are tested, so this is intentional extension. | Suggestion |
| `components/audit-badge/audit-badge.scss` | 35-53 | Audit action variant colors use hardcoded fallback values (e.g., `#dcfce7`, `#166534`) alongside CSS custom properties (`--status-success-bg`). These fallback colors are not defined in `_variables.scss` design tokens, creating a potential inconsistency between themes. | Minor |

### Test Quality

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `store/audit.store.spec.ts` | 44-50 | The "entries sorted by timestamp descending" test relies on seed data ordering from the mock API provider. If mock data changes, this test could silently pass or fail without indicating a real regression. The store itself does not sort -- it relies on the API returning sorted data. This assumption should be documented or the store should enforce sorting. | Minor |
| `store/audit.store.spec.ts` | 151-163 | "data coverage" tests assert on mock seed data properties (`actions.size >= 3`, `resourceTypes.size >= 3`). These test the mock, not the store. | Minor |
| `api/audit.api.spec.ts` | -- | API test does not verify the URL path includes `/api/v1` prefix consistently. The `baseUrl` is hardcoded as `http://localhost:3000/api/v1` rather than using a shared test constant. | Suggestion |

### Architecture

| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `api/audit.api.ts` | 8-20 | `AuditApi` does not extend `CrudApi<T, C, U>` unlike other feature APIs. It defines its own `getAll()` and `create()` manually. While understandable since audit only needs read+create (no update/delete), this breaks consistency with the established pattern. A `ReadCreateApi<T, C>` base class or documentation of why `CrudApi` was not used would help. | Suggestion |
| `audit.routes.ts` | 5-10 | Routes do not include `roleGuard`. Confirmed that `authGuard` is applied at the parent level in `app.routes.ts` (line 42). However, audit log data may warrant admin-only access via `roleGuard` similar to environments and settings routes. | Suggestion |

## What's Done Well

- **Clean model definitions:** `AuditAction` and `AuditResourceType` are well-defined union types. Filter option arrays use `as const` for type narrowing. Separate `AuditEntry` (read) and `LogActionInput` (write) interfaces follow the established input/output type pattern.
- **AuditLogger service design:** The `forResource()` factory method is an excellent higher-order function pattern, creating pre-bound loggers for each feature store. This follows functional programming principles (partial application/currying) and reduces boilerplate in consuming stores.
- **Composable filtering:** The `AuditListComponent` uses `matchesAll()` with `propertyEquals()` and `textFilter()` from shared utilities, demonstrating clean functional composition for filtering logic.
- **BEM SCSS compliance:** All CSS classes use full BEM names (`.audit-page`, `.audit-page__toolbar-row`, `.audit-page__count`, `.audit-cell`, `.audit-cell--timestamp`, `.audit-cell__name`). No `&__element` nesting violations found.
- **Signal-based state management:** The `AuditStore` follows the established pattern with private writable signals, public readonly accessors, immutable updates (`update(entries => [created, ...entries])`), and proper error/loading state management.
- **Component conventions:** All components use `OnPush` change detection, `inject()` for DI, `input()`/`output()` signal APIs, `host: {}` for host bindings, and `@if`/`@for` control flow. No legacy patterns found.
- **Comprehensive test coverage:** All 4 testable files have thorough specs. The audit-list spec covers action filtering, resource type filtering, combined filtering, search filtering, empty states, and formatted display properties.
- **Separation of concerns:** Types in `audit-list.types.ts`, models in `audit.model.ts`, API in its own file, store separate from components. Clean layered architecture.
- **Template structure:** The audit-list template makes good use of `@watt/ui` components (`ui-page-header`, `ui-toolbar`, `ui-labeled-select`, `ui-data-table`, `ui-empty-state`, `ui-badge`) and the custom `app-audit-badge`.

## Recommended Fixes (Priority Order)

1. **[Major] Add loading and error state handling to AuditListComponent.** The component accesses `auditStore.entries()` but never checks `auditStore.loading()` or `auditStore.error()`. Add a loading spinner (`<ui-loading-spinner>`) while entries load and an error banner (`<ui-error-banner>`) when loading fails. Without this, users see a misleading "No audit entries found" empty state during loading or on error.

2. **[Major] Fix test access to protected members in audit-list.spec.ts.** The `onActionChange()` and `onResourceChange()` methods are `protected` but called directly in tests. Either:
   - Change their visibility to public (they are called from template bindings, which is effectively public).
   - Or test through the DOM by triggering value changes on `<ui-labeled-select>` elements.

3. **[Major] Eliminate `as unknown as` casts in audit-list.spec.ts.** The 8 occurrences of `component as unknown as { filteredEntries: ... }` to access the protected `filteredEntries` computed signal should be replaced by:
   - Verifying the rendered DOM content (badge text, resource type text) in the data table rows.
   - Or exposing `filteredEntries` as a public readonly computed (it is a read-only view of derived data).

4. **[Minor] Remove dead CSS classes.** Delete `.audit-cell--action` (line 29-31) and `.audit-cell--user` (line 44-46) from `audit-list.scss` -- they are defined but never referenced in the template.

5. **[Minor] Remove or document unused store methods.** `entriesByAction()`, `entriesByResourceType()`, and `getEntryById()` in `audit.store.ts` are only used in tests, never by any component or service. Either remove them as dead code or convert them to `computed()` signals if they serve a future purpose.

6. **[Minor] Use design tokens for audit badge fallback colors.** The hardcoded color fallbacks in `audit-badge.scss` (`#dcfce7`, `#166534`, etc.) should be defined as CSS custom properties in `_variables.scss` to ensure theme consistency.

7. **[Suggestion] Consider adding `roleGuard` for audit routes.** The `authGuard` is confirmed at the parent level (`app.routes.ts:42`), but audit data may warrant admin-only access via `roleGuard` with `data: { role: 'admin' }`, matching the pattern used by environments and settings routes.

8. **[Suggestion] Extract `capitalize` to a shared utility.** Move the `capitalize` function from `audit-list.ts` to `shared/utils/string.utils.ts` for reusability.

9. **[Suggestion] Extract type definitions from audit-badge.ts.** Move `BadgeVariant`, `AuditBadgeVariant`, and `ExtendedBadgeVariant` to a dedicated `audit-badge.types.ts` file to match the pattern used by `audit-list.types.ts`.

10. **[Suggestion] Strengthen `AuditEntryFormatted` types.** Use `Capitalize<AuditAction>` and `Capitalize<AuditResourceType>` for `formattedAction` and `formattedResourceType` fields instead of plain `string`.
