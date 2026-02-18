# Template Manifest - Angular 21 Project Scaffold

## Purpose

Documents which files are **reusable boilerplate** (can be templated for new projects) vs **project-specific** (unique to this application). Designed for Copier/Cookiecutter scaffolding.

## Template Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `project_name` | Human-readable project name | `Feature Flag UI` |
| `project_slug` | Kebab-case slug for packages | `feature-flags-web` |
| `project_description` | One-line description | `Web UI for feature flag management` |
| `angular_prefix` | Component selector prefix | `app` |
| `api_base_url` | Backend API base URL | `/api/v1` |
| `keycloak_url` | Keycloak server URL | `http://localhost:8080` |
| `keycloak_realm` | Keycloak realm name | `homelab` |
| `keycloak_client_id` | Keycloak client ID | `feature-flags-ui` |
| `default_port` | Dev server port | `4200` |
| `prod_port` | Production nginx port | `80` |
| `node_version_ci` | Node version for CI | `22` |
| `node_version_dev` | Node version for devcontainer | `20.19.0` |
| `nginx_version` | Nginx Alpine version | `1.27` |
| `registry_image` | Docker registry path | `registry.example.com/project` |
| `git_default_branch` | Main branch name | `master` |

## Reusable Boilerplate (Template Candidates)

### Configuration Files (High Reuse)

| File | Templatable | Notes |
|------|-------------|-------|
| `.editorconfig` | As-is | Universal editor settings |
| `.prettierrc` | As-is | 100-char, single quotes, trailing commas |
| `.stylelintrc.json` | As-is | SCSS standard config |
| `.eslintrc.json` | As-is | Angular + TypeScript + Prettier |
| `jest.config.js` | Template `{{ project_slug }}` | Coverage thresholds, path aliases |
| `tsconfig.json` | As-is | Strict TypeScript config |
| `tsconfig.app.json` | As-is | App-specific TS config |
| `tsconfig.spec.json` | As-is | Test-specific TS config |
| `setup-jest.ts` | As-is | Jest environment setup + browser mocks |
| `.gitignore` | As-is | Comprehensive ignore rules |

### Infrastructure (High Reuse)

| File | Templatable | Notes |
|------|-------------|-------|
| `docker/Dockerfile` | Template `{{ project_slug }}`, `{{ nginx_version }}` | Production nginx config |
| `docker/docker-compose.yml` | Template `{{ project_slug }}`, `{{ prod_port }}` | Production compose |
| `docker/nginx.conf` | Template `{{ api_base_url }}` in CSP connect-src | Security-hardened nginx |
| `.devcontainer/Dockerfile` | Template `{{ node_version_dev }}` | Dev container image |
| `.devcontainer/devcontainer.json` | Template `{{ project_name }}`, `{{ default_port }}` | VS Code devcontainer |
| `.devcontainer/docker-compose.yml` | Template | Dev compose |
| `.gitlab-ci.yml` | Template `{{ node_version_ci }}`, `{{ git_default_branch }}` | Full CI pipeline |
| `.snyk` | As-is | Snyk config |
| `.husky/pre-commit` | As-is | Lint-staged + typecheck |
| `.husky/pre-push` | As-is | Coverage + smoke tests |
| `scripts/release.js` | Template `{{ project_slug }}` | Version bump + changelog + git tag |

### Core Application Scaffold (High Reuse)

| File/Directory | Templatable | Notes |
|----------------|-------------|-------|
| `src/app/core/api/crud.api.ts` | As-is | Generic CRUD base class |
| `src/app/core/api/api.tokens.ts` | As-is | API_BASE_URL token |
| `src/app/core/api/api-error.model.ts` | As-is | Error types |
| `src/app/core/api/error.interceptor.ts` | As-is | Error interceptor |
| `src/app/core/auth/auth.service.ts` | Template `{{ keycloak_client_id }}` | Keycloak AuthService with signals |
| `src/app/core/auth/auth.guard.ts` | As-is | Functional CanActivateFn |
| `src/app/core/auth/role.guard.ts` | Template `{{ keycloak_client_id }}` | Role-based CanActivateFn |
| `src/app/core/auth/auth.models.ts` | As-is | UserProfile, AUTH_ROLES constants |
| `src/app/core/theme/theme.service.ts` | As-is | Dark/light theme service |
| `src/app/core/time/time.service.ts` | As-is | Testable time abstraction |
| `src/app/shared/store/base-crud.store.ts` | As-is | Generic CRUD store |
| `src/app/shared/store/store.interfaces.ts` | As-is | Store contracts |
| `src/app/shared/store/search.store.ts` | As-is | Global search state |
| `src/app/shared/utils/filter.utils.ts` | As-is | Composable filter functions |
| `src/app/shared/utils/search.utils.ts` | As-is | Search + highlight |
| `src/app/shared/utils/form.utils.ts` | As-is | Form validation helpers |
| `src/app/shared/utils/id.utils.ts` | As-is | ID generation |

