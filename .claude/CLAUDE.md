# CLAUDE.md - Feature Flag UI (Angular 21)

## Project Overview

Angular 21 web UI for a Feature Flag management system (LaunchDarkly clone). The Rust backend API exposes REST endpoints at `/api/v1`. The UI provides flag CRUD, targeting rules (segments), multi-environment management, projects, audit logging, dashboard, and user settings.

**Tech stack:** Angular 21.1.2 | TypeScript 5.9 | RxJS 7.8 | Jest 30 | Playwright 1.58 | SCSS (BEM) | Nginx 1.27-alpine | @watt/ui (shared component library)

## Core Principles

1. **Strict TDD** - Red-Green-Refactor. No production code without a failing test first.
2. **SOLID** - Single responsibility, open/closed, Liskov, interface segregation, dependency inversion.
3. **Functional Programming** - Pure functions, immutability, composition, higher-order functions.
4. **Signals-First** - Angular Signals for all state management. No NgRx or external state libraries.
5. **Separation of Concerns** - TypeScript (logic), HTML (structure), SCSS (styling).

## Architecture

```
Presentation Layer (Standalone Components, OnPush)
    |
State Layer (Signal-Based Stores: BaseCrudStore<T>)
    |
API Layer (Generic CrudApi<T, C, U> + HttpClient)
    |
Rust Backend (/api/v1 via proxy in dev, nginx in prod)
    |
PostgreSQL
```

### Project Structure

```
src/
├── app/
│   ├── core/                        # Singleton services
│   │   ├── api/                     # HTTP layer: CrudApi<T,C,U>, tokens, interceptors
│   │   │   ├── crud.api.ts          # Generic CRUD base (GET/POST/PUT/DELETE)
│   │   │   ├── api.tokens.ts        # API_BASE_URL injection token
│   │   │   ├── error.interceptor.ts # Global error handling
│   │   │   └── api-error.model.ts   # Error types
│   │   ├── auth/                    # Keycloak authentication (OIDC/PKCE)
│   │   │   ├── auth.service.ts      # AuthService: signals for user, roles, token
│   │   │   ├── auth.guard.ts        # Functional CanActivateFn (redirects to Keycloak login)
│   │   │   ├── role.guard.ts        # Functional CanActivateFn (checks Keycloak client roles)
│   │   │   └── auth.models.ts       # UserProfile interface, AUTH_ROLES constants
│   │   ├── theme/                   # ThemeService (dark/light via data-theme attribute)
│   │   └── time/                    # TimeService + testable TimeProvider interface
│   ├── shared/
│   │   ├── store/                   # BaseCrudStore<T>, ProjectStore, EnvironmentStore, SearchStore
│   │   ├── ui/                      # Local-only components (logo-icon, flags-empty-icon); shared UI from @watt/ui
│   │   └── utils/                   # filter.utils, search.utils, form.utils, id.utils, url.utils
│   ├── testing/                     # Test helpers (store, component, dom, mock factories, mock-api providers)
│   ├── features/
│   │   ├── flags/                   # Flag CRUD, detail, create, value input, flag-specific store
│   │   ├── environments/            # Environment CRUD with color coding
│   │   ├── projects/                # Project CRUD with default project
│   │   ├── segments/                # Segment CRUD + rule builder (rule-row component)
│   │   ├── audit/                   # Audit log display, filtering, AuditLogger service, AuditBadgeComponent
│   │   ├── settings/                # User profile, preferences, API keys, theme tabs
│   │   └── dashboard/               # Stats cards, recent flags, search
│   ├── layout/
│   │   ├── header/                  # Breadcrumbs, search, create button
│   │   ├── sidebar/                 # Navigation, logo, user menu
│   │   └── nav.config.ts            # Declarative nav items config
│   ├── app.ts, app.html, app.scss   # Root component (app shell)
│   ├── app.routes.ts                # Lazy-loaded feature routes
│   └── app.config.ts                # App providers configuration
├── styles/
│   ├── _variables.scss              # CSS custom properties (light + dark theme tokens)
│   └── _mixins.scss                 # auto-grid(), form-label() mixins
├── styles.scss                      # Global reset, typography, base styles, scrollbar
└── environments/
    ├── environment.ts               # Dev config (tracked in git - no secrets)
    └── environment.prod.ts          # Prod config (gitignored)
```

