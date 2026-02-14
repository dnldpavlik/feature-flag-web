# Module Review: features/environments + features/projects -- 2026-02-13

## Module Summary
- **Path:** `src/app/features/environments/`, `src/app/features/projects/`
- **Purpose:** CRUD management for deployment environments (with color coding, default/selected state, ordering) and projects (workspaces that scope feature flags). Both modules provide list views with inline creation forms, detail views, delete confirmation dialogs, and search/filter capabilities.
- **File Count:** 16 production files, 8 test files (24 total)
- **Test Coverage:** 4/4 testable TypeScript files have specs (environment.api, environment-list, environment-detail, project.api, project-list, project-detail -- all covered)

## Issues Found

### Security / Route Guards
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `projects.routes.ts` | 6-17 | Feature routes define no `canActivate` guards. While `app.routes.ts` applies `authGuard` at the lazy-load boundary, it does NOT apply `roleGuard` with `data: { role: 'admin' }`. Environments correctly has both `authGuard + roleGuard` in `app.routes.ts`, but projects only has `authGuard`. If project management should be admin-only (consistent with environments), the `roleGuard` is missing. Verify whether this is intentional. | Major |

### Data Integrity / Logic
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `project-detail.ts` | 47-53 | `deleteProject()` calls `removeFlagsByProjectId()` and `router.navigate()` unconditionally after `await this.projectStore.deleteProject()`. Since `ProjectStore.deleteProject()` swallows errors internally (catch block returns void), the flag cleanup and navigation execute even when the API delete fails. The environment module handles this correctly via a `boolean` return value from the store. | Major |
| `project-list.ts` | 110-121 | Same issue in `confirmDelete()`: the store's `deleteProject()` swallows errors, so `removeFlagsByProjectId()` in the `try` block always executes. The `catch` block is dead code since the store never re-throws. | Major |
| `project-detail.ts` | 30-33 | `canDelete` computed hardcodes `'proj_default'` as a magic string to prevent deletion. This couples the component to a specific data ID rather than using the `isDefault` property that already exists on the `Project` model. If the default project's ID changes, this check silently breaks. | Minor |

### Missing SCSS Definitions
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `environment-detail.scss` | -- | Seven CSS classes used in `environment-detail.html` have no corresponding SCSS rules: `.environment-detail__edit-form`, `.environment-detail__field`, `.environment-detail__label`, `.environment-detail__name-input`, `.environment-detail__key-input`, `.environment-detail__color-input`, `.environment-detail__edit-actions`. The edit form relies entirely on unstyled elements, resulting in default browser rendering for those inputs. | Minor |

### Dead / Unused Code
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `project-list.ts` | 91-94 | Deprecated `deleteProject()` method wraps `requestDeleteProject()`. It is marked `@deprecated` but never called from the template or tests (the template directly calls `requestDeleteProject`). Should be removed to reduce surface area. | Minor |
| `project-list.scss` | 22-25 | `.project-name` class is defined in SCSS but never referenced in the template. Dead CSS rule. | Minor |

### Consistency / Patterns
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `project.api.ts` | 7 | `UpdateProjectInput` is defined in the API file (`export type UpdateProjectInput = Partial<CreateProjectInput>`) rather than in `models/project.model.ts` alongside its sibling types `Project` and `CreateProjectInput`. The environments module correctly keeps `UpdateEnvironmentInput` in its model file. | Minor |
| `environment-detail.ts` | 88-98 | Edit form uses raw `<input>` elements with manual `(input)` event bindings and three near-identical `on*Input` handler methods. The list component uses `<ui-form-field>` with reactive forms. This inconsistency means the detail page doesn't benefit from the shared form field styling, validation display, or accessibility features. | Minor |
| `project-detail.ts` | 47-53 | `deleteProject()` has no confirmation dialog (unlike `project-list.ts` and `environment-list.ts` which show confirmation). A destructive action on the detail page executes immediately. | Suggestion |

### Accessibility
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `environment-list.html` | 85 | Delete confirmation dialog has `role="dialog"` and `aria-modal="true"` but no `aria-labelledby` or `aria-label` attribute. Screen readers cannot announce the dialog's purpose. Same issue in `project-list.html` line 91. | Minor |
| `environment-list.html` | 85 | No keyboard trap management (Escape key to close, focus trapping). Users can Tab out of the modal into the background. Same issue in `project-list.html` line 91. | Suggestion |

