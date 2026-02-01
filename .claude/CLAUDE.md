# CLAUDE.md - Feature Flag UI (Angular 21)

## Project Overview

This is an Angular 21 application that serves as the web UI for a Feature Flag management system (LaunchDarkly clone). The backend API is written in Rust. This UI provides comprehensive feature flag management capabilities including creation, targeting rules (segments), environments, and a dashboard with usage statistics.

## Core Development Principles

### Test-Driven Development (TDD)

**This project follows strict TDD. No production code without a failing test first.**

1. **Red**: Write a failing test that defines expected behavior
2. **Green**: Write the minimum code to make the test pass
3. **Refactor**: Clean up while keeping tests green

Testing stack:
- **Unit tests**: Jest with Angular Testing Library
- **Component tests**: Angular Testing Library (prefer over TestBed when possible)
- **E2E tests**: Playwright
- **Test coverage requirement**: Minimum 80% coverage, aim for 90%+

```bash
# Run tests in watch mode during development
npm run test:watch

# Run full test suite with coverage
npm run test:coverage

# Run e2e tests
npm run e2e
```

### SOLID Principles

Apply SOLID rigorously:

- **S - Single Responsibility**: Each class/function does ONE thing. Services handle business logic, components handle UI orchestration, pure functions handle transformations.
- **O - Open/Closed**: Use interfaces and composition. Extend behavior through new implementations, not modifications.
- **L - Liskov Substitution**: All implementations of an interface must be interchangeable without breaking behavior.
- **I - Interface Segregation**: Create focused, specific interfaces. Prefer multiple small interfaces over one large one.
- **D - Dependency Inversion**: Depend on abstractions (interfaces), not concretions. Use Angular's DI system properly.

### Functional Programming Patterns

Embrace functional paradigms for clean, predictable code:

```typescript
// ✅ DO: Pure functions for data transformations
const filterActiveFlags = (flags: Flag[]): Flag[] =>
  flags.filter(flag => flag.enabled);

const sortByName = (flags: Flag[]): Flag[] =>
  [...flags].sort((a, b) => a.name.localeCompare(b.name));

// Compose functions
const getActiveFlagsSorted = pipe(filterActiveFlags, sortByName);

// ✅ DO: Immutable state updates
const updateFlag = (flags: Flag[], updated: Flag): Flag[] =>
  flags.map(f => f.id === updated.id ? { ...f, ...updated } : f);

// ❌ DON'T: Mutate state directly
flags.push(newFlag); // Never do this
flag.enabled = true; // Never do this
```

Key functional patterns to use:
- **Pure functions**: No side effects, same input = same output
- **Immutability**: Never mutate, always return new objects/arrays
- **Function composition**: Build complex operations from simple functions
- **Higher-order functions**: map, filter, reduce, pipe
- **Option/Result patterns**: Handle nullability explicitly

### Separation of Concerns - Let Each Technology Shine

**TypeScript**: Logic, types, business rules, state management
**HTML**: Structure and semantics only - no logic in templates beyond simple bindings
**SCSS**: All styling - use BEM methodology, no inline styles

```typescript
// ✅ DO: Keep templates clean, logic in TypeScript
// component.ts
readonly isValid = computed(() => this.form().valid && this.hasChanges());

// template.html
<button [disabled]="!isValid()">Save</button>

// ❌ DON'T: Complex logic in templates
<button [disabled]="!form.valid || !hasChanges || loading || error">Save</button>
```

## Angular 21 Best Practices

### Signals-First Architecture

Use Angular Signals as the primary state management approach:

```typescript
@Component({...})
export class FlagListComponent {
  // Input signals
  readonly environmentId = input.required<string>();
  
  // Local state as signals
  readonly searchTerm = signal('');
  readonly sortOrder = signal<'asc' | 'desc'>('asc');
  
  // Computed signals for derived state
  readonly filteredFlags = computed(() => {
    const flags = this.flagStore.flags();
    const term = this.searchTerm().toLowerCase();
    return flags.filter(f => f.name.toLowerCase().includes(term));
  });
  
  // Effects for side effects
  constructor() {
    effect(() => {
      // React to environment changes
      this.loadFlags(this.environmentId());
    });
  }
}
```

