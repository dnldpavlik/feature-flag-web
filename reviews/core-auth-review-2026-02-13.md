# Module Review: core/auth — 2026-02-13

## Module Summary
- **Path:** `src/app/core/auth/`
- **Purpose:** Keycloak OIDC/PKCE authentication — AuthService, auth guard, role guard, auth models
- **File Count:** 4 production files, 3 test files
- **Test Coverage:** 3/3 testable files have specs (100%)

---

## Issues Found

### Documentation Drift
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| CLAUDE.md | Auth section | Documents `isAuthenticated` as `signal(false)` but actual implementation is `computed()` — the code is better | Minor |
| CLAUDE.md | Route Guards section | Documents guards using `createAuthGuard<CanActivateFn>()` helper but actual guards are plain functions — no such helper exists | Major |

### SOLID Principles
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| auth.guard.ts | 6 | Injects `Keycloak` directly instead of `AuthService` — violates the project convention "Components inject AuthService, never keycloak-js directly" (also applies to guards per angular.md checklist) | Minor |
| role.guard.ts | 8,14-17 | Injects `Keycloak` directly AND duplicates role-loading logic from `AuthService.loadRoles()` — both a convention violation and DRY issue | Major |

### Framework Best Practices
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| role.guard.ts | 10 | `route.data['role'] as string` — uses bracket notation + type assertion; could use typed route data or at minimum validate the value | Minor |

---

## What's Done Well
- `AuthService` uses reactive `computed()` for `isAuthenticated` driven by `KEYCLOAK_EVENT_SIGNAL` — excellent reactive pattern
- Private writable signals with public `asReadonly()` accessors follow store conventions
- `loadProfile()` gracefully handles undefined fields with `?? ''` and computes `fullName` with filter
- Tests cover all Keycloak event types (Ready, AuthSuccess, AuthRefreshSuccess), role combinations (client, realm, combined, undefined realmAccess), profile edge cases (empty, partial, failure)
- `AUTH_ROLES` uses `as const` with derived `AuthRole` union type
- Role guard correctly redirects to `/dashboard` via `createUrlTree` (not imperative navigation)

---

## Recommended Fixes (Priority Order)
1. **Major:** Update CLAUDE.md guard examples to match actual implementation (plain `CanActivateFn` functions, not `createAuthGuard`)
2. **Major:** Refactor `roleGuard` to use `AuthService` for role checking (call `service.hasRole(requiredRole)`) to eliminate duplicated role-loading logic
3. **Minor:** Refactor `authGuard` to use `AuthService.isAuthenticated()` + `AuthService.login()` for consistency
4. **Minor:** Update CLAUDE.md `isAuthenticated` description to show `computed()` pattern
