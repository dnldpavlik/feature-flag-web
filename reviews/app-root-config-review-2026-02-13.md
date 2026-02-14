# Module Review: App Root + Config/Infrastructure -- 2026-02-13

## Module Summary
- **Path:** `src/app/` (root component), project root (config/infra files)
- **Purpose:** Application shell (sidebar + header + router-outlet layout), Angular app bootstrap configuration, route definitions, build/test/lint/CI/Docker infrastructure
- **File Count:** 7 production files (`app.ts`, `app.html`, `app.scss`, `app.config.ts`, `app.routes.ts`, `environment.ts`, `environment.prod.ts`), 2 test files (`app.spec.ts`, `app.config.spec.ts`), 14 config files (`angular.json`, `tsconfig*.json` x3, `jest.config.js`, `setup-jest.ts`, `.eslintrc.json`, `eslint.config.js`, `.stylelintrc.json`, `package.json`, `proxy.conf.json`, `Dockerfile`, `nginx.conf`, `docker-compose.yml`, `.gitlab-ci.yml`)
- **Test Coverage:** 2/2 testable production files have specs (`app.spec.ts`, `app.config.spec.ts`); `app.routes.ts` excluded from coverage per jest config

## Issues Found

### ESLint Configuration Conflict
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `.eslintrc.json` + `eslint.config.js` | All | Two ESLint config files exist simultaneously. `.eslintrc.json` (legacy format) and `eslint.config.js` (flat config format) both exist. ESLint 9.x uses flat config by default and may ignore the legacy file, but this creates confusion about which config is active and risks rule drift between them. The flat config is missing several rules present in the legacy config (`no-explicit-any`, `prefer-const`, `eqeqeq`, `curly`, `no-console`, `no-duplicate-imports`, `explicit-function-return-type`, `prefer-readonly`, spec file overrides). | **Major** |

### TypeScript Configuration
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `tsconfig.spec.json` | 9 | `types: ["jasmine"]` is configured but the project uses Jest (not Jasmine/Karma). This could cause misleading type hints in spec files (e.g., Jasmine's `expect` vs Jest's `expect`). Should be `types: ["jest"]`. | **Major** |
| `tsconfig.json` | 14 | `experimentalDecorators: true` is set but Angular 21 with `@angular/build:application` builder does not require this flag. Angular has fully adopted TC39 decorators. This flag is harmless but misleading and could mask issues if TC39 behavior diverges from experimental behavior. | **Minor** |
| `tsconfig.json` | 32-36 | `references` array only includes `tsconfig.app.json` but not `tsconfig.spec.json`. This is inconsistent -- either use project references for both or neither. | **Minor** |

### Angular Configuration
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `angular.json` | 11 | `skipTests: true` for component schematics. While Jest is used instead of Karma, this means `ng generate` will not create spec files. The CLAUDE.md mandates strict TDD, so generated files will always need manually created specs. Consider a custom schematic or document this in onboarding. | **Minor** |
| `angular.json` | 105-129 | Karma test config (`@angular/build:karma`) is defined but the project uses Jest. This dead config is never used and adds confusion. | **Minor** |
| `angular.json` | 64-76 | Production config lacks `fileReplacements` to swap `environment.ts` for `environment.prod.ts`. The production build will use the development environment file with `production: false` and `localhost:8080` Keycloak URL. This is a significant oversight for production deployments. | **Major** |

### Playwright Version Mismatch (CI)
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `.gitlab-ci.yml` | 292 | E2E base image uses `playwright:v1.50.0-jammy` but `package.json` has `@playwright/test: ^1.58.0`. The Playwright Docker image is 8 minor versions behind the npm package. Playwright requires exact version match between the npm package and the browser binaries. This will cause test failures in CI when the npm-installed version doesn't match the pre-installed browsers. | **Blocker** |

### Docker / Nginx
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `docker/nginx.conf` | 42 | CSP `connect-src 'self'` will block Keycloak OIDC requests. In production, the Keycloak server is typically on a different origin. The CSP needs to whitelist the Keycloak URL (e.g., `connect-src 'self' https://auth.example.com`). The TODO comment acknowledges this but it remains unresolved. | **Major** |
| `docker/nginx.conf` | 88-96 | Static asset caching location block re-adds only 2 of the 7 security headers from the server block. Missing: `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`. Nginx's `add_header` in a location block replaces (not appends to) the parent block's headers. | **Major** |
| `docker/Dockerfile` | 23 | Creates user `nginx-app` in group `nginx-app`, but the default nginx Alpine image already has an `nginx` user/group. Having two separate user identities could cause permission issues if nginx worker processes run as `nginx` while static files are owned by `nginx-app`. However, since the `USER nginx-app` directive is set and nginx master process runs as `nginx-app`, this works but is unconventional. | **Minor** |
| `docker/Dockerfile` | 36-37 | Container exposes port 80 and runs as non-root. Port 80 is a privileged port (<1024) on Linux. This works on Alpine nginx because the master process binds to the port before switching users, but it's better practice to use a non-privileged port (e.g., 8080) for non-root containers. | **Suggestion** |

