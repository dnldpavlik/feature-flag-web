# Full Project Review Summary — 2026-02-13

## Overview
- **Total Modules Reviewed:** 14
- **Total Issues Found:** 201 (Blocker: 2, Major: 46, Minor: 109, Suggestion: 44)
- **Validation Results:** TypeScript 0 errors, ESLint+StyleLint 0 errors, Jest 64 suites / 1242 tests / 100% coverage (1899/1899 statements, 503/503 branches, 483/483 functions, 1639/1639 lines)

---

## Cross-Cutting Concerns

### Architectural Issues

1. **CLAUDE.md documents `CrudApi.update()` as PUT but code uses PATCH** — The documentation shows `http.put()` but `crud.api.ts:63` uses `http.patch()`. Flagged independently by flags, environments, projects, and segments reviewers. Single fix in CLAUDE.md resolves all references.

2. **Auth guards inject `Keycloak` directly instead of `AuthService`** — Both `authGuard` and `roleGuard` in `core/auth/` inject `Keycloak` directly, violating the project's own rule: "Components inject AuthService, never keycloak-js directly." The `roleGuard` also duplicates role-loading logic from `AuthService.loadRoles()`.

3. **`canAdd()` is a method call in templates, not a computed signal** — Appears in `environment-list.ts`, `project-list.ts`, and `segment-list.ts`. With `OnPush` change detection, these method calls only re-evaluate on change detection cycles, which works coincidentally but is inconsistent with the signals-first architecture. Should be `computed()` signals.

4. **Inconsistent error handling across stores** — `EnvironmentStore` uses explicit `toast.error()` in catch blocks (will double-toast with `errorInterceptor`). `ProjectStore` swallows errors silently (no re-throw). `FlagStore` and `SegmentStore` rely on the error interceptor. The project needs a single agreed-upon pattern.

5. **Settings module is largely scaffolded, not functional** — UserProfile is hardcoded (not wired to AuthService), password form is a no-op (should delegate to Keycloak), preferences have no backend persistence, reduced motion and compact mode are stored but never applied. This module needs significant rework to be production-ready.

6. **Missing route guards on several feature modules** — Projects, audit, and dashboard routes rely only on parent-level `authGuard`. Whether `roleGuard` should apply to projects and audit is a policy decision, but the inconsistency with environments and settings (which have `roleGuard`) should be resolved.

7. **Production deployment gaps** — CSP `connect-src` doesn't include Keycloak domain (auth will break), `angular.json` missing `fileReplacements` for production build (dev environment used), nginx static asset location blocks lose security headers.

### Project-Wide Patterns

1. **BEM `&__element` nesting shorthand** — Used in settings (all 5 SCSS files), header, sidebar. The project rule mandates full class names (`.block__element { }`) but this is inconsistently enforced. ~20 files affected.

2. **Protected member access in tests via unsafe casts** — Tests across audit-list, settings tabs, dashboard, flags, segments, and layout use `component as unknown as { ... }` or `component['protected']()` to access protected members. The project should decide on a testing convention: either make template-bound methods public, or test exclusively through the DOM.

3. **Dead code in testing module** — `mock.factories.ts` is entirely unused (no spec file imports any factory). 20+ helper functions in `store.helpers.ts`, `dom.helpers.ts`, and `component.helpers.ts` are exported but never imported externally. This adds maintenance burden and cognitive overhead.

4. **Missing `:host { display: block; }` on most components** — Only the icon components and a few others define `:host` display behavior. Most feature components render as inline by default.

5. **Bare element selectors in SCSS** (`h1`, `h2`, `p`, `strong`) — Found in segments, dashboard, and layout SCSS files. BEM convention prefers explicit element classes (`.block__title` over `h2`).

---

## Module Health Summary

