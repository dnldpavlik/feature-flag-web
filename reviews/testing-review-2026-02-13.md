# Module Review: testing -- 2026-02-13

## Module Summary
- **Path:** `src/app/testing/`
- **Purpose:** Centralized test utilities providing store assertions, component setup helpers, DOM query helpers, detail component test scaffolding, mock data factories, and mock API providers (including Keycloak mocks) for the entire test suite.
- **File Count:** 6 production, 1 test
- **Test Coverage:** 1/6 testable files have specs (`detail-component.helpers.spec.ts`). The remaining 5 files are test-infrastructure code (helpers/factories/providers) typically exempt from unit testing, though `store.helpers.ts` contains a `testStoreCrud` function with non-trivial logic that would benefit from its own tests.

## Issues Found

### Type Safety
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `store.helpers.ts` | 12-16 | `StoreItem.createdAt` and `updatedAt` typed as `Date` but all domain models (`Flag`, `Project`, `Environment`, `Segment`, `AuditEntry`, `ApiKey`) use `string` (ISO timestamps). This type mismatch means store helpers like `expectTimestamps` cannot accept actual domain model objects without type assertions. | Major |
| `store.helpers.ts` | 85-88 | `expectTimestamps` casts `item.createdAt` to `Date \| string \| undefined` -- the cast is necessary precisely because the `StoreItem` interface types them as `Date` when they should be `string`. This is a symptom of the root interface mismatch. | Minor |
| `mock.factories.ts` | 18-19, 25-29, 34-40 | `MockItem` and all mock factories use `Date` for `createdAt`/`updatedAt`, but actual domain models use ISO `string` timestamps. Mock factories produce objects structurally incompatible with the real `Flag`, `Project`, `Environment`, `Segment` models. | Major |
| `mock.factories.ts` | 54 | `MockFlag.environmentValues` typed as `Record<string, { enabled: boolean; value: unknown }>` but actual `EnvironmentFlagValue` has additional required fields (`flagId`, `environmentId`, `segmentKeys`, `updatedAt`). Mock flags produced by `createMockFlag` would fail type checks against the real `Flag` interface. | Major |
| `mock.factories.ts` | 193-198 | `MockApiKey` uses `lastUsed: Date \| null` but the real `ApiKey` model uses `lastUsedAt: string \| null` and has additional fields (`prefix`, `expiresAt`, `scopes`). The mock factory produces structurally different objects. | Major |
| `mock.factories.ts` | 165-173 | `MockAuditLog` uses `entityType`/`entityId`/`entityName` but the real `AuditEntry` uses `resourceType`/`resourceId`/`resourceName`. Different field naming makes these mocks unusable as substitutes for real audit entries. | Major |
| `component.helpers.ts` | 97-98 | `ComponentWithForm` interface uses a loosely typed `form.get()` returning `{ value: unknown; setValue: (v: unknown) => void } \| null`. This is acceptable for test helpers -- the `unknown` types provide flexibility while maintaining null safety. | N/A (acceptable) |
| `detail-component.helpers.spec.ts` | 124 | `TestBed.inject('CUSTOM_TOKEN' as never)` -- uses `never` cast to bypass TypeScript. While in a test file (where `any` is permitted), using a proper `InjectionToken` would be cleaner. | Minor |