### App Component
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `src/app/app.ts` | 98-107 | `initializeStores()` is called in the constructor as a fire-and-forget `void` promise. If any store load fails, the error is silently swallowed (depending on store implementation). There is no user-visible error state or retry mechanism at the app shell level. | **Minor** |
| `src/app/app.ts` | 103-106 | The `effect()` that clears search on navigation will also fire on initial load (the effect runs once immediately). This is functionally harmless since the search starts empty, but it is a side effect worth noting. | **Suggestion** |
| `src/app/app.scss` | 33-46 | Responsive styles reference `.sidebar` and `.sidebar--open` classes, but the sidebar is rendered by `<app-sidebar>` child component. These styles in `app.scss` will not penetrate the child component's encapsulation (OnPush + emulated ViewEncapsulation). The responsive sidebar behavior must be handled inside the sidebar component itself. | **Major** |

### App Config Test Quality
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `src/app/app.config.spec.ts` | 38-53 | Tests for "routing configuration" and "zone configuration" are effectively no-ops -- they only assert `providers.length >= 1`, which is already proven by the earlier test. These tests don't verify that the specific providers are present or correctly configured. | **Minor** |

### Environment Configuration
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `src/environments/environment.prod.ts` | 7-8 | Production environment has hardcoded `localhost:8080` Keycloak URL with `http://` scheme. While gitignored, this default template means forgetting to update it before building would result in a broken production deployment. Should use a placeholder that clearly fails (e.g., `https://KEYCLOAK_URL_NOT_SET`). | **Minor** |

### CI/CD Pipeline
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `.gitlab-ci.yml` | 38 | `CI_JOB_TOKEN` is echoed into `.npmrc` as plaintext in the script. While `CI_JOB_TOKEN` is a GitLab-provided ephemeral token, the command will appear in CI logs. Consider using `--quiet` or redirecting output. | **Minor** |
| `.gitlab-ci.yml` | 296 | E2E base template also echoes the token into `.npmrc` (same issue as install stage). | **Minor** |
| `.gitlab-ci.yml` | 367-369 | Cross-browser e2e `before_script` runs `npm ci` but does NOT write the `CI_JOB_TOKEN` to `.npmrc` first (unlike the `.e2e_base` template it extends). This `before_script` overrides the parent's `before_script` entirely. The `@watt/ui` private package install will fail without the token. | **Major** |

### Stylelint Configuration
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `.stylelintrc.json` | 4 | `selector-class-pattern: null` disables class naming validation. Given the project mandates BEM naming, this rule should enforce a BEM pattern (e.g., `^[a-z]([a-z0-9-]+)?(__[a-z0-9]([a-z0-9-]+)?)?(--[a-z0-9]([a-z0-9-]+)?)?$`). | **Suggestion** |

### Global Styles
| File | Line(s) | Issue | Severity |
|------|---------|-------|----------|
| `src/styles.scss` | 133-184 | Global `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost` classes are defined, but the project uses `@watt/ui`'s `<ui-button>` component with variants. These global button styles may conflict with or be redundant to the `@watt/ui` button component styles. | **Minor** |
| `src/styles.scss` | 213-257 | Global `.toggle` styles are defined, but the project uses `@watt/ui`'s `<ui-toggle>` component. Same potential redundancy/conflict as buttons. | **Minor** |

## What's Done Well

- **Route architecture is solid.** All feature routes use lazy loading via `loadChildren()`. Auth guards are correctly applied: `authGuard` on every route, `roleGuard` + `data: { role: 'admin' }` on `environments` and `settings`. Wildcard route redirects to dashboard.
- **Keycloak configuration is comprehensive.** `provideKeycloak()` with `login-required`, `withAutoRefreshToken` for session management, `includeBearerTokenInterceptor` scoped to `/api/` paths via regex pattern, and `errorInterceptor` for centralized error handling.
- **Jest configuration is well-structured.** 100% coverage thresholds enforced across all metrics. Module name mappers align with tsconfig path aliases. `transformIgnorePatterns` correctly allowlists Angular, keycloak, and `@watt/ui` packages. Coverage exclusions are sensible (environments, testing utilities, mocks, routes, barrel files).
- **Docker security is strong.** Non-root user (UID 1001), read-only filesystem, `no-new-privileges`, resource limits (0.5 CPU, 128M), health checks, nginx `server_tokens off`, comprehensive security headers (X-Frame-Options, X-Content-Type-Options, XSS-Protection, Referrer-Policy, Permissions-Policy, CSP), DoS protections (1k body limit, tight timeouts), hidden file blocking, backup file blocking, source map blocking.
- **Design token system is thorough.** Complete light and dark theme via CSS custom properties. Covers backgrounds (10 tokens), text (5), borders (4), accents (4), status colors (6), status badge backgrounds (4 for each naming convention), radii (4), typography scale (7), spacing scale (7), shadows (3), transitions (2). Dark theme overrides all tokens including deeper shadows.
- **App component test coverage is thorough.** 351 lines of tests covering initialization, layout rendering, navigation items, environments signal, breadcrumbs with navigation, sidebar toggle, search clearing on navigation, project store integration, and logout. Tests use `fakeAsync`/`tick` for router navigation testing.
- **CI/CD pipeline has good stage ordering.** Install -> lint (parallel TS+SCSS) -> test -> build -> docker -> security (scheduled) -> e2e (conditional). Proper cache configuration keyed on `package-lock.json`. Kaniko for daemonless Docker builds. Snyk scanning with dependency, code, and IaC scanning plus a summary job.
- **Environment files contain no secrets.** `environment.ts` (dev) is tracked in git with localhost values only. `environment.prod.ts` is gitignored. No API keys, tokens, or passwords in any environment file.
- **Clean separation of concerns in app shell.** `app.ts` handles orchestration (store initialization, computed signals for sidebar data, breadcrumbs, nav items). Template is minimal with clear component composition. SCSS is scoped to layout concerns only.