## Component Patterns

### Standard Component

```typescript
@Component({
  selector: 'app-flag-card',
  imports: [RouterLink, BadgeComponent],  // BadgeComponent from '@watt/ui/badge'
  templateUrl: './flag-card.html',
  styleUrl: './flag-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagCardComponent {
  readonly flag = input.required<Flag>();
  readonly toggled = output<boolean>();

  protected readonly isEnabled = computed(() =>
    this.flag().environmentValues[this.envId()]?.enabled ?? false
  );
}
```

**Rules:**
- All components standalone (Angular 21 default - do NOT set `standalone: true` explicitly)
- `ChangeDetectionStrategy.OnPush` on every component
- `input()` / `input.required()` for inputs, `output()` for outputs
- `computed()` for derived state, `signal()` for local state
- `inject()` for DI (never constructor injection)
- Host bindings via `host: {}` property (never `@HostBinding`/`@HostListener`)
- Templates use `@if`, `@for`, `@switch`, `@defer` (never `*ngIf`/`*ngFor`)

### ControlValueAccessor (Form Integration)

```typescript
@Component({
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FormFieldComponent),
    multi: true,
  }],
  host: {
    class: 'form-field',
    '[class.form-field--error]': 'error()',
    '[class.form-field--disabled]': 'isDisabled()',
  },
})
export class FormFieldComponent implements ControlValueAccessor { ... }
```

## Store Patterns

### BaseCrudStore<T> (Abstract)

All CRUD stores extend `BaseCrudStore<T>` from `shared/store/base-crud.store.ts`:

```typescript
// Private writable signals (underscore prefix)
private readonly _items = signal<T[]>([]);
private readonly _loading = signal(false);
private readonly _error = signal<string | null>(null);

// Public readonly selectors
readonly items = this._items.asReadonly();
readonly loading = this._loading.asReadonly();
readonly error = this._error.asReadonly();

// Actions use firstValueFrom() to convert Observable → Promise
async loadAll(): Promise<void> {
  this._loading.set(true);
  try {
    const items = await firstValueFrom(this.api.getAll());
    this._items.set(items);
  } catch (e) { ... }
  finally { this._loading.set(false); }
}
```

**Immutable updates only:**
```typescript
this._items.update(items => [created, ...items]);           // add
this._items.update(items => items.map(i => i.id === u.id ? u : i)); // update
this._items.update(items => items.filter(i => i.id !== id)); // remove
```

**Specialized stores** (FlagStore, AuditStore) don't extend BaseCrudStore due to extra complexity.

### Store Interfaces (`shared/store/store.interfaces.ts`)

```typescript
interface ReadableStore<T> { items: Signal<readonly T[]>; loading: Signal<boolean>; ... }
interface CrudStore<T, C, U> extends ReadableStore<T> { create(input: C): Promise<T>; ... }
```

## API Patterns

### Generic CrudApi<T, C, U>

```typescript
// core/api/crud.api.ts
export abstract class CrudApi<T, C, U> {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = inject(API_BASE_URL);
  protected abstract resourcePath: string;

  protected get resourceUrl(): string {
    return `${this.baseUrl}/${this.resourcePath}`;
  }

  getAll(): Observable<T[]> { return this.http.get<T[]>(this.resourceUrl); }
  getById(id: string): Observable<T> { return this.http.get<T>(`${this.resourceUrl}/${id}`); }
  create(input: C): Observable<T> { return this.http.post<T>(this.resourceUrl, input); }
  update(id: string, input: U): Observable<T> { return this.http.patch<T>(`${this.resourceUrl}/${id}`, input); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.resourceUrl}/${id}`); }
}
```

### Backend Field Mapping (Critical)

The Rust backend uses `resourceName` instead of `name`. FlagApi normalizes this:

```typescript
// RawFlag has resourceName, Flag has name
function normalizeFlag(raw: RawFlag): Flag {
  return { ...raw, name: raw.resourceName };
}