### Type Safety
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `environment-detail.spec.ts` | 115-121 | Type assertion `as EnvironmentDetailComponent & { flags: () => unknown[] }` to access protected member. While acceptable in test files, using `(fixture.componentInstance as any)` or a type-safe test helper would be cleaner. This is a minor readability concern only. | Suggestion |

## What's Done Well

- **CrudApi inheritance**: Both `EnvironmentApi` and `ProjectApi` properly extend `CrudApi<T, C, U>` with minimal boilerplate. The `setDefault()` custom methods are cleanly added alongside inherited CRUD operations.
- **Angular conventions fully followed**: All components use `OnPush`, `inject()`, `input()`/`output()`, `signal()`, `computed()`, `@if`/`@for` control flow, and standalone components without explicit `standalone: true`.
- **Signal-based reactivity**: The `toSignal(this.route.paramMap)` pattern in both detail components enables reactive route parameter handling without manual subscriptions.
- **BEM SCSS compliance**: All SCSS uses full BEM class names (no `&__element` nesting). Pseudo-class nesting (`&:hover`, `&:last-child`) is correctly used within block selectors.
- **Comprehensive test coverage**: All 4 testable component/API files have thorough specs covering happy paths, edge cases (missing entities, null guards, API failures), form validation, route parameter changes, and inline editing.
- **Immutable state updates**: Components delegate all mutations to stores; no direct signal mutation in components.
- **Functional utility composition**: `textFilter()` and `hasRequiredFields()` / `getTrimmedValues()` are used consistently for search filtering and form handling, promoting code reuse.
- **Delete confirmation pattern**: Both list components implement a proper confirmation flow with flag count warnings, cancel/confirm actions, and state cleanup.
- **Environment delete returns boolean**: The `EnvironmentStore.deleteEnvironment()` returns `boolean` to indicate success/failure, and the `environment-list.ts` correctly uses this to conditionally clean up flag data. This is the correct pattern.
- **Responsive design**: The environment-detail SCSS includes a `@media (width <= 960px)` breakpoint that collapses the flag table grid for tablet/mobile.
- **Empty state handling**: Both detail components gracefully handle missing entities with `<ui-empty-state>` fallback UI and navigation back to the list.

## Recommended Fixes (Priority Order)

1. **[Major] Fix project delete data integrity** (`project-detail.ts`, `project-list.ts`): Align with the environment module pattern. Have `ProjectStore.deleteProject()` return `Promise<boolean>` instead of `Promise<void>`, returning `true` on success and `false` on failure. Update both `project-detail.ts` and `project-list.ts` to check the return value before calling `removeFlagsByProjectId()`. This prevents local flag data from being cleared when the server delete fails.

2. **[Major] Verify project route guard intent** (`app.routes.ts` line 33): Determine whether project management should be admin-only. If yes, add `roleGuard` and `data: { role: 'admin' }` to the projects route (matching environments). If non-admin access is intentional, add a code comment explaining the design decision.

3. **[Minor] Add SCSS rules for edit form** (`environment-detail.scss`): Add styling for the seven missing edit-form classes (`.environment-detail__edit-form`, `__field`, `__label`, `__name-input`, `__key-input`, `__color-input`, `__edit-actions`). Alternatively, refactor the edit form to use `<ui-form-field>` with reactive forms for consistency with the list component.

4. **[Minor] Move UpdateProjectInput to model file** (`project.model.ts`): Move `export type UpdateProjectInput = Partial<CreateProjectInput>` from `project.api.ts` to `models/project.model.ts` for consistency with the environments module structure.

5. **[Minor] Replace magic string in canDelete** (`project-detail.ts` line 32): Replace `project.id !== 'proj_default'` with `!project.isDefault` to use the model's semantic property instead of a hardcoded ID.

6. **[Minor] Remove deprecated method** (`project-list.ts` lines 91-94): Remove the deprecated `deleteProject()` wrapper method since it is unused.

7. **[Minor] Remove dead SCSS** (`project-list.scss` lines 22-25): Remove the unused `.project-name` class.

8. **[Minor] Add aria-labelledby to dialogs** (`environment-list.html` line 85, `project-list.html` line 91): Add `aria-labelledby` pointing to the `<h3>` heading ID in each delete confirmation dialog.

9. **[Suggestion] Add confirmation to project-detail delete**: Add a confirmation dialog to `project-detail.ts` `deleteProject()` to match the pattern used in both list components for destructive actions.

10. **[Suggestion] Add Escape key handler to modals**: Add `(keydown.escape)="cancelDelete()"` on the overlay elements in both delete confirmation dialogs.
