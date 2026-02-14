# Module Review: layout -- 2026-02-13

## Module Summary
- **Path:** `src/app/layout/`
- **Purpose:** Application shell layout components -- sticky header with breadcrumbs, search, and create-flag button; fixed sidebar with navigation, environment list, and user menu; declarative nav configuration with admin-only filtering.
- **File Count:** 6 production files, 2 test files
- **Test Coverage:** 2/2 testable component files have specs (both at 100%). `nav.config.ts` is a pure data/const file exercised through `app.ts` tests. `sidebar.types.ts` is interfaces-only (no runtime code).

## Issues Found

### Angular Conventions
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `header/header.ts` | 32 | `createFlagClick` output is declared but never bound by any consumer. The `onCreateFlagClick()` method navigates directly via the Router, so the output is dead code. | Minor |

### Type Safety / DRY
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `app.ts` (consumer) | 27-31 | `SidebarEnvironment` interface is duplicated locally in `app.ts` instead of importing from `sidebar.types.ts`. The two definitions are identical. This creates a maintenance risk if either diverges. | Major |

### SCSS / BEM
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `header/header.scss` | 13-37 | Uses `&__left`, `&__right`, `&__menu-btn`, `&__search` nesting shorthand instead of full BEM class names (`.header__left`, `.header__right`, etc.). Project rules require full class names, no `&__element` shorthand. | Minor |
| `sidebar/sidebar.scss` | 17-43 | Uses `&__header`, `&__logo`, `&__title`, `&__nav`, `&__footer` nesting shorthand instead of full BEM class names. Same `&__element` shorthand violation. | Minor |

### Test Quality
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `header/header.spec.ts` | 86-92 | "should emit multiple times on multiple clicks" test triggers 3 clicks and asserts the count is 3. This tests the JavaScript `+=` operator, not component behavior, and could be replaced by the existing single-emit test. If kept, it violates single-assertion-per-test only loosely (the assertion is singular but the setup is artificially inflated). | Suggestion |
| `header/header.spec.ts` | 104-131 | The breadcrumb project-selection tests (lines 105-130) access `handleBreadcrumbSelection` by casting to `any`-like shape (`HeaderComponent & { handleBreadcrumbSelection: ... }`). This is testing a `protected` method directly rather than triggering the breadcrumb component's `selectionChange` output, which would be more representative of real usage. | Minor |
| `header/header.spec.ts` | 107-108 | The `selectProject` test queries `.breadcrumb__select` which is an internal CSS class inside the `@watt/ui` `BreadcrumbComponent`. The test passes because the element exists, but coupling to a third-party component's internal DOM structure is fragile. If `@watt/ui` changes the class name, this test breaks. | Minor |
| `sidebar/sidebar.spec.ts` | 100-103 | `expect(items.length).toBeGreaterThanOrEqual(1)` is a weak assertion. The test provides exactly 1 nav item, so `toBe(1)` would be precise and catch regressions where extra items appear. | Minor |
| `sidebar/sidebar.spec.ts` | 177-183 | Logout test triggers click via `nativeElement.click()` on `.user-menu`. This works because `UserMenuComponent` emits `menuToggle` on click and the host class is `user-menu`. However, if the `UserMenuComponent` internal click handling changes, this could break. Consider emitting via `componentInstance.menuToggle.emit()` for a more focused unit test. | Suggestion |

### Architecture / Separation of Concerns
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `nav.config.ts` | 3-8, 10-48 | `NavItem` interface is defined in `nav.config.ts` alongside the data. This is fine for now but as the nav config grows (e.g., nested routes, badges, permissions beyond `adminOnly`), consider splitting the interface into a separate `nav.types.ts` file to follow the pattern established by `sidebar.types.ts`. | Suggestion |
| `sidebar/sidebar.html` | 29 | `(menuToggle)="logout.emit()"` maps the `UserMenuComponent` `menuToggle` event to the sidebar's `logout` output. The semantic mismatch ("menu toggle" means "logout") is handled correctly but could confuse future maintainers reading the template in isolation. A comment in the template or renaming the sidebar output to `menuToggle` (with the parent handling the logout logic) would improve clarity. This is already handled well in `app.ts` (`(logout)="onLogout()"`) so no functional issue exists. | Suggestion |