// FlagApi overrides CrudApi methods to pipe through normalizeFlag
override getAll(): Observable<Flag[]> {
  return super.getAll().pipe(map(flags => flags.map(f => normalizeFlag(f as unknown as RawFlag))));
}
```

### Backend PATCH Response Behavior

PATCH `/flags/{id}/environments/{envId}` returns **incomplete** flag data (missing `name`, `environmentValues`). Always merge with existing store data using `mergeFlag()`.

## Authentication (Keycloak OIDC/PKCE)

### Setup (`app.config.ts`)

```typescript
provideKeycloak({
  config: environment.keycloak,       // { url, realm, clientId }
  initOptions: { onLoad: 'login-required' },
  features: [
    withAutoRefreshToken({
      sessionTimeout: 300000,
      onInactivityTimeout: 'logout',
    }),
  ],
}),
provideHttpClient(withInterceptors([includeBearerTokenInterceptor, errorInterceptor])),
{ provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG, useValue: [{ urlPattern: /\/api\//i }] },
```

- `login-required` — immediate redirect to Keycloak on app load
- `includeBearerTokenInterceptor` — auto-attaches Bearer token to `/api/` requests
- `withAutoRefreshToken` — silent token refresh, logout on inactivity

### AuthService (`core/auth/auth.service.ts`)

Wraps `Keycloak` instance with Angular signals. Components depend on `AuthService`, never keycloak-js directly.

```typescript
// Inject Keycloak and event signal from keycloak-angular
private readonly keycloak = inject(Keycloak);
private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

// Reactive signals
readonly isAuthenticated = computed(() => ...);  // Derived from KEYCLOAK_EVENT_SIGNAL
readonly userProfile = computed(() => ...);      // Private _userProfile signal
readonly roles = computed(() => ...);            // Private _roles signal
readonly token = computed(() => this.keycloak.token);

// Convenience methods
hasRole(role: string): boolean;
isAdmin(): boolean;             // hasRole('admin')
login(): Promise<void>;
logout(): Promise<void>;
```

**Effect** watches `KEYCLOAK_EVENT_SIGNAL` for Ready/AuthSuccess events → updates signals → loads user profile.

### Route Guards (Functional)

```typescript
// authGuard — redirects to Keycloak login if not authenticated
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  if (!authService.isAuthenticated()) { await authService.login(); return false; }
  return true;
};

// roleGuard — checks client roles from route data, redirects to /dashboard
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const requiredRole = route.data['role'] as string | undefined;
  if (!requiredRole) return true;
  return authService.hasRole(requiredRole) ? true : inject(Router).createUrlTree(['/dashboard']);
};

// Route config
{ path: 'environments', canActivate: [authGuard, roleGuard], data: { role: 'admin' } }
```

### Testing Keycloak

```typescript
// Mock providers for unit tests
{ provide: Keycloak, useValue: createMockKeycloak() },
{ provide: KEYCLOAK_EVENT_SIGNAL, useValue: signal<KeycloakEvent>({ type: KeycloakEventType.Ready, args: true }) },

// Trigger auth events in tests
eventSignal.set({ type: KeycloakEventType.AuthSuccess });
TestBed.flushEffects();
expect(service.isAuthenticated()).toBe(true);
```

## Model Patterns

Separate domain models from input types. Use discriminated unions for type safety:

```typescript
export type FlagType = 'boolean' | 'string' | 'number' | 'json';

export interface Flag {
  id: string; projectId: string; key: string; name: string;
  description: string; type: FlagType; defaultValue: FlagTypeMap[FlagType];
  tags: string[]; environmentValues: Record<string, EnvironmentFlagValue>;
  createdAt: string; updatedAt: string;
}

// Separate input types
export type CreateFlagInput = CreateFlagInputBase<'boolean'> | CreateFlagInputBase<'string'> | ...;
```

Filter options as `const` arrays: `FLAG_STATUS_OPTIONS`, `FLAG_TYPE_OPTIONS`.

## Utility Patterns (Pure Functions)

### Composable Filter Predicates (`filter.utils.ts`)

Higher-order functions returning predicates. Compose with `matchesAll()` / `matchesAny()`:

```typescript
// Individual predicate factories
textFilter<T>(fields, query): (item: T) => boolean;
propertyEquals<T>(field, value): (item: T) => boolean;
isTruthy<T>(field): (item: T) => boolean;
not<T>(predicate): (item: T) => boolean;

// Composition
matchesAll<T>(predicates): (item: T) => boolean;
matchesAny<T>(predicates): (item: T) => boolean;

// Usage in computed signals
protected readonly filtered = computed(() =>
  this.items().filter(matchesAll([
    textFilter(['name', 'key'], this.query()),
    propertyEquals('type', this.typeFilter()),
  ]))
);
```

### Search + Highlight (`search.utils.ts`)

```typescript
matchesSearch(item: Searchable, query: string): boolean;   // Multi-field search
highlightParts(text: string, query: string): HighlightPart[];  // Structured highlight data
```

### Form Helpers (`form.utils.ts`)

```typescript
hasRequiredFields(form, fields): boolean;
getTrimmedValues<T>(form, fields): Record<T, string>;
createFormFieldAccessors<T>(form): T;   // Proxy-based transparent get/set
```

## Styling Architecture

### Design Tokens (CSS Custom Properties)

All colors, spacing, shadows, and transitions defined in `_variables.scss`:

```scss
// Light theme (:root)
--bg-primary: #fffcf5;     --text-primary: #040403;
--accent-primary: #8e3d03;  --color-success: #1a7f37;
--border-radius: 6px;       --transition-fast: 150ms ease;

// Dark theme ([data-theme='dark']) overrides all tokens
```

Theme switching via `ThemeService` → sets `data-theme` attribute on `<html>`.

### BEM Naming

```scss
.btn { }                    // Block
.btn__spinner { }           // Element
.btn--primary { }           // Modifier
.btn--sm { }
```

### Component Styling

- `:host` for component root styling
- `host: { '[class]': 'hostClasses()' }` for dynamic classes via computed signals
- `@use 'styles/mixins' as *;` for shared mixins
- No inline styles. No ViewEncapsulation overrides.

### Responsive Breakpoints

```scss
@media (width < 768px)   { /* Mobile: sidebar becomes drawer */ }
@media (width <= 960px)  { /* Tablet */ }
```

## Testing

### Unit Tests (Jest + Angular Testing Library)

**Coverage threshold: 100%** (enforced by `jest.config.js`, blocks merges).

```javascript
// jest.config.js
coverageThreshold: { global: { branches: 100, functions: 100, lines: 100, statements: 100 } }
```

**Test structure:**
```typescript
describe('FlagStore', () => {
  describe('loadAll', () => {
    it('should set flags on success', async () => {
      // Arrange - setup mocks
      // Act - call store method
      // Assert - verify signal values
    });
    it('should set error on failure', async () => { ... });
  });
});
```

**Testing helpers** (`src/app/testing/`):
- `store.helpers.ts` - `getCountBefore()`, `expectItemAdded()`, `expectItemRemoved()`
- `component.helpers.ts` - Component rendering utilities
- `dom.helpers.ts` - DOM query helpers
- `mock.factories.ts` - `createMockFlag()`, `createMockProject()`, etc.
- `mock-api.providers.ts` - Mock API providers with seed data

**Mock API providers** (`mock-api.providers.ts`) include Keycloak mocks:
- `Keycloak` mock with `authenticated: true`, `loadUserProfile()`, `resourceAccess`
- `KEYCLOAK_EVENT_SIGNAL` mock signal for testing auth state changes
- Spread `MOCK_API_PROVIDERS` into any TestBed that needs API + auth mocking

**Jest setup** (`setup-jest.ts`):
- Clears localStorage before each test
- Mocks `window.matchMedia`, `IntersectionObserver`, `ResizeObserver`
- Suppresses Angular internal warnings (NG0xxx)

### E2E Tests (Playwright)

**Test pyramid:** smoke (15s) → journeys (1-2min) → regression (5+min) → cross-browser

```bash
npm run e2e:smoke        # Quick sanity checks
npm run e2e:journeys     # User workflow tests
npm run e2e:regression   # Edge cases, accessibility
npm run e2e:all-browsers # Chrome, Firefox, WebKit
```

**Page Object Model hierarchy:**
```
BasePage (modal, toast, table, toggle, search helpers)
  └── BaseCrudListPage (itemRows, deleteItem, clickEdit, clickDelete)
        ├── FlagListPage, FlagDetailPage, FlagCreatePage
        ├── ProjectListPage
        ├── EnvironmentListPage
        └── SegmentListPage
```

**Critical: `<app-button>` click pattern:**
Angular `(click)` handlers bind on the `<app-button>` host element. Use `dispatchEvent('click')` on the host, not `.click()` on the inner `<button>`:

```typescript
// CORRECT - reliable cross-browser
locator('app-button').filter({ hasText: /delete/i }).dispatchEvent('click');

// WRONG - intermittent failures in Firefox/WebKit
getByRole('button', { name: /delete/i }).click();
```

**Authentication:** Keycloak auth via Playwright `storageState` pattern:
- `e2e/auth/auth.setup.ts` — setup project logs in as admin + user, saves `e2e/.auth/*.json`
- All test projects depend on `auth-setup` and use `storageState: 'e2e/.auth/admin.json'`
- `user-role` project uses `storageState: 'e2e/.auth/user.json'` for non-admin tests
- Password field uses `page.locator('#password')` (not `getByLabel` — strict mode conflict)

**Assertion-based waits** (15s timeout for API-dependent operations):
```typescript
await expect(this.modal).not.toBeVisible({ timeout: 15000 });
await expect(this.itemRow(name)).toBeVisible({ timeout: 15000 });
```

## UI Component Library (`@watt/ui`)

22 shared UI components are provided by the `@watt/ui` npm package (private GitLab registry). Components use `ui-*` selector prefix.

**Import pattern:** All imports from root — `import { ButtonComponent, ToastService } from '@watt/ui';` (NO subpath exports)

| Component | Selector | Key Features |
|-----------|----------|-------------|
| `ButtonComponent` | `ui-button` | Variants: primary/secondary/ghost/danger. Sizes: sm/md/lg. Loading state. |
| `CardComponent` | `ui-card` | Content projection. Padding variants: none/sm/md/lg. |
| `BadgeComponent` | `ui-badge` | Variants: success/warning/error/info. Dismissible. |
| `DataTableComponent` | `ui-data-table` | Generic `<T>`, sortable columns via `UiColDirective`, content children. |
| `FormFieldComponent` | `ui-form-field` | ControlValueAccessor. Types: text/email/password/number/color/textarea. |
| `ToggleComponent` | `ui-toggle` | Checked/label/disabled inputs. Emits `toggled` output. |
| `ToastService` | `ui-toast` | ToastService: success/error/warning/info. Auto-dismiss. |
| `EmptyStateComponent` | `ui-empty-state` | Icon + title + message + action slot. Size variants. |
| `LoadingSpinnerComponent` | `ui-loading-spinner` | Sizes: sm/md/lg. Optional label. |
| `SearchInputComponent` | `ui-search-input` | Debounced search with clear button. |
| `SelectFieldComponent` | `ui-select-field` | Native select with label integration (for forms). |
| `LabeledSelectComponent` | `ui-labeled-select` | Compact select (for toolbars/filters). |
| `TabsComponent` | `ui-tabs` | Tab navigation component. |
| `ToolbarComponent` | `ui-toolbar` | Toolbar container for page actions. |
| `BreadcrumbComponent` | `ui-breadcrumb` | Route-aware breadcrumb with selectors. |
| `PageHeaderComponent` | `ui-page-header` | Page title + description container. |
| `IconComponent` | `ui-icon` | SVG icon system with `IconName` type. |
| `NavItemComponent` | `ui-nav-item` | Sidebar navigation link. |
| `NavSectionComponent` | `ui-nav-section` | Grouped navigation section. |
| `StatCardComponent` | `ui-stat-card` | Dashboard statistics display. |
| `UserMenuComponent` | `ui-user-menu` | Profile dropdown in sidebar footer. Emits `menuToggle`. |
| `ErrorBannerComponent` | `ui-error-banner` | Error display banner with retry. |

### Local-Only Components

| Component | Location | Selector | Reason |
|-----------|----------|----------|--------|
| `LogoIconComponent` | `shared/ui/logo-icon/` | `app-logo-icon` | App-specific branding SVG |
| `FlagsEmptyIconComponent` | `shared/ui/flags-empty-icon/` | `app-flags-empty-icon` | App-specific empty state SVG |
| `AuditBadgeComponent` | `features/audit/components/audit-badge/` | `app-audit-badge` | Extends badge with audit action variants (created/updated/deleted/toggled) |

## CI/CD Pipeline (GitLab)

```
install → lint (TS + SCSS parallel) → test:unit → build → build:docker → security* → deploy* → e2e*
```

- **Cache:** `package-lock.json` as key, `node_modules/` path
- **Docker:** Kaniko builds (no daemon), tagged by commit SHA + latest
- **Security:** Snyk weekly scans (dependencies, code, IaC) - requires `SNYK_TOKEN`
- **E2E:** Conditional on `E2E_BASE_URL` being set; smoke → journeys → regression → cross-browser

### Git Hooks (Husky)

**Pre-commit:** `lint-staged` (ESLint + Prettier + StyleLint per file type) + `npm run typecheck`
**Pre-push:** `npm run test:coverage` + `npm run e2e:smoke`

## Docker

### Production (`docker/`)
- `nginx:1.27-alpine` serving pre-built Angular app
- Non-root user (UID 1001), read-only filesystem, `no-new-privileges`
- Security headers: CSP, X-Frame-Options, X-Content-Type-Options, Permissions-Policy
- DoS protection: 1k body limit, 10s timeouts
- Caching: 1-year for hashed assets, no-cache for HTML
- Health check: `GET /health` → 200 OK
- Resource limits: 0.5 CPU, 128MB memory

### Development (`.devcontainer/`)
- `node:20.19.0-alpine` with Angular CLI, git, dumb-init
- Volume mounts project root, isolates `node_modules`
- VS Code extensions pre-configured (16 extensions)
- Auto-starts `ng serve` on port 4200

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Component | `kebab-case.ts` (no `.component`) | `flag-card.ts` |
| Template | `kebab-case.html` | `flag-card.html` |
| Styles | `kebab-case.scss` | `flag-card.scss` |
| Service | `kebab-case.service.ts` | `flag-api.service.ts` |
| Store | `kebab-case.store.ts` | `flag.store.ts` |
| Model | `kebab-case.model.ts` | `flag.model.ts` |
| Utility | `kebab-case.utils.ts` | `flag-format.utils.ts` |
| Test | `kebab-case.spec.ts` | `flag-card.spec.ts` |
| Icon | `kebab-case-icon.ts` | `logo-icon.ts` |
| API | `kebab-case.api.ts` | `flag.api.ts` |
| Guard | `kebab-case.guard.ts` | `auth.guard.ts` |
| Directive | `kebab-case.directive.ts` | `ui-col.directive.ts` |

## Commands Reference

```bash
# Development
npm start                    # Dev server (0.0.0.0:4200)
npm run test:watch          # Jest watch mode

# Testing
npm run test:coverage       # Full suite + 100% coverage check
npm run e2e                 # All Playwright tests
npm run e2e:smoke           # Quick smoke tests
npm run e2e:journeys        # User workflow tests

# Code Quality
npm run lint                # ESLint (TS + SCSS)
npm run typecheck           # tsc --noEmit
npm run format              # Prettier
npm run ci:local            # lint + coverage + build (pre-merge check)

# Build
npm run build               # Production build
```

## Git Workflow

Conventional commits: `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`

## DO NOT

- Use `*ngIf`, `*ngFor`, `*ngSwitch` (use `@if`, `@for`, `@switch`)
- Use constructor injection (use `inject()`)
- Use `@Input()`/`@Output()` decorators (use `input()`/`output()` functions)
- Use `@HostBinding`/`@HostListener` (use `host: {}` property)
- Set `standalone: true` explicitly (it's the default)
- Mutate signals directly (use `.set()`, `.update()`)
- Use NgModules for components
- Store secrets in environment.ts (use environment variables)
- Use `any` type (except in `.spec.ts` files)
- Skip tests or write tests after implementation
- Use inline styles (use SCSS with BEM)
- Use `CommonModule` (import specific directives/pipes)

## Quality Checklist

Before considering any task complete:

- [ ] Tests written first (TDD) and all passing
- [ ] 100% coverage maintained (`npm run test:coverage`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] BEM naming for all SCSS
- [ ] Follows all patterns in this file
