# Module Review: features/flags -- 2026-02-13

## Module Summary
- **Path:** `src/app/features/flags/`
- **Purpose:** Feature flag CRUD, detail editing, environment-specific toggle/value management, and flag creation. The largest feature module, handling flag listing with filtering, flag detail editing with environment overrides, and flag creation with per-environment enable toggles.
- **File Count:** 17 production files, 8 test files (spec files), 1 route file
- **Test Coverage:** 8/8 testable files have specs (flag.model types covered via flag-value.model.spec.ts; flag-detail.types.ts and flag-list.types.ts are pure type files with no logic to test)

## File Inventory

| File | Type | Lines |
|------|------|-------|
| `flags.routes.ts` | Routes | 24 |
| `models/flag.model.ts` | Model | 76 |
| `models/flag-value.model.ts` | Model | 57 |
| `models/flag-value.model.spec.ts` | Test | 87 |
| `api/flag.api.ts` | API | 64 |
| `api/flag.api.spec.ts` | Test | 273 |
| `store/flag.store.ts` | Store | 278 |
| `store/flag.store.spec.ts` | Test | 1131 |
| `utils/flag-format.utils.ts` | Utility | 73 |
| `utils/flag-format.utils.spec.ts` | Test | 287 |
| `utils/flag-form.utils.ts` | Utility | 122 |
| `utils/flag-form.utils.spec.ts` | Test | 161 |
| `utils/flag-value.utils.ts` | Utility | 103 |
| `utils/flag-value.utils.spec.ts` | Test | 393 |
| `components/flag-list/flag-list.ts` | Component | 119 |
| `components/flag-list/flag-list.html` | Template | 97 |
| `components/flag-list/flag-list.scss` | Style | 66 |
| `components/flag-list/flag-list.types.ts` | Types | 21 |
| `components/flag-list/flag-list.spec.ts` | Test | 279 |
| `components/flag-detail/flag-detail.ts` | Component | 216 |
| `components/flag-detail/flag-detail.html` | Template | 126 |
| `components/flag-detail/flag-detail.scss` | Style | 105 |
| `components/flag-detail/flag-detail.types.ts` | Types | 10 |
| `components/flag-detail/flag-detail.spec.ts` | Test | 535 |
| `components/flag-create/flag-create.ts` | Component | 128 |
| `components/flag-create/flag-create.html` | Template | 85 |
| `components/flag-create/flag-create.scss` | Style | 89 |
| `components/flag-create/flag-create.spec.ts` | Test | 327 |
| `components/flag-value-input/flag-value-input.ts` | Component | 112 |
| `components/flag-value-input/flag-value-input.spec.ts` | Test | 131 |

## Issues Found

### Duplicate / Conflicting Interface Definitions
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `models/flag.model.ts` | 70-75 | `UpdateEnvironmentValueInput` is defined here with `flagId`, `environmentId`, `value?`, `enabled?` | Major |
| `api/flag.api.ts` | 15-18 | A **different** `UpdateEnvironmentValueInput` is also defined here with only `value?`, `enabled?`. Two interfaces share the same name with different shapes across the module. The store imports from the model, the API uses its own local version. This is confusing and risks import mistakes. The model version should be the canonical definition; the API version should be renamed (e.g., `UpdateEnvironmentValuePayload`) or the API should import and adapt the model version. | Major |

### SCSS Dead Code / Missing Styles
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `flag-list.scss` | 25-29 | `.flags-page__actions` is defined in SCSS but never used in `flag-list.html`. Dead CSS. | Minor |
| `flag-list.scss` | 62-64 | `.flag-cell--tags` is defined in SCSS but never used in `flag-list.html`. Dead CSS. | Minor |
| `flag-list.html` | 70 | `.flag-value` class is used in the template (`<code class="flag-value">`) but has no SCSS definition in `flag-list.scss`. The element may not render with intended styles. | Minor |
| `flag-detail.scss` | 48-53 | `.flag-detail__toggle` is defined in SCSS but never referenced in `flag-detail.html`. Dead CSS. | Minor |
| `flag-detail.html` | 103 | `.flag-detail__textarea` class is used in the template but has no definition in `flag-detail.scss`. Missing style rule. | Minor |
| `flag-create.scss` | 44-50 | `.flag-create__toggle` is defined in SCSS but never referenced in `flag-create.html`. Dead CSS. | Minor |

### Unnecessary Wrapper Method
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `flag-detail.ts` | 209-211 | `private parseValue()` is a single-line wrapper around `parseValueForType()` with no added logic. It adds indirection without value. Call `parseValueForType()` directly in `updateEnvironmentValue()`. | Suggestion |

