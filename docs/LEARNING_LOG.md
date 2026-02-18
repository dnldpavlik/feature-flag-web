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

---

## Run: 2026-02-18 17:30

**Trigger:** Post-feature: v1.0.0 release (web + API), semantic Docker tagging, release scripts, CI fixes

### Changes Made
- CLAUDE.md: Updated — 5 sections modified:
  - Fixed `environment.prod.ts` description: "gitignored" → "tracked in git" (was fixed in commit `21d9a20`)
  - Updated CI/CD Docker tagging: "commit SHA + latest" → semantic version tagging (sha on branch, semver on tag)
  - Added new **Scripts** section documenting `release.js`, `registry-tags.sh`, `patch-watt-ui.cjs`
  - Added proxy config documentation (`proxy.conf.mjs` — environment-aware)
  - Added release/versioning info to Git Workflow section (v1.0.0, release script usage)
  - Updated Last Analysis footer (date, version, metrics)
- Skills: Updated 2 skills (via session retro earlier this session)
  - `gitlab-ci` — added semantic Docker image tagging pattern with dynamic `$DESTINATIONS`
  - `docker-security` — updated Kaniko section to reference semantic tagging
- Template Manifest: Updated — 3 changes:
  - Fixed `proxy.conf.json` → `proxy.conf.mjs` in project-specific files
  - Added `scripts/release.js` as template candidate (Infrastructure section)
  - Added `scripts/registry-tags.sh` and `scripts/patch-watt-ui.cjs` as project-specific
  - Updated UI Component Library section to reflect @watt/ui migration (external package, not local files)

### Patterns Extracted
- **Semantic Docker image tagging** — Branch push → `sha-<8char>` + `latest`; version tag (`v*`) → `<semver>` (v prefix stripped) + `latest`. Consistent across web + API projects.
- **Release script workflow** — `node scripts/release.js <version> [--push]` bumps package.json, generates changelog via `conventional-changelog-cli`, commits, tags. Used in 3 projects (watt-ui, web, API).
- **Environment-aware proxy** — `proxy.conf.mjs` checks `DEVCONTAINER` env var to switch between `localhost` and `host.docker.internal`.
- **Postinstall bundle patching** — `patch-watt-ui.cjs` strips leaked test helpers from @watt/ui production bundle to prevent build warnings.
- **environment.prod.ts tracking** — Tracked in git (no secrets) so CI production builds succeed without file generation.

### Gaps Identified
1. **Same 6 gaps from 2026-02-17 run remain open** — undefined CSS tokens, spacing token underutilization, legacy radius aliases, nested BEM in 5 files, hardcoded switch in `getSectionLabel`, weak `JsonValidationResult` typing. None were addressed in this release-focused session.
2. **No CHANGELOG.md in git** — `release.js` generates it but it's not committed yet (the v1.0.0 release committed it, but future releases need to ensure it stays tracked).

### Recommendations
1. **Address CSS token gaps from previous run** — The 6 undefined CSS custom properties and spacing token underutilization should be fixed in a dedicated session.
2. **Consider extracting release script as Copier template** — The identical pattern across 3 projects is mature enough for template extraction. Better as a template variable than a standalone skill since it produces a file, not behavioral guidance.
3. **Automate @watt/ui patch removal** — The `patch-watt-ui.cjs` workaround should be removed once the @watt/ui library is fixed upstream to not leak test helpers.

### Metrics
- Files analyzed: 220+ (via 3 parallel subagents covering structure/config, source patterns, test/styling)
- Test coverage: 100% (1242 tests)
- Patterns extracted: 5 new (semantic tagging, release script, env-aware proxy, postinstall patch, env.prod tracking)
- Skills created: 0 | Skills updated: 2 (gitlab-ci, docker-security — via session retro)
- Anti-patterns flagged: 0 new (6 carried forward from previous run)