### Dead Code / Unused Exports
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `mock.factories.ts` | entire file | **No spec file in the entire codebase imports any mock factory** (`createMockFlag`, `createMockProject`, `createMockEnvironment`, `createMockSegment`, `createMockAuditLog`, `createMockApiKey`, `createMockList`, `createMockItem`, `createMockSegmentRule`, `mockId`, `mockTimestamp`). All tests use the seed data from `mock-api.providers.ts` instead. The entire file and all its exports from `index.ts` are dead code. | Major |
| `store.helpers.ts` | 65-67 | `expectIdPattern` -- exported but never imported by any spec file outside the module itself. Only used internally by `testStoreCrud`. | Minor |
| `store.helpers.ts` | 72-88 | `expectTimestamp`, `expectTimestamps` -- exported but never imported by any spec file. | Minor |
| `store.helpers.ts` | 49-60 | `expectItemExists`, `expectItemNotExists` -- only `expectItemNotExists` is used (by `flag.store.spec.ts`). `expectItemExists` is never imported externally. | Minor |
| `store.helpers.ts` | 124-126 | `findById` -- exported but never imported by any spec file. Only used internally by `expectItemProperty`. | Minor |
| `store.helpers.ts` | 131-140 | `expectItemProperty` -- exported but never imported by any spec file. | Minor |
| `store.helpers.ts` | 146-184 | `testStoreCrud` + `CrudTestConfig` -- exported but never used by any spec file. This is a parameterized test generator that was likely designed for reuse but was never adopted. | Minor |
| `store.helpers.ts` | 42-44 | `expectItemCount` -- used by only `flag.store.spec.ts`. Technically used but has very low adoption for a shared helper. | N/A (not dead) |
| `dom.helpers.ts` | 138-142 | `click` helper -- exported but never imported by any spec file. Tests use native `.nativeElement.click()` or `.triggerEventHandler('click')` instead. | Minor |
| `dom.helpers.ts` | 147-158 | `setInputValue` -- exported but never imported by any spec file. | Minor |
| `dom.helpers.ts` | 43-45 | `getTableRows` -- exported but never imported by any spec file. Only used internally by `getRowCount`. | Minor |
| `dom.helpers.ts` | 50-52 | `getRowCount` -- exported but never imported by any spec file. | Minor |
| `dom.helpers.ts` | 110-112 | `expectRowCount` -- exported but never imported by any spec file. | Minor |
| `dom.helpers.ts` | 117-124 | `expectHasClass` -- exported but never imported by any spec file. | Minor |
| `dom.helpers.ts` | 129-133 | `expectButton` -- exported but never imported by any spec file. | Minor |
| `dom.helpers.ts` | 28-31 | `getText` -- exported but never imported by any spec file. Only used internally by `expectTextContains`. | Minor |
| `dom.helpers.ts` | 36-38 | `exists` -- exported but never imported by any spec file. Only used internally by `expectExists`. | Minor |
| `component.helpers.ts` | 52-55 | `detectChangesAndWait` -- exported but never imported by any spec file. | Minor |
| `component.helpers.ts` | 60-63 | `dispatchInputEvent` -- exported but never imported by any spec file. | Minor |
| `component.helpers.ts` | 68-70 | `dispatchChangeEvent` -- exported but never imported by any spec file. | Minor |
| `component.helpers.ts` | 75-77 | `dispatchBlurEvent` -- exported but never imported by any spec file. | Minor |
| `mock-api.providers.ts` | 442-553 | `MOCK_AUDIT_ENTRIES` -- exported from `mock-api.providers.ts` but NOT re-exported from `index.ts`, and never directly imported by any spec file. Only used internally by `MOCK_AUDIT_API.getAll`. It is accessible via `MOCK_API_PROVIDERS` but the array itself is not independently consumed. | Minor |

### Functional Programming / Immutability
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `mock-api.providers.ts` | 56 | `let mockIdCounter = 1000` -- module-level mutable state. This counter is shared across all tests in a suite and increments with every mock create/update call. Since it is never reset between tests, ID values are non-deterministic across test runs when tests create entities. This violates the pure-function principle and could theoretically cause flaky test assertions that depend on specific generated IDs. | Minor |
| `mock-api.providers.ts` | 232-249 | Mock API `create` methods call `new Date().toISOString()` directly, making timestamps non-deterministic. The seed data correctly uses `SEED_TIMESTAMP` for reproducibility, but dynamically created entities do not. If a test asserts on `createdAt`, the result is timing-dependent. | Suggestion |

### SOLID Principles
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `mock-api.providers.ts` | 1-637 | **Single Responsibility concern** -- this file is 637 lines and handles seed data for 6 domains (projects, environments, flags, segments, audit, API keys) plus Keycloak mocks plus the combined provider array. While the "one file for all mocks" approach has practical convenience, the file is becoming difficult to maintain. Consider splitting seed data constants from mock API definitions, or splitting by domain. | Suggestion |

### Test Quality
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `detail-component.helpers.spec.ts` | 70 | Test accesses `context.component.title()` which is a `protected` member. TypeScript allows this in spec files but it relies on the test file having visibility access. This pattern is acceptable in Angular testing but worth noting. | N/A (acceptable) |
| `store.helpers.ts` | 154-184 | `testStoreCrud` generates test cases with `describe`/`it` blocks programmatically, but line 169 has a comment `// Assuming prepend` -- this assumption about insertion order is fragile and would silently pass even if the store appends instead of prepends. | Minor |

### Missing Functionality
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `mock-api.providers.ts` | -- | No mock for `SearchStore` or any search-related API. If search store tests exist, they must create their own mocks independently. | Suggestion |

## What's Done Well

- **Keycloak mocks are comprehensive.** The `MOCK_API_PROVIDERS` array includes both `Keycloak` instance mock and `KEYCLOAK_EVENT_SIGNAL` mock, enabling any test that needs auth context to simply spread the providers. The mock includes `authenticated: true`, `token`, `login`, `logout`, `loadUserProfile`, `resourceAccess` with admin role, and `realmAccess`. This is exactly what the project's CLAUDE.md specifies.

