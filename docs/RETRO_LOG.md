# Session Retrospective Log

---

## Session Retro — 2026-02-17T12:00:00Z

### Trigger
Manual — user requested "run a session retro" after completing the review remediation effort.

### Session Summary
Systematic remediation of 201 review issues from `reviews/full-review-summary-2026-02-13.md` across 3 sessions (38 commits total). This final session produced 11 commits covering 9 of 11 remaining issue groups. Work included BEM flattening, bare element selector replacement, `:host { display: block }` enforcement, dead code removal, utility extraction, async fix, `protected` access removal, type error resolution, and typecheck script hardening. Net result: -186 lines across 118 files, 1258 tests passing at 100% coverage.

### Commits Reviewed (this session: 10 commits)
- `fbab926` fix(flags): await store.updateFlagDetails() in saveDetails()
- `9eb4d3c` refactor: extract getInputValue() utility to replace 14 inline event casts
- `b419616` refactor: extract capitalize() to shared string.utils
- `c87cf1f` refactor: remove 20 dead testing helper exports
- `e9a0d04` fix(styles): add :host { display: block } to 19 component SCSS files
- `4f697f8` refactor(styles): flatten BEM &__ nesting to top-level selectors in 7 SCSS files
- `be5ab80` fix: remove protected from 69 test-accessed component members
- `95efb39` fix: resolve 48 remaining tsc --build type errors in spec files
- `5f9dbac` fix: update typecheck script to use tsc --build for full project checking
- `3fb7887` refactor(styles): replace 29 bare element selectors with BEM classes

### Patterns Identified

| Pattern | Classification | Action Taken |
|---------|---------------|--------------|
| `tsc --build` required for project references | New Pattern (infrastructure) | Updated code-review angular.md checklist |
| No `protected` on test-accessed members | Anti-Pattern discovery | Updated angular-component skill + code-review angular.md |
| No bare element selectors in component SCSS | Pattern Refinement | Updated angular-component skill + code-review angular.md |
| `:host { display: block }` on all components | Pattern Refinement | Updated code-review angular.md |
| `getInputValue()` centralized event casting | Pattern Refinement | Logged — extends existing form.utils pattern |
| `capitalize()` shared string utility | One-off extraction | Logged |
| Dead testing helper detection post-migration | Observation | Logged — queued for potential automation |
| Batch SCSS refactoring via subagents | Workflow pattern | Logged |

### Skills Created
- None (no patterns scored 3+/4 for new skill creation)

### Skills Updated
- **angular-component**: Removed `protected` from template examples; added bare element selector rule; added `:host { display: block }` rule
- **code-review/references/angular.md**: Added 4 new checklist items: bare element selectors, `:host { display: block }`, `tsc --build --noEmit`, no `protected` on test-accessed members

### Agent Tools Created
- None

### Queued for Continuous Learning
- **Dead export detection** — After major migrations (e.g., @watt/ui), testing helpers accumulate orphaned exports. The manual process (grep each export, check for external usages) was done twice across sessions. Could become a slash command or script if the pattern recurs. Not mature enough yet (only 2 occurrences).

### Observations
1. **`tsc --noEmit` vs `tsc --build --noEmit` is a critical infrastructure gap.** Without `--build`, project references (like `tsconfig.spec.json`) aren't validated. This caused 276 type errors to be completely invisible — they'd accumulate silently until someone ran the correct command. The fix was a 1-line change to `package.json` but the impact was massive.

2. **Angular's `protected` convention conflicts with Jest testing.** Angular docs recommend `protected` for template-only members, but Jest tests (which aren't templates) can't access `protected` members without `as unknown` casts. The project resolved this by dropping `protected` entirely for test-accessed members, preferring clean test code over strict encapsulation.

3. **The weekly review → remediation workflow is effective.** The `weekly-review` skill produced a structured issue list, which was then systematically worked through across 3 sessions with each fix as a separate commit. This "review → triage → batch fix" cycle is a repeatable process.

4. **Subagents excel at batch SCSS operations.** Operations like "add `:host { display: block }` to 19 files" or "flatten BEM nesting in 7 files" are ideal for parallel subagent execution — each file is independent and the transformation is mechanical.

---

## Session Retro — 2026-02-18T15:00:00Z

### Trigger
Manual — user requested "run retro" after completing v1.0.0 releases for both web and API projects.