## Recommended Fixes (Priority Order)

1. **[Blocker] Update Playwright Docker image version in `.gitlab-ci.yml`** -- Change `mcr.microsoft.com/playwright:v1.50.0-jammy` to `mcr.microsoft.com/playwright:v1.58.0-jammy` (or the exact version matching `@playwright/test` in `package.json`). Playwright requires exact version parity between npm package and browser binaries.

2. **[Major] Add `fileReplacements` to `angular.json` production build config** -- Without this, `ng build --configuration production` will use `environment.ts` (dev) instead of `environment.prod.ts`. Add:
   ```json
   "fileReplacements": [{
     "replace": "src/environments/environment.ts",
     "with": "src/environments/environment.prod.ts"
   }]
   ```

3. **[Major] Resolve dual ESLint config conflict** -- Remove `.eslintrc.json` and consolidate all rules into `eslint.config.js` (flat config). Port over missing rules: `no-explicit-any: error`, `no-unused-vars` with ignore patterns, `explicit-function-return-type: warn`, `prefer-readonly: warn`, `no-console: warn`, `prefer-const: error`, `eqeqeq: error`, `curly: error`, `no-duplicate-imports: error`, and the spec file overrides.

4. **[Major] Fix nginx security headers in static asset caching block** -- The `location ~* \.(js|css|...)$` block in `nginx.conf` replaces parent headers. Either re-add all 7 security headers, or use `include` with a shared snippet file for security headers to avoid repetition and ensure consistency.

5. **[Major] Fix cross-browser e2e `before_script` in `.gitlab-ci.yml`** -- The `e2e:cross-browser` job overrides `before_script` without writing `CI_JOB_TOKEN` to `.npmrc`. Add the token line before `npm ci`:
   ```yaml
   before_script:
     - echo "//gitlab.donpavlik.com/api/v4/projects/7/packages/npm/:_authToken=${CI_JOB_TOKEN}" >> .npmrc
     - npm ci
     - npx playwright install --with-deps
   ```

6. **[Major] Fix CSP `connect-src` to include Keycloak origin** -- Update `nginx.conf` CSP header to allow connections to the Keycloak server. This could be templated with an environment variable at container startup using `envsubst`.

7. **[Major] Remove dead `.sidebar` styles from `app.scss`** -- The responsive `.sidebar` / `.sidebar--open` styles at lines 33-46 cannot affect the child `<app-sidebar>` component due to Angular's view encapsulation. Move this responsive logic into the sidebar component itself, or use the sidebar's `[open]` input to control visibility from the parent.

8. **[Major] Fix `tsconfig.spec.json` types from `jasmine` to `jest`** -- Change `"types": ["jasmine"]` to `"types": ["jest"]` to get correct Jest type definitions in test files.

9. **[Minor] Remove dead Karma test config from `angular.json`** -- Delete the `test` architect target (lines 105-129) since the project uses Jest exclusively.

10. **[Minor] Improve `app.config.spec.ts` test assertions** -- Replace the placeholder assertions (`providers.length >= 1`) with meaningful checks that verify specific providers are registered (e.g., check for `API_BASE_URL` token, router provider, Keycloak provider).

11. **[Minor] Clean up redundant global styles** -- Evaluate whether `.btn-*` and `.toggle` global styles in `styles.scss` are still used anywhere, or if they have been fully replaced by `@watt/ui` components. Remove if unused to reduce CSS bundle size and eliminate potential style conflicts.

12. **[Suggestion] Enforce BEM pattern in Stylelint** -- Instead of `selector-class-pattern: null`, set a BEM-compatible regex pattern to enforce the project's naming convention automatically.

13. **[Suggestion] Use non-privileged port in Docker container** -- Change nginx to listen on 8080 instead of 80 for better non-root container practices. Update `docker-compose.yml` port mapping accordingly.