### Standalone Components

All components must be standalone. No NgModules for components:

```typescript
@Component({
  selector: 'app-flag-card',
  imports: [RouterLink, FlagToggleComponent],
  templateUrl: './flag-card.html',
  styleUrl: './flag-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlagCardComponent {
  readonly flag = input.required<Flag>();
  readonly toggled = output<FlagToggleEvent>();
}
```

**Note:** Angular 19+ defaults to standalone, so explicit `standalone: true` is optional. Direct imports are preferred over CommonModule.

### Inject Function

Use the `inject()` function instead of constructor injection:

```typescript
// ✅ DO: Use inject()
export class FlagService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly errorHandler = inject(ErrorHandlerService);
}

// ❌ DON'T: Constructor injection
export class FlagService {
  constructor(
    private http: HttpClient,
    private config: AppConfig
  ) {}
}
```

### Control Flow Syntax

Use the new control flow syntax, not structural directives:

```html
<!-- ✅ DO: New control flow -->
@if (loading()) {
  <app-spinner />
} @else if (error()) {
  <app-error-message [error]="error()" />
} @else {
  @for (flag of flags(); track flag.id) {
    <app-flag-card [flag]="flag" />
  } @empty {
    <p>No flags found</p>
  }
}

<!-- ❌ DON'T: Old structural directives -->
<app-spinner *ngIf="loading"></app-spinner>
<div *ngFor="let flag of flags">...</div>
```

### Deferrable Views

Use `@defer` for performance optimization:

```html
@defer (on viewport) {
  <app-flag-analytics [flagId]="flag.id" />
} @placeholder {
  <div class="analytics-placeholder">Loading analytics...</div>
} @loading (minimum 200ms) {
  <app-skeleton-loader />
}
```

## Project Structure

```
src/
├── app/
│   ├── core/                     # Singleton services and utilities
│   │   ├── theme/                # Theme service (dark/light mode)
│   │   └── time/                 # Time provider abstraction
│   ├── shared/                   # Shared utilities and components
│   │   ├── store/                # Cross-feature state (ProjectStore, EnvironmentStore, SearchStore)
│   │   ├── ui/                   # Shared UI components (buttons, inputs, icons, etc.)
│   │   └── utils/                # Pure utility functions
│   ├── testing/                  # Test utilities and helpers
│   │   ├── store.helpers.ts      # Store testing utilities (getCountBefore, expectItemAdded, etc.)
│   │   ├── component.helpers.ts  # Component testing utilities
│   │   ├── dom.helpers.ts        # DOM query helpers
│   │   └── mock.factories.ts     # Test data factories
│   ├── features/                 # Feature modules (lazy-loaded routes)
│   │   ├── flags/
│   │   │   ├── components/       # Feature-specific components
│   │   │   ├── models/           # Feature-specific interfaces/types
│   │   │   ├── store/            # Feature state management
│   │   │   ├── utils/            # Feature-specific utilities
│   │   │   └── flags.routes.ts
│   │   ├── environments/
│   │   ├── projects/
│   │   ├── segments/             # User segment targeting rules
│   │   ├── audit/                # Audit log feature
│   │   ├── settings/             # User settings (profile, preferences, API keys)
│   │   │   └── store/            # Focused stores: UserProfileStore, PreferencesStore, ApiKeyStore
│   │   └── dashboard/            # Dashboard overview
│   ├── layout/                   # App shell components
│   │   ├── header/
│   │   └── sidebar/
│   └── app.routes.ts
├── styles/                       # Global SCSS
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _typography.scss
│   └── main.scss
└── environments/
```

**Note:** The following are planned but not yet implemented:
- `core/auth/` - Authentication service and guards (when backend API ready)
- `core/api/` - HTTP client and interceptors (when backend API ready)
- `core/error-handling/` - Centralized error handling (when backend API ready)