- **Seed data in `mock-api.providers.ts` is rich and realistic.** Five flags across two projects, covering all four flag types (boolean, string, number, JSON), with realistic environment values (dev enabled, production disabled). Three environments with proper ordering and color coding. Two segments with multiple rule types. Ten audit entries with varied actions, resource types, users, and timestamps. Two API keys with different configurations (one with expiry, one without; different scopes).

- **Mock API behavior is faithful to real API contracts.** The `MOCK_FLAG_API.updateEnvironmentValue` correctly merges existing environment values rather than replacing them, mirroring the documented PATCH merge behavior. The `MOCK_SEGMENT_API` correctly implements `addRule`, `updateRule`, and `deleteRule` with proper rule count maintenance.

- **`setupDetailComponentTest` pattern is elegant.** The builder pattern with lazy getters and `TestBed.resetTestingModule()` between builds allows tests to create multiple scenarios with different route parameters without boilerplate. The context object pattern avoids the need to declare variables before `beforeEach`.

- **Pure function design in most helpers.** `store.helpers.ts`, `dom.helpers.ts`, and `component.helpers.ts` export stateless pure functions that take inputs and make assertions. No shared mutable state within these files.

- **Barrel export via `index.ts` is well-organized.** Groups exports by category with comments, re-exports all types alongside their factory functions, and enables clean imports from `@/app/testing`.

- **Generic type parameters throughout.** `expectHasItems<T>`, `findByKey<T extends { key: string }>`, `setupComponentTest<T>`, `createMockList<T>` -- helpers are properly generic, avoiding `any` in function signatures.

- **`detail-component.helpers.spec.ts` has thorough coverage.** Tests cover the `createMockLocation`, `createMockActivatedRoute`, and `setupDetailComponentTest` functions including edge cases (no parameter, multiple builds, custom providers).

- **`createSeedEnvValue` helper in mock-api.providers.ts.** Reduces duplication when constructing the verbose `EnvironmentFlagValue` objects for seed flags.

## Recommended Fixes (Priority Order)

1. **[Major] Align mock factory types with domain models.** The `MockFlag`, `MockProject`, `MockEnvironment`, `MockSegment`, `MockAuditLog`, and `MockApiKey` interfaces in `mock.factories.ts` have structural divergences from their real counterparts (`Date` vs `string` timestamps, different field names for audit, missing fields on API keys and environment values). Either: (a) remove the mock factories entirely since they are unused dead code, or (b) if they are intended for future use, redefine them as `Partial<RealType>` wrappers or use the real model types with default values. Option (a) is recommended given that no spec file imports any factory from this module.

2. **[Major] Fix `StoreItem` timestamp types.** Change `createdAt` and `updatedAt` from `Date` to `string` in the `StoreItem` interface (line 12-16 of `store.helpers.ts`) to match all domain models which use ISO string timestamps. This will also fix the type assertion in `expectTimestamps`.

3. **[Major] Remove or quarantine dead code.** Approximately 20 exported functions/types across the module are never imported by any spec file. At minimum: (a) delete `mock.factories.ts` entirely (all exports are unused), (b) mark unused store/dom/component helpers as `@internal` or remove them. This reduces cognitive overhead and eliminates maintenance burden for code that provides no value.

4. **[Minor] Reset `mockIdCounter` between tests.** Add a `resetMockState()` export to `mock-api.providers.ts` and document that it should be called in `beforeEach` blocks when tests depend on deterministic ID generation. Alternatively, refactor the counter into a function parameter.

5. **[Minor] Fix `testStoreCrud` prepend assumption.** Line 169 assumes newest items are at index 0. Either: (a) add a `sortOrder` option to `CrudTestConfig`, or (b) search the entire array for the newest item by matching properties from `createInput()`, or (c) remove `testStoreCrud` since it is unused.

6. **[Suggestion] Consider splitting `mock-api.providers.ts`.** At 637 lines, consider extracting seed data constants into `mock-data.ts` (or per-domain files like `mock-flags.ts`, `mock-segments.ts`) and keeping only the provider array and mock API implementations in `mock-api.providers.ts`.

7. **[Suggestion] Re-export `MOCK_AUDIT_ENTRIES` from `index.ts`.** Currently the only seed data array not available through the barrel export. Add it alongside `MOCK_PROJECTS`, `MOCK_ENVIRONMENTS`, `MOCK_FLAGS`, `MOCK_SEGMENTS`, and `MOCK_API_KEYS` for consistency.

8. **[Suggestion] Use deterministic timestamps in mock API create methods.** Replace `new Date().toISOString()` calls in mock API `create`/`update` methods with `SEED_TIMESTAMP` or a configurable timestamp to make all mock operations reproducible.