### UI Component Library (@watt/ui — External Package)

22 shared UI components have been extracted to `@watt/ui` npm package (private GitLab registry, project ID 7). This package is **fully reusable** across Angular projects via `npm install @watt/ui`.

| Aspect | Details |
|--------|---------|
| Package | `@watt/ui@0.0.1` |
| Registry | GitLab project-level npm registry |
| Auth | `.npmrc` with `GITLAB_TOKEN` env var |
| Import | Flat: `import { ButtonComponent } from '@watt/ui'` (no subpaths) |
| Components | 22 total (button, card, badge, data-table, form-field, toggle, toast, etc.) |
| Selectors | `ui-*` prefix |

**Local-only components** (not in @watt/ui):
- `shared/ui/logo-icon/` — App-specific branding SVG
- `shared/ui/flags-empty-icon/` — App-specific empty state SVG

### Testing Utilities (High Reuse)

| File | Reusable | Notes |
|------|----------|-------|
| `src/app/testing/store.helpers.ts` | Yes | Generic store test helpers |
| `src/app/testing/component.helpers.ts` | Yes | Generic component helpers |
| `src/app/testing/dom.helpers.ts` | Yes | DOM query helpers |
| `src/app/testing/mock.factories.ts` | Partial | Entity factories need customization |
| `src/app/testing/mock-api.providers.ts` | Partial | API mocks need customization |
| `e2e/pages/base.page.ts` | Yes | Base page object |
| `e2e/pages/base-crud-list.page.ts` | Yes | CRUD list page object |
| `e2e/helpers/toggle.helper.ts` | Yes | Toggle interaction helper |
| `e2e/helpers/wait.helper.ts` | Yes | Wait/sync helper |
| `e2e/helpers/navigation.helper.ts` | Yes | Navigation helper |
| `e2e/fixtures/base.fixture.ts` | Partial | Fixture setup |
| `e2e/auth/auth.setup.ts` | Template `{{ keycloak_realm }}` | Keycloak login setup for E2E |

### Styles (High Reuse)

| File | Reusable | Notes |
|------|----------|-------|
| `src/styles/_variables.scss` | Partial | Color palette is brand-specific |
| `src/styles/_mixins.scss` | Yes | auto-grid, form-label |
| `src/styles.scss` | Partial | Reset + typography reusable, utility classes customizable |

## Project-Specific Files (NOT Templatable)

| File/Directory | Why Specific |
|----------------|-------------|
| `src/app/features/flags/` | Domain-specific flag management |
| `src/app/features/environments/` | Domain-specific environment management |
| `src/app/features/projects/` | Domain-specific project management |
| `src/app/features/segments/` | Domain-specific segment rules |
| `src/app/features/audit/` | Domain-specific audit logging |
| `src/app/features/settings/` | App-specific user settings |
| `src/app/features/dashboard/` | App-specific dashboard stats |
| `src/app/layout/nav.config.ts` | App-specific navigation items |
| `src/app/app.routes.ts` | App-specific route definitions |
| `src/environments/environment.ts` | App-specific API + Keycloak config |
| `proxy.conf.mjs` | App-specific backend proxy (environment-aware) |
| `scripts/registry-tags.sh` | App-specific registry helper (uses GitLab project ID) |
| `scripts/patch-watt-ui.cjs` | @watt/ui-specific postinstall workaround |
| `docs/` | Project documentation |
| `designs/` | UI/UX design artifacts |
| `shared/ui/logo-icon/` | Brand-specific logo |
| `shared/ui/flags-empty-icon/` | Feature-specific icon |

## Scaffold Generation Order

1. **Config files** - `.editorconfig`, `.prettierrc`, `.eslintrc.json`, `tsconfig.*`, `jest.config.js`
2. **Infrastructure** - Docker, CI/CD, git hooks, devcontainer
3. **Core services** - API layer, error handling, theme, time
4. **Authentication** - Keycloak setup (auth.service, auth.guard, role.guard, auth.models)
5. **Shared store** - BaseCrudStore, interfaces, SearchStore
6. **UI library** - All shared components
7. **Testing utilities** - Helpers, factories, mock Keycloak providers, page objects
8. **Styles** - Variables, mixins, global styles
9. **App shell** - Layout (header, sidebar), root component, routes with guards
10. **E2E auth setup** - Keycloak login setup, storageState pattern
11. **First feature** - Scaffold one complete feature as example

## Estimated Reuse

- **Configuration:** ~95% reusable across Angular projects
- **Infrastructure:** ~90% reusable (template variables for names/ports)
- **Core services:** ~85% reusable (API patterns, theme, time)
- **UI library:** ~80% reusable (colors/icons need customization)
- **Testing utilities:** ~75% reusable (mock factories need entity customization)
- **Feature modules:** ~0% reusable (domain-specific)
