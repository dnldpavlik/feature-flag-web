# Module Review: shared/store — 2026-02-13

## Module Summary
- **Path:** `src/app/shared/store/`
- **Purpose:** Store interfaces, abstract BaseCrudStore, ProjectStore, EnvironmentStore, SearchStore
- **File Count:** 5 production files, 5 test files
- **Test Coverage:** 5/5 testable files have specs (100%)

---

## Issues Found

### SOLID Principles
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| project.store.ts | 5-8 | ProjectStore in `shared/store/` imports from `features/projects/` and `features/audit/` — cross-boundary dependency (shared → features). Valid for DI sharing but blurs the layer boundary | Minor |
| environment.store.ts | 4-7 | Same cross-boundary pattern: imports from `features/environments/` and `features/audit/` | Minor |

### Error Handling
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| environment.store.ts | 75,92,109 | Explicit `toast.error()` in catch blocks will DOUBLE-toast with `errorInterceptor` (which already shows toast for all HTTP errors) | Major |
| project.store.ts | 61-63 | Correctly delegates error display to error interceptor with empty catch — inconsistent with EnvironmentStore's approach | Minor |

### Framework Best Practices
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| base-crud.store.ts | 152 | `as T` type assertion in `addItem()` — necessary due to generics but loses compile-time safety on the constructed object | Suggestion |

---

## What's Done Well
- **Store interfaces:** Exemplary Interface Segregation — `ReadableStore`, `SelectableStore`, `CreatableStore`, `DeletableStore`, `UpdatableStore`, `CrudStore`, `DefaultableStore`, `FilterableStore` — each with single responsibility
- **BaseCrudStore:** Clean abstract base with `loadFromApi()` (loading/error state), `addItem()` (auto ID/timestamps), `updateItem()`, `deleteItem()` (last-item protection), `updateWhere()` (bulk updates)
- **TimeProvider injection:** testable timestamps without mocking Date
- **Immutable updates everywhere:** `.update()` with spread/map/filter — no mutations
- **ProjectStore:** localStorage persistence for selection with graceful fallbacks (saved → default → first)
- **EnvironmentStore:** `sortedEnvironments` computed signal, fallback selection on delete including localStorage update
- **SearchStore:** Minimal and focused — `query`, `normalizedQuery` (trim+lowercase), `clear()`
- **Tests:** Exhaustive — all CRUD paths, persistence, fallbacks, error handling, audit logging verified

---

## Recommended Fixes (Priority Order)
1. **Major:** Remove explicit `toast.error()` calls from EnvironmentStore catch blocks — the error interceptor already handles this. Align with ProjectStore's pattern of empty catches
2. **Minor:** Consider extracting shared selection+persistence logic from ProjectStore and EnvironmentStore into a reusable `SelectableStoreMixin` or helper to reduce duplication
3. **Suggestion:** Add a `shared/store/index.ts` barrel file to simplify imports
