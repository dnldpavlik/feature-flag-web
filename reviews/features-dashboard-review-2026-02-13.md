# Module Review: features/dashboard -- 2026-02-13

## Module Summary
- **Path:** `src/app/features/dashboard/`
- **Purpose:** Dashboard view displaying feature flag statistics (total, active, inactive, environments), a "recently updated flags" table with search highlighting, and an empty state for new users. Serves as the landing page of the application.
- **File Count:** 4 production files (`dashboard.routes.ts`, `dashboard.ts`, `dashboard.html`, `dashboard.scss`, `dashboard.types.ts`), 1 test file
- **Test Coverage:** 1/1 testable component files have specs. Routes file (`dashboard.routes.ts`) lacks a dedicated spec, dropping overall module statement coverage to 96% (100% required). The component itself achieves 100% across all metrics.

## Issues Found

### Test Coverage
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `dashboard.routes.ts` | 3-5 | Routes file has 0% statement/line coverage. While route files are declarative, the 100% global threshold fails (`96% stmts, 95.34% lines`). Either add a trivial route spec or add the routes file to `coveragePathIgnorePatterns`. | Major |
| `dashboard.spec.ts` | 123-124 | Test accesses protected `recentFlagsWithHighlights` via `component as unknown as { ... }` cast. This couples the test to internal implementation details and bypasses TypeScript's access control. Should assert through the DOM instead (query rendered highlight parts with empty query). | Minor |

### Template Complexity
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `dashboard.html` | 43-68 | The highlight-parts `@for`/`@if` block is copy-pasted 3 times (for `nameParts`, `keyParts`, `descriptionParts`). This violates DRY. Extract a small reusable `HighlightTextComponent` (or use an `ng-template` with context) to render `HighlightPart[]` arrays. | Minor |

### Accessibility
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `dashboard.html` | 10-15 | The `stats-grid` section has no semantic landmark or heading. Wrapping in a `<section>` with an `aria-label` or visually hidden heading (e.g., "Statistics overview") would improve screen reader navigation. | Suggestion |
| `dashboard.html` | 84-94 | The "Create Your First Flag" `<ui-button>` has no `[routerLink]` or `(click)` handler. The button is non-functional -- clicking it does nothing. This is a usability issue for new users. | Major |

### SCSS
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `dashboard.scss` | 8-14 | Bare element selectors `h1` and `> p` inside `.welcome-section` are fragile. If template structure changes or additional headings/paragraphs are added, styles will leak. BEM convention prefers explicit classes like `.welcome-section__title` and `.welcome-section__subtitle`. This is a project-wide pattern (seen in other feature SCSS), so addressing it here alone would create inconsistency. | Suggestion |
| `dashboard.scss` | 44-51 | Bare `h2` and `p` selectors inside `.recent-flags__header` have the same fragility concern. Prefer `.recent-flags__title` and `.recent-flags__subtitle`. | Suggestion |
| `dashboard.scss` | 1-79 | No `:host` block defining `display: block` (or flex/grid). Without it, the component renders as an inline element by default, which can cause layout issues when composed with other components. Most Angular components benefit from `:host { display: block; }`. | Minor |

### Functional / Logic
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `dashboard.ts` | 66 | Sorting by `new Date(b.updatedAt).valueOf()` creates a new `Date` object per comparison call. For 5 items this is negligible, but the sort runs on every signal recomputation. Consider memoizing or using direct string comparison if `updatedAt` is ISO 8601 (lexicographic sort works for ISO dates). | Suggestion |
| `dashboard.html` | 84 | `@if (totalFlags() === 0)` is the logical inverse of line 17's `@if (totalFlags() > 0)`. Using `@else` after the closing brace on line 82 would be cleaner, reduce a redundant signal read, and make the mutual exclusivity explicit. | Minor |

## What's Done Well

- **Signals-first architecture:** All state is derived from store signals via `computed()`. No subscriptions, no imperative state management. Clean reactive data flow.
- **OnPush change detection:** Correctly applied, complementing the signals pattern.
- **Separation of concerns:** Types extracted into `dashboard.types.ts`. View logic (highlighting, filtering) delegated to pure utility functions (`search.utils.ts`, `flag-value.utils.ts`). Component is lean.
- **Functional programming:** `recentFlags` computed uses pure `map`/`sort`/`slice` chain with no mutations. `filteredRecentFlags` composes `matchesSearch` predicate cleanly. The spread `[...this.flagStore.flagsInSelectedProject()]` before `.sort()` correctly avoids mutating the source array.
- **Immutability:** All derived data creates new arrays/objects. No direct signal mutation.
- **Test quality:** 14 tests covering stat rendering, project/environment switching, search filtering, highlighting, empty state, and fallback labels. Uses project test helpers (`setupComponentTest`, `expectEmptyState`, `queryAll`, etc.) consistently.
- **Angular conventions:** Uses `inject()` for DI, `input()`/`output()` pattern (no inputs/outputs in this component, which is correct for a routed page), `@if`/`@for` control flow, no legacy directives.
- **BEM SCSS:** Full class names used throughout (`.recent-flags__header`, `.recent-flags__link`, `.recent-flags__highlight`, etc.). No `&__` nesting. Consistent naming.
- **Clean route config:** Simple, declarative, lazy-loadable via `DASHBOARD_ROUTES`.
- **Type model design:** `RecentFlag` extends `Flag` with `currentEnabled`, and `RecentFlagWithHighlights` adds highlight part arrays. Discriminated and composable.

## Recommended Fixes (Priority Order)

1. **[Major] Add `routerLink` to "Create Your First Flag" button** (dashboard.html:90). The button is currently non-functional. Add `[routerLink]="['/flags/create']"` to navigate users to the flag creation page.

2. **[Major] Address routes coverage gap** (dashboard.routes.ts). Either:
   - (a) Add a minimal `dashboard.routes.spec.ts` that imports `DASHBOARD_ROUTES` and asserts it has the expected path/component, or
   - (b) Add `dashboard.routes.ts` to `coveragePathIgnorePatterns` in `jest.config.js` if the team considers route files non-testable.

3. **[Minor] Replace `@if`/`@if` with `@if`/`@else`** (dashboard.html:17,84). Change the second `@if (totalFlags() === 0)` on line 84 to `} @else {` after line 82. This makes the mutual exclusivity explicit and removes a redundant signal evaluation.

4. **[Minor] Add `:host { display: block; }` to SCSS** (dashboard.scss). This ensures the component has block-level layout behavior and prevents potential inline-element rendering issues.

5. **[Minor] Extract highlight rendering into a reusable pattern** (dashboard.html:43-68). Create a small `HighlightTextComponent` that takes a `parts: HighlightPart[]` input and renders the `@for`/`@if` block once. This eliminates the 3x copy-paste and makes the highlight rendering testable independently.

6. **[Minor] Remove `as unknown as` cast in spec** (dashboard.spec.ts:123-124). Replace the "should return empty parts arrays when flag text is empty" test with a DOM-based assertion. After setting query to `''`, verify that the table cells contain full flag text without `<mark>` elements, rather than casting to access protected members.

7. **[Suggestion] Add semantic landmarks to stats section** (dashboard.html:10-15). Wrap `stats-grid` in `<section aria-label="Statistics overview">` for improved accessibility.

8. **[Suggestion] Use BEM classes instead of bare tag selectors** (dashboard.scss:8,44). Replace `h1`/`h2`/`p` selectors with explicit BEM classes. Note: this is a project-wide convention, so a systematic refactor across all features would be more appropriate than a one-off change here.