| Module | Blocker | Major | Minor | Suggestion | Test Coverage | Status |
|--------|---------|-------|-------|------------|---------------|--------|
| core/api | 0 | 1 | 1 | 0 | 100% (4/4 specs) | 🟢 Healthy |
| core/auth | 0 | 2 | 3 | 0 | 100% (3/3 specs) | 🟡 Needs Attention |
| core/theme+time | 0 | 0 | 0 | 1 | 100% (2/2 specs) | 🟢 Healthy |
| shared/store | 0 | 1 | 3 | 1 | 100% (5/5 specs) | 🟡 Needs Attention |
| shared/ui+utils | 0 | 0 | 3 | 5 | 100% (7/7 specs) | 🟢 Healthy |
| features/flags | 0 | 5 | 9 | 4 | 100% (8/8 specs) | 🟡 Needs Attention |
| features/environments+projects | 0 | 3 | 7 | 3 | 100% (4/4 specs) | 🟡 Needs Attention |
| features/segments | 0 | 5 | 20 | 5 | 100% (6/6 specs) | 🟡 Needs Attention |
| features/audit | 0 | 3 | 7 | 7 | 100% (4/4 specs) | 🟡 Needs Attention |
| features/settings | 1 | 10 | 10 | 4 | 100% (7/7 specs) | 🔴 Critical Issues |
| features/dashboard | 0 | 2 | 4 | 4 | 96% (route gap) | 🟡 Needs Attention |
| layout | 0 | 1 | 6 | 4 | 100% (2/2 specs) | 🟡 Needs Attention |
| app-root+config/infra | 1 | 7 | 12 | 3 | 100% (2/2 specs) | 🔴 Critical Issues |
| testing | 0 | 6 | 24 | 3 | 1/6 (test infra) | 🟡 Needs Attention |

Status: 🟢 Healthy (3) | 🟡 Needs Attention (9) | 🔴 Critical Issues (2)

---

## Top 10 Priority Fixes (Project-Wide)

1. **[Blocker] app-root-config:** Update Playwright Docker image in `.gitlab-ci.yml` from `v1.50.0` to match `@playwright/test@^1.58.0` in `package.json`. Playwright requires exact version parity — CI E2E tests are currently broken.

2. **[Blocker] features/settings:** Replace hardcoded `UserProfile` (`{ id: 'user_1', name: 'John Doe' }`) with `AuthService.userProfile()`. The settings page displays fake data instead of the actual authenticated user.

3. **[Major] app-root-config:** Add `fileReplacements` to `angular.json` production config to swap `environment.ts` for `environment.prod.ts`. Without this, `ng build --configuration production` uses dev settings (localhost Keycloak).

4. **[Major] app-root-config:** Update `nginx.conf` CSP `connect-src 'self'` to include the Keycloak origin. Keycloak OIDC token refresh/exchange will be blocked in production.

5. **[Major] app-root-config:** Fix nginx static asset location block — it only re-adds 2 of 7 security headers. Nginx `add_header` in a location block replaces (not appends) parent headers. Use an `include` snippet or re-add all headers.

6. **[Major] app-root-config:** Resolve dual ESLint config (`.eslintrc.json` + `eslint.config.js`). The flat config is missing rules present in the legacy config (`no-explicit-any`, `explicit-function-return-type`, `eqeqeq`, `curly`, `no-console`, etc.).

7. **[Major] app-root-config:** Fix `tsconfig.spec.json` `types: ["jasmine"]` to `types: ["jest"]`. Tests get Jasmine type hints instead of Jest.

8. **[Major] features/flags:** Add delete confirmation dialog to `flag-list.html` and `flag-detail.html`. Accidental clicks permanently delete flags without confirmation.

9. **[Major] features/flags:** `await` async store operations before `router.navigate()` in `flag-detail.ts:170` and `flag-create.ts:115`. If the API call fails, the user is still navigated away from the form.

10. **[Major] app-root-config:** Fix cross-browser e2e `before_script` in `.gitlab-ci.yml` — it overrides parent without writing `CI_JOB_TOKEN` to `.npmrc`, causing `@watt/ui` install to fail.

---

## Duplicated Code Across Modules