## What's Done Well

- **Correct `UserMenuComponent` integration.** The sidebar correctly binds to the `(menuToggle)` output of `ui-user-menu`, not a non-existent `logoutClick` event. This matches the `@watt/ui` API.
- **Admin-only nav filtering is properly implemented.** `nav.config.ts` declares `adminOnly: boolean` on items, and `app.ts` filters via `this.authService.isAdmin()`. Neither layout component injects `AuthService` or `Keycloak` directly -- the filtering responsibility stays in the app shell.
- **Components never inject Keycloak directly.** Both `HeaderComponent` and `SidebarComponent` are pure presentational components with no auth dependencies. Auth concerns are correctly lifted to the `AppComponent`.
- **All Angular 21 conventions followed.** Both components use `ChangeDetectionStrategy.OnPush`, `input()`/`input.required()`, `output()`, `inject()`, and control-flow syntax (`@for`). No legacy `*ngIf`/`*ngFor`, no constructor injection, no `@Input()`/`@Output()` decorators.
- **Clean separation of concerns.** The sidebar is a pure presentation component that receives all data via inputs. It has no knowledge of stores, routing logic, or auth state. The header similarly delegates navigation to its parent.
- **Well-typed interfaces.** `sidebar.types.ts` provides clean, focused interfaces (`SidebarNavItem`, `SidebarEnvironment`, `SidebarUser`) that define the sidebar's data contract. `IconName` from `@watt/ui` is used for type-safe icon references.
- **Design token usage.** Both SCSS files use CSS custom properties (`--bg-header`, `--bg-sidebar`, `--border-secondary`, etc.) for theming, enabling consistent light/dark mode support.
- **Responsive design.** The header hides the menu button on desktop (`display: none` with `@media (width <= 768px)` override) and hides search on mobile. The sidebar uses `position: fixed` with proper z-index layering.
- **100% test coverage on both components.** All 27 tests pass. Both header and sidebar specs achieve 100% statement/branch/function/line coverage.
- **Host component test pattern.** Both specs use a wrapper `HostComponent` to test inputs/outputs through the template binding, which is the recommended Angular Testing Library approach.
- **Immutable data contracts.** `NAV_ITEMS` is `readonly NavItem[]` with `as const`. Component inputs use `readonly` array types (`readonly SidebarNavItem[]`).

## Recommended Fixes (Priority Order)

1. **[Major] Remove duplicate `SidebarEnvironment` interface from `app.ts`.** Import from `./layout/sidebar/sidebar.types` instead of re-declaring. This is a DRY violation that could silently diverge.

2. **[Minor] Remove dead `createFlagClick` output from `HeaderComponent`.** The `onCreateFlagClick()` method navigates via `Router.navigate()` directly. No consumer binds to `(createFlagClick)`. Remove the unused output declaration on line 32 of `header.ts`.

3. **[Minor] Expand BEM class names in `header.scss` and `sidebar.scss`.** Replace `&__element` nesting shorthand with full `.block__element` selectors per project conventions. For example, change `&__left` to `.header__left` and `&__header` to `.sidebar__header`.

4. **[Minor] Strengthen sidebar nav-item count assertion.** Change `toBeGreaterThanOrEqual(1)` to `toBe(1)` in `sidebar.spec.ts` line 102 to match the exact test data provided.

5. **[Minor] Refactor breadcrumb selection tests to avoid internal DOM coupling.** Instead of querying `.breadcrumb__select` (internal to `@watt/ui`), emit via the `BreadcrumbComponent`'s `selectionChange` output directly, similar to how the search test emits via `searchInput.valueChange.emit()`.

6. **[Suggestion] Add `track item.route` instead of `track item.label` in sidebar template.** Routes are guaranteed unique; labels might not be (e.g., two nav items could theoretically share a display name). Same applies to `track env.name` -- consider `track env.route`.
