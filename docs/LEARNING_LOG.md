# Continuous Learning Log

This file tracks every Continuous Learning Analysis run against this project.
Each entry captures what was analyzed, what changed, and what was recommended.
Entries are append-only — never overwrite or remove previous entries.

---

## Run: 2026-02-17 12:00

**Trigger:** Post-feature: Weekly review remediation (38 commits across 3 sessions clearing 201 review issues)

### Changes Made
- CLAUDE.md: Updated — 12 sections modified:
  - Fixed CrudApi comment: `GET/POST/PUT/DELETE` → `GET/POST/PATCH/DELETE`
  - Added `string.utils` to project structure utils listing
  - Fixed `@watt/ui` import comment (removed incorrect subpath)
  - Removed `protected` from component example code
  - Corrected specialized stores list (FlagStore DOES extend BaseCrudStore)
  - Added `getInputValue()` and `string.utils.ts` to utility docs
  - Added BEM rules (no `&__`, no bare selectors) and `:host { display: block }` mandate
  - Changed "Angular Testing Library" → "TestBed" (accurate description)
  - Updated testing helpers inventory (removed deleted mock.factories, added detail-component.helpers)
  - Fixed typecheck command: `tsc --noEmit` → `tsc --build --noEmit`
  - Added 6 new DO NOT items
  - Added Skills Reference + Last Analysis footer
- Skills: Updated 2 skills
  - `angular-component` — removed `protected` from examples, added bare selector + `:host` rules
  - `code-review/references/angular.md` — added 4 checklist items (bare selectors, `:host`, `tsc --build`, no `protected` on test members)
- Template Manifest: No changes (still accurate)

### Patterns Extracted
- **67 CSS custom properties** in `_variables.scss` across 12 categories (bg, text, border, accent, status, radius, spacing, typography, shadows, transitions, sizing, status-badge)
- **11 stores** — 5 extend `BaseCrudStore<T>`, 5 standalone, 1 abstract base
- **Store signal convention** — `_foo` (private writable) → `foo` (public readonly via `.asReadonly()`) → `computed()` for derived
- **7 immutable update patterns** — append, prepend, map-replace, filter-remove, spread-merge, deep-merge, conditional-map
- **Pure utility architecture** — 10/10 logic-containing utility files have co-located spec files; 7 higher-order filter functions in `filter.utils.ts`
- **Functional guards** — `authGuard` (async, redirects to Keycloak) + `roleGuard` (sync, returns UrlTree)
- **TimeProvider injection pattern** — pure utility functions accept injectable `TimeProvider` for testable timestamps
- **Store interface ISP hierarchy** — `ReadableStore`, `CreatableStore`, `DeletableStore`, `UpdatableStore`, `CrudStore` (composite)

### Gaps Identified
1. **6 undefined CSS custom properties** — `var(--success)`, `var(--error)`, `var(--primary-border)`, `var(--primary-focus)`, `var(--border-radius-sm)`, `var(--text-tertiary)` used across 5 component SCSS files but never defined in `_variables.scss`. These silently fall back to browser defaults.
2. **Spacing/typography token underutilization** — tokens like `--space-4`, `--text-sm` are defined but most components use raw `rem` values instead, reducing the design system's value.
3. **Legacy radius token aliases** — `--border-radius` vs `--radius-md` inconsistency. Some components use legacy names, some use modern.
4. **Nested BEM selectors in 5 files** — `.parent .parent__child` nesting creates unnecessary specificity. Should be flat `.parent__child`.
5. **`getSectionLabel` hardcoded switch** — could be a `Record<string, string>` map shared with `nav.config.ts`.
6. **`JsonValidationResult` weak typing** — uses optional fields instead of discriminated union (compare with stronger `ExtractValueResult` pattern).

### Recommendations
1. **Fix undefined CSS tokens** — Replace `--success` → `--color-success`, `--error` → `--color-error`, `--primary-border` → `--accent-primary`, `--border-radius-sm` → `--radius-sm`, `--text-tertiary` → `--text-muted` across 5 component SCSS files.
2. **Standardize radius tokens** — Remove legacy `--border-radius` / `--border-radius-lg` aliases, migrate all usages to `--radius-sm` / `--radius-md` / `--radius-lg`.
3. **Adopt spacing tokens** — Replace hardcoded `gap: 1.5rem` with `var(--space-6)` etc. across all component SCSS files.
4. **Flatten remaining nested BEM** — 5 files still nest `.block__element` inside `.block` parent selectors (dashboard, segment-detail, api-keys-tab, flag-list).

### Metrics
- Files analyzed: 219 (95 production TS, 66 spec TS, 24 SCSS, 24 HTML, 10+ config)
- Test coverage: 100% (1258 tests — 1939 statements, 501 branches, 484 functions, 1748 lines)
- Patterns extracted: 25+ (store, component, SCSS, utility, auth, testing, CI/CD)
- Skills created: 0 | Skills updated: 2 (angular-component, code-review/angular.md)
- Anti-patterns flagged: 6 (undefined tokens, legacy aliases, nested BEM, weak typing, hardcoded values, unused parameter)