| Pattern/Function | Found In | Recommendation |
|------------------|----------|----------------|
| `canAdd()` method (form validation → boolean) | environments-list, projects-list, segments-list | Extract to `computed()` signal pattern; each module should use its own computed, but the anti-pattern (method instead of signal) repeats across all three |
| `on*Input()` handlers (`event.target as HTMLInputElement`) | settings/user-profile-tab (5x), settings/preferences-tab (2x), segments/segment-detail (3x), environments/environment-detail (3x) | Extract a shared `getInputValue(event: Event): string` utility to `form.utils.ts` |
| Delete confirmation pattern (modal + state signals) | environments-list, projects-list | Segments and flags lack this pattern entirely — extract a reusable `ConfirmDeleteDialogComponent` or use a service-based approach |
| Role loading logic | auth.service.ts `loadRoles()`, role.guard.ts inline | Consolidate in `AuthService`; guard should call `authService.hasRole()` |
| `UserProfile` interface | core/auth/auth.models.ts, features/settings/models/settings.model.ts | Remove settings duplicate, reuse auth model (or extend it) |
| BEM SCSS `&__element` nesting | settings (5 files), layout/header, layout/sidebar | Systematic find-and-replace to full `.block__element` class names |
| `UpdateXxxInput` in API file instead of model file | segments/api/segment.api.ts, projects/api/project.api.ts | Move to respective model files to match flags/environments pattern |
| `as unknown as { ... }` test casts for protected members | audit-list.spec, dashboard.spec, settings tabs, flags, segments | Decide project-wide: either (a) make template-bound methods public, or (b) test only through DOM interactions |
| `capitalize()` function | features/audit/audit-list.ts (module-level) | Extract to `shared/utils/string.utils.ts` for reuse |
| Store selection + localStorage persistence | shared/store/project.store.ts, shared/store/environment.store.ts | Consider a `SelectableStoreMixin` or shared helper to reduce duplication |

---

## Recommended Review Order for Fixes

1. **app-root+config/infra** (1 Blocker, 7 Major) — Highest priority. Contains the only production-breaking issues: Playwright CI mismatch, missing `fileReplacements`, CSP blocking Keycloak, lost security headers, dual ESLint config. Fix these first to unblock CI and production deployments.

2. **features/settings** (1 Blocker, 10 Major) — Second priority. The hardcoded UserProfile is a Blocker; the BEM violations and non-functional features (password, reduced motion) are all Major. This module needs the most rework of any feature.

3. **features/flags** (5 Major) — The largest feature module. Missing delete confirmation and async-before-navigate bugs are data-loss risks. Duplicate `UpdateEnvironmentValueInput` interfaces create confusion.

4. **features/segments** (5 Major, 20 Minor) — Highest Minor count due to BEM violations in SCSS. The `canAdd()` method-vs-signal issue and DRY violation in rule-row are actionable Majors.

5. **testing** (6 Major, 24 Minor) — Most Minors are dead code. The type mismatches between `MockItem`/`StoreItem` (`Date` vs `string`) are Majors. Can batch-remove dead code in a single cleanup PR.

6. **core/auth** (2 Major) — Guards injecting Keycloak directly and duplicated role logic. Small module, quick fix.

7. **features/environments+projects** (3 Major) — Project delete swallows errors causing data integrity risk. Small scope fix.

8. **features/audit** (3 Major) — Missing loading/error state and test encapsulation issues.

9. **features/dashboard** (2 Major) — Dead "Create Your First Flag" button and routes coverage gap.

10. **layout** (1 Major) — Duplicated `SidebarEnvironment` interface.

11. **shared/store** (1 Major) — EnvironmentStore double-toast issue.

12. **CLAUDE.md documentation** — Several documentation drift issues: PUT vs PATCH, guard examples, `isAuthenticated` type, `@watt/ui` import paths. Bundle all doc fixes into one PR.

13. **core/api, core/theme+time, shared/ui+utils** — Healthy modules with only Minor/Suggestion items. Address opportunistically.

---

## What's Going Well

Despite 201 issues, the project demonstrates strong engineering fundamentals:

- **100% test coverage** enforced across 1242 tests with no gaps (except one dashboard routes file)
- **Signals-first architecture** consistently applied — no NgRx, no BehaviorSubjects, all state via `signal()`/`computed()`
- **Clean generic abstractions** — `CrudApi<T,C,U>` and `BaseCrudStore<T>` eliminate boilerplate across 5+ features
- **Functional programming** — Pure utility functions with composable filter predicates, higher-order functions, immutable state updates everywhere
- **Keycloak integration** — OIDC/PKCE with auto-refresh, bearer token interceptor, and functional guards is production-grade
- **Modern Angular conventions** — All components use `OnPush`, `inject()`, signal-based I/O, `@if`/`@for` control flow, standalone by default
- **Design token system** — Complete light/dark theme via CSS custom properties with 40+ tokens
- **Docker security** — Non-root, read-only filesystem, resource limits, comprehensive headers (with the noted gaps)
- **Separation of concerns** — Clean layering: API → Store → Component → Template with types/models in dedicated files
- **@watt/ui integration** — 22 shared UI components properly consumed with `ui-*` selectors throughout