### Redundant Methods / Minor Indirection
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `flag-detail.ts` | 141-143 | `onEnvironmentToggle()` is a one-line wrapper calling `toggleEnvironment()`. While it provides template clarity, the indirection adds no value since `toggleEnvironment()` itself is also `protected`. Could be consolidated into one method. | Suggestion |
| `flag-store.ts` | 113-115 | `getFlagById()` is a one-line wrapper around `getById()` inherited from `BaseCrudStore`. The alias exists for "backward compatibility" but all callers are internal to the module. Consider using `getById()` directly. | Suggestion |

### FlagApi Test -- Verb Mismatch in Comment
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `flag.api.spec.ts` | 117 | Test description says `should PATCH /flags/:id` for the `update` method, which is correct (CrudApi base uses `http.patch`). However, CLAUDE.md documents CrudApi as using `http.put`. The documentation is out of date with the implementation. Not a code bug, but a docs consistency issue. | Minor |

### Missing Delete Confirmation UX
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `flag-list.html` | 89 | Delete button calls `onDeleteFlag()` immediately without any confirmation dialog. Accidental clicks will permanently delete a flag. Same issue in `flag-detail.html` line 18. | Major |

### Navigation Before Async Completion
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `flag-detail.ts` | 170-171 | `deleteFlag()` calls `store.deleteFlag()` (async) then immediately navigates via `router.navigate()` without `await`-ing the deletion. If deletion fails, the user is still navigated away. | Major |
| `flag-create.ts` | 115-116 | `createFlag()` calls `store.addFlag()` (async) then immediately navigates without `await`-ing. If creation fails, the user is still navigated to `/flags`. | Major |

### Route Configuration
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `flags.routes.ts` | 7-23 | No `authGuard` or `roleGuard` applied to flag routes. Per CLAUDE.md, all routes should use `authGuard`. The guard may be applied at the parent route level (in `app.routes.ts`), but this should be verified. | Minor |

### Test Host Explicitly Sets standalone: true
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `flag-value-input.spec.ts` | 10 | Test host component explicitly sets `standalone: true`. Per project conventions, this is the Angular 21 default and should not be stated explicitly. While it is test-only code, it violates the project rule. | Minor |

### Missing Type in flag-detail.types.ts
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `flag-detail.types.ts` | 1 | `FlagType` is imported but only used indirectly via `FlagTypeMap[FlagType]`. The import is technically used, but the type file depends on both model files for what is effectively `unknown`. The `value` field could benefit from generic typing for type safety. | Suggestion |

## What's Done Well

- **Comprehensive normalizeFlag() implementation**: The `FlagApi` correctly maps `resourceName` to `name` across all five API methods (`getAll`, `getById`, `create`, `update`, `updateEnvironmentValue`) plus `getByKey`. The fallback logic `raw.name ?? raw.resourceName` is defensive and correct.

- **PATCH response merge strategy**: The `FlagStore.mergeFlag()` method properly handles the backend's incomplete PATCH responses by preserving the existing `name` and deep-merging `environmentValues`. The store methods `updateEnvironmentValue()` and `toggleFlagInEnvironment()` both apply the known input values on top of the merge result, ensuring the UI state is always correct regardless of what the backend returns.

- **Discriminated union for CreateFlagInput**: The model uses a proper discriminated union (`CreateFlagInputBase<T>`) with a type parameter tied to `FlagTypeMap[T]`, providing compile-time type safety for flag creation across all four flag types.

- **CreateFlagInput includes both name and resourceName**: `buildCreateFlagInput()` at `flag-form.utils.ts:90` correctly sets `resourceName: name`, satisfying the backend's expected field name while keeping the frontend model clean.

- **Pure utility functions**: All three utility files (`flag-format.utils.ts`, `flag-form.utils.ts`, `flag-value.utils.ts`) export pure functions with no side effects. They are composable and independently testable. The `extractDefaultValue()` function returns a discriminated result type (`ExtractValueResult`) for clean error handling.

- **Type guards for flag values**: `flag-value.model.ts` provides four well-implemented type guards (`isBooleanFlagValue`, `isStringFlagValue`, `isNumberFlagValue`, `isJsonFlagValue`) with proper runtime checks including edge cases (NaN for numbers, arrays/null for JSON).

- **No direct Keycloak imports**: All component files correctly avoid importing `keycloak-js` directly. Auth concerns are handled at the route level or via `AuthService`.