### Session Summary
Infrastructure and release engineering session spanning two conversations (with context compaction). Fixed production build issues (@watt/ui bundle contamination, proxy configuration, CI environment file), added semantic Docker image tagging across both projects, created release scripts for automated version bumps + changelog generation, and cut v1.0.0 releases for both feature-flags-web and feature-flags-api. Total: 7 web commits + 4 API commits = 11 commits across 2 repos, +558 lines.

### Commits Reviewed

**feature-flags-web (7 commits):**
- `b6b29ce` fix(build): strip leaked test helpers from @watt/ui production bundle
- `b235ddd` fix(proxy): use environment-aware API proxy target
- `21d9a20` fix(ci): track environment.prod.ts so production builds succeed in CI
- `4331126` feat(ci): add semantic version tagging and registry helper script
- `ac28ef3` feat: add release script for version bumps and changelog generation
- `30f325f` fix: use conventional-changelog-cli package in release script
- `47bc056` chore(release): v1.0.0

**feature-flags-api (4 commits):**
- `96eddf7` feat(ci): align Docker image tagging strategy with web project
- `0175b7f` feat: add release script for version bumps and changelog generation
- `06de83a` fix: use conventional-changelog-cli package in release script
- `02de538` chore(release): v1.0.0

### Patterns Identified

| Pattern | Classification | Action Taken |
|---------|---------------|--------------|
| Semantic Docker image tagging (sha + version) | Pattern Refinement | Updated gitlab-ci + docker-security skills |
| Postinstall bundle patching (patch-watt-ui.cjs) | One-off workaround | Logged — specific to @watt/ui bug |
| Environment-aware proxy (DEVCONTAINER env var) | Infrastructure | Logged — devcontainer-specific |
| Release script (version bump + changelog + tag) | New Pattern (cross-project) | Queued for continuous-learning |
| `conventional-changelog-cli` not `conventional-changelog` | Anti-Pattern | Logged |
| Force push rejected → reset + new commit | Anti-Pattern | Logged |
| Pre-existing tag conflict during release | Anti-Pattern | Logged |
| `"type": "module"` requires `.cjs` for CommonJS scripts | Anti-Pattern | Logged |
| `environment.prod.ts` must be tracked (no secrets) | One-off Fix | Logged |

### Skills Created
- None (no patterns scored 3+/4 for new skill creation)

### Skills Updated
- **gitlab-ci**: Updated Docker Build section with semantic version tagging pattern (dynamic `$DESTINATIONS` based on `$CI_COMMIT_TAG` vs `$CI_COMMIT_BRANCH`). Added verification checklist item.
- **docker-security**: Updated Kaniko section to reference semantic tagging pattern from gitlab-ci skill.

### Agent Tools Created
- None

### Queued for Continuous Learning
- **Release script workflow** — Identical pattern used in 3 projects (watt-ui, feature-flags-web, feature-flags-api). Mature enough for template extraction but better suited as a Copier template variable than a standalone skill. The next `continuous-learning` run should add it to `TEMPLATE_MANIFEST.md`.

### Observations
1. **`conventional-changelog-cli` bundles presets; `conventional-changelog` does not.** The base `conventional-changelog` npm package doesn't include the Angular preset. The CLI wrapper (`conventional-changelog-cli`) does. This caused a runtime error that was only caught after committing — the release script passed lint but failed on execution.

2. **Protected branches prevent amend+force-push.** When a commit fix was needed after pushing to a protected branch, `git commit --amend && git push --force` was rejected. The resolution was `git reset --hard origin/master` followed by a new commit. This is the correct workflow for protected branches but easy to forget in the moment.

3. **Pre-existing tags can conflict with release scripts.** The API had a `v1.0.0` tag from an earlier pipeline run that pointed at a non-release commit. The release script failed at `git tag v1.0.0` because the tag already existed. Resolution: `git tag -d v1.0.0 && git push origin :refs/tags/v1.0.0` to delete both local and remote, then re-tag.

4. **ESM `"type": "module"` affects all `.js` files.** When `package.json` has `"type": "module"`, Node.js treats all `.js` files as ESM modules. The postinstall script using `require()` had to be renamed to `.cjs` to use CommonJS. This is easy to overlook when adding utility scripts to ESM projects.

5. **Both projects are now at v1.0.0.** This is a milestone — the feature flag system (web + API) has a formal release with semantic versioning, automated changelog generation, and CI pipelines that produce properly tagged Docker images.
