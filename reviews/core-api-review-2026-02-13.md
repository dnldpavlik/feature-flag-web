# Module Review: core/api — 2026-02-13

## Module Summary
- **Path:** `src/app/core/api/`
- **Purpose:** Generic CRUD API base class, injection token, error interceptor, API error model
- **File Count:** 5 production files, 4 test files
- **Test Coverage:** 4/4 testable files have specs (100%)

---

## Issues Found

### Documentation Drift
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| CLAUDE.md | CrudApi section | CLAUDE.md documents `CrudApi.update()` as using `http.put()` but actual implementation uses `http.patch()` | Major |

### Error Handling
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| error.interceptor.ts | 36 | 401 handler says "Session expired. Redirecting to login..." but does not actually redirect — Keycloak's `login-required` + auto-refresh handles this, so the message is misleading | Minor |

---

## What's Done Well
- `CrudApi<T, C, U>` is cleanly generic with good JSDoc and usage example
- Functional `HttpInterceptorFn` pattern with no class overhead
- `isApiError()` type guard is a pure function with thorough edge-case tests
- User-friendly error messages for all HTTP status codes including constraint violations
- Barrel file (`index.ts`) uses proper `export type {}` for type-only exports
- Tests verify all CRUD operations, all error status codes, and re-throw behavior
- `httpMock.verify()` in `afterEach` ensures no unexpected HTTP calls

---

## Recommended Fixes (Priority Order)
1. **Major:** Update CLAUDE.md CrudApi code sample to show `http.patch()` instead of `http.put()` for the `update()` method
2. **Minor:** Change 401 message to "Session expired. Please log in again." (remove "Redirecting" claim)