- **Template control flow**: All templates use `@if`, `@for`, and `@switch` (modern Angular control flow). No legacy structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`) are present.

- **BEM SCSS compliance**: All SCSS files use full BEM class names without `&__element` nesting. Only `&:hover` pseudo-class nesting is used, which is acceptable BEM practice.

- **Immutable store updates**: `FlagStore` consistently uses `.update()` with non-mutating operations (spread, `map`, `filter`). The `updateFlagEnvironmentValue` utility creates entirely new objects.

- **Separation of types**: `flag-list.types.ts` and `flag-detail.types.ts` extract view-specific interfaces (`FlagWithFormattedValue`, `FlagEnvironmentRow`) from the component files, keeping components focused.

- **Thorough test coverage**: The store spec alone is 1131 lines covering all CRUD operations, error paths, audit logging, environment merging, project scoping, and edge cases. The API spec explicitly tests `resourceName` normalization across all methods. Every utility function has extensive edge-case testing.

- **TestBed setup via shared helpers**: Tests consistently use `setupComponentTest`, `setupDetailComponentTest`, `MOCK_API_PROVIDERS`, and shared assertion helpers (`expectHeading`, `expectEmptyState`, `expectItemAdded`, etc.), reducing boilerplate and ensuring consistency.

- **OnPush everywhere**: All four components use `ChangeDetectionStrategy.OnPush`.

- **Signal-based reactivity**: All component state uses `signal()`, `computed()`, and `input()`/`output()`. No decorator-based `@Input`/`@Output` usage.

- **Inject function over constructors**: The two constructor usages (`flag-detail.ts:98`, `flag.store.ts:30`) only call `super()` or set up `effect()` -- they do not perform constructor injection. All DI is via `inject()`.

## Recommended Fixes (Priority Order)

1. **[Major] Add delete confirmation dialog** -- Both `flag-list.html` and `flag-detail.html` perform immediate deletion without user confirmation. Add a confirmation modal (or use the browser's `confirm()` as a stopgap) before calling `deleteFlag()`. This prevents accidental data loss.

2. **[Major] Await async operations before navigation** -- In `flag-detail.ts:170-171` and `flag-create.ts:115-116`, `await` the store operation before navigating. If the operation fails, the user should remain on the current page and see the error toast:
   ```typescript
   // flag-detail.ts
   protected async deleteFlag(): Promise<void> {
     const current = this.flag();
     if (!current) return;
     await this.store.deleteFlag(current.id);
     void this.router.navigate(['/flags']);
   }
   ```

3. **[Major] Rename duplicate UpdateEnvironmentValueInput** -- Rename the API-local `UpdateEnvironmentValueInput` in `flag.api.ts:15` to `UpdateEnvironmentValuePayload` (or similar) to distinguish it from the model's `UpdateEnvironmentValueInput` which includes `flagId` and `environmentId`. This eliminates naming confusion across the module.

4. **[Minor] Remove dead SCSS classes** -- Delete the following unused CSS rules:
   - `.flags-page__actions` from `flag-list.scss:25-29`
   - `.flag-cell--tags` from `flag-list.scss:62-64`
   - `.flag-detail__toggle` from `flag-detail.scss:48-53`
   - `.flag-create__toggle` from `flag-create.scss:44-50`

5. **[Minor] Add missing SCSS definitions** -- Add styles for:
   - `.flag-value` used in `flag-list.html:70` (currently unstyled `<code>` element)
   - `.flag-detail__textarea` used in `flag-detail.html:103` (currently unstyled `<textarea>`)

6. **[Minor] Verify authGuard on flag routes** -- Confirm that `authGuard` is applied at the parent route level in `app.routes.ts` covering all flag child routes. If not, add it to `flags.routes.ts`.

7. **[Minor] Remove explicit standalone: true from test host** -- In `flag-value-input.spec.ts:10`, remove the `standalone: true` property from the test host component decorator to follow project conventions.

8. **[Minor] Update CLAUDE.md CrudApi documentation** -- CLAUDE.md documents `CrudApi.update()` as using `http.put()` but the actual implementation at `core/api/crud.api.ts:63` uses `http.patch()`. Update the documentation to match.

9. **[Suggestion] Remove unnecessary parseValue wrapper** -- In `flag-detail.ts:209-211`, replace the private `parseValue()` method with a direct call to `parseValueForType()` in `updateEnvironmentValue()` at line 149.

10. **[Suggestion] Consolidate toggle handler methods** -- In `flag-detail.ts`, merge `onEnvironmentToggle()` (line 141) into `toggleEnvironment()` (line 135), or have the template call `toggleEnvironment()` directly.