## API Integration

The Rust backend API base URL will be configured via environment variables. Use a typed API client:

```typescript
// api/feature-flag.api.ts
export interface FeatureFlagApi {
  getFlags(projectId: string, envId: string): Observable<Flag[]>;
  getFlag(id: string): Observable<Flag>;
  createFlag(flag: CreateFlagDto): Observable<Flag>;
  updateFlag(id: string, updates: UpdateFlagDto): Observable<Flag>;
  deleteFlag(id: string): Observable<void>;
  toggleFlag(id: string, enabled: boolean): Observable<Flag>;
}

@Injectable({ providedIn: 'root' })
export class FeatureFlagApiService implements FeatureFlagApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  
  getFlags(projectId: string, envId: string): Observable<Flag[]> {
    return this.http.get<Flag[]>(
      `${this.baseUrl}/projects/${projectId}/environments/${envId}/flags`
    );
  }
  // ... other methods
}
```

## State Management

Use a signals-based store pattern:

```typescript
// store/flag.store.ts
@Injectable({ providedIn: 'root' })
export class FlagStore {
  // State as signals
  private readonly _flags = signal<Flag[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  
  // Public readonly selectors
  readonly flags = this._flags.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  
  // Computed selectors
  readonly activeFlags = computed(() => 
    this._flags().filter(f => f.enabled)
  );
  
  // Actions
  async loadFlags(projectId: string, envId: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    
    try {
      const flags = await firstValueFrom(
        this.api.getFlags(projectId, envId)
      );
      this._flags.set(flags);
    } catch (e) {
      this._error.set(this.errorHandler.getMessage(e));
    } finally {
      this._loading.set(false);
    }
  }
}
```

## Error Handling

Implement comprehensive error handling:

```typescript
// core/error-handling/error-handler.service.ts
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

// Use Result type for operations that can fail
type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Helper functions
const ok = <T>(data: T): Result<T> => ({ success: true, data });
const err = <E>(error: E): Result<never, E> => ({ success: false, error });
```

## File Naming Conventions

- Components: `flag-card.ts`, `flag-card.html`, `flag-card.scss` (no `.component` suffix)
- Services: `flag.service.ts`, `flag-api.service.ts`
- Models/Interfaces: `flag.model.ts`, `flag-value.model.ts`
- Utilities: `flag.utils.ts`, `flag-format.utils.ts`
- Tests: `flag-card.spec.ts`, `flag.service.spec.ts`
- Stores: `flag.store.ts`
- Icon Components: `logo-icon.ts`, `flags-empty-icon.ts`

## Git Workflow

- Write descriptive commit messages following conventional commits
- `feat:` new feature
- `fix:` bug fix  
- `test:` adding/updating tests
- `refactor:` code refactoring
- `docs:` documentation updates
- `chore:` maintenance tasks

## Commands Reference

```bash
# Development
npm start                    # Start dev server
npm run test:watch          # Run tests in watch mode
npm run lint                # Run ESLint
npm run lint:fix            # Fix linting issues

# Testing
npm test                    # Run all unit tests
npm run test:coverage       # Run tests with coverage
npm run e2e                 # Run Playwright e2e tests

# Build
npm run build               # Production build
npm run build:analyze       # Build with bundle analyzer

# Code Quality
npm run format              # Format with Prettier
npm run typecheck           # TypeScript type checking
```

## When Generating Code

1. **Always start with the test** - Write the failing test first
2. **Create interfaces before implementations** - Define the contract
3. **Use pure functions for logic** - Keep components thin
4. **Apply single responsibility** - One reason to change per unit
5. **Compose, don't inherit** - Favor composition over inheritance
6. **Make illegal states unrepresentable** - Use TypeScript's type system
7. **Handle errors explicitly** - No silent failures

## Quality Checklist

Before considering any task complete:

- [ ] Tests written and passing (unit + integration where applicable)
- [ ] Coverage meets minimum threshold
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] Documentation updated if needed
- [ ] Follows all conventions in this file
