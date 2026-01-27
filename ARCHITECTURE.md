# Architecture Documentation

> **Note:** This document describes both the current implementation and the target architecture.
> Sections marked with **(Current)** reflect what exists today. Sections marked with **(Planned)**
> describe infrastructure that has not yet been implemented, including: the `core/api/` service layer,
> `core/auth/` authentication system, `core/error-handling/` error types and handlers, HTTP interceptors,
> and the API service abstractions. The stores currently use in-memory seed data rather than HTTP calls
> to a backend API.

## Overview

The Feature Flag UI is an Angular single-page application that provides a comprehensive interface for managing feature flags. This document describes the architectural decisions, patterns, and structure of the application.

## Architecture Principles

### 1. Signals-First State Management

We use Angular's native Signals system for all state management instead of external libraries like NgRx or Akita. This provides:

- Native Angular integration with automatic change detection
- Simpler mental model (no actions, reducers, effects boilerplate)
- Better TypeScript inference
- Smaller bundle size

### 2. Standalone Components

All components are standalone (no NgModules). This enables:

- Better tree-shaking
- Simplified imports
- Easier testing
- Clear dependency graphs

### 3. Feature-Based Organization

Code is organized by feature rather than type, making it easier to:

- Find related code
- Maintain feature boundaries
- Enable lazy loading
- Scale the codebase

### 4. Separation of Concerns

Each layer has clear responsibilities:

- **Components**: UI rendering and user interaction
- **Stores**: State management and business logic orchestration
- **Services**: API communication and external integrations
- **Utils**: Pure functions for data transformation

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Angular App                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                         Presentation Layer                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │  │
│  │  │   Layout   │  │  Features  │  │   Shared   │  │    Core    │  │  │
│  │  │ Components │  │ Components │  │ Components │  │ Components │  │  │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  │  │
│  └────────┼───────────────┼───────────────┼───────────────┼─────────┘  │
│           │               │               │               │            │
│  ┌────────┴───────────────┴───────────────┴───────────────┴─────────┐  │
│  │                         State Layer (Signals)                     │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │  │
│  │  │ FlagStore  │  │ProjectStore│  │  EnvStore  │  │  UIStore   │  │  │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  │  │
│  └────────┼───────────────┼───────────────┼───────────────┼─────────┘  │
│           │               │               │               │            │
│  ┌────────┴───────────────┴───────────────┴───────────────┴─────────┐  │
│  │                          Service Layer                            │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │  │
│  │  │  Flag API  │  │Project API │  │   Auth     │  │   Error    │  │  │
│  │  │  Service   │  │  Service   │  │  Service   │  │  Handler   │  │  │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  │  │
│  └────────┼───────────────┼───────────────┼───────────────┼─────────┘  │
│           │               │               │               │            │
│           └───────────────┴───────────────┴───────────────┘            │
│                                   │                                     │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │ HTTP
                                    ▼
                    ┌───────────────────────────────┐
                    │       Rust Backend API        │
                    └───────────────────────────────┘
```

## Directory Structure

```
src/
├── app/
│   ├── core/                           # Singleton services and app-wide concerns
│   │   ├── api/
│   │   │   ├── api.config.ts           # API configuration
│   │   │   ├── base-api.service.ts     # Base HTTP client
│   │   │   └── api.interceptor.ts      # HTTP interceptors
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   ├── auth.interceptor.ts
│   │   │   └── auth.types.ts
│   │   ├── error-handling/
│   │   │   ├── error-handler.service.ts
│   │   │   ├── error.types.ts
│   │   │   └── error.interceptor.ts
│   │   └── config/
│   │       ├── app.config.ts
│   │       └── app.initializer.ts
│   │
│   ├── shared/                         # Shared, reusable code
│   │   ├── ui/                         # UI component library
│   │   │   ├── button/
│   │   │   │   ├── button.component.ts
│   │   │   │   ├── button.component.html
│   │   │   │   ├── button.component.scss
│   │   │   │   └── button.component.spec.ts
│   │   │   ├── input/
│   │   │   ├── select/
│   │   │   ├── modal/
│   │   │   ├── toast/
│   │   │   └── index.ts                # Barrel export
│   │   ├── utils/                      # Pure utility functions
│   │   │   ├── array.utils.ts
│   │   │   ├── string.utils.ts
│   │   │   ├── date.utils.ts
│   │   │   └── validation.utils.ts
│   │   ├── pipes/
│   │   │   ├── relative-time.pipe.ts
│   │   │   └── highlight.pipe.ts
│   │   └── directives/
│   │       ├── click-outside.directive.ts
│   │       └── autofocus.directive.ts
│   │
│   ├── features/                       # Feature modules (lazy-loaded)
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── stats-card.component.ts
│   │   │   │   └── activity-feed.component.ts
│   │   │   └── dashboard.routes.ts
│   │   │
│   │   ├── flags/
│   │   │   ├── components/
│   │   │   │   ├── flag-list/
│   │   │   │   │   ├── flag-list.component.ts
│   │   │   │   │   ├── flag-list.component.html
│   │   │   │   │   ├── flag-list.component.scss
│   │   │   │   │   └── flag-list.component.spec.ts
│   │   │   │   ├── flag-detail/
│   │   │   │   ├── flag-card/
│   │   │   │   ├── flag-form/
│   │   │   │   └── targeting-rules/
│   │   │   ├── services/
│   │   │   │   └── flag-api.service.ts
│   │   │   ├── store/
│   │   │   │   ├── flag.store.ts
│   │   │   │   └── flag.store.spec.ts
│   │   │   ├── models/
│   │   │   │   ├── flag.model.ts
│   │   │   │   └── targeting-rule.model.ts
│   │   │   └── flags.routes.ts
│   │   │
│   │   ├── projects/
│   │   ├── environments/
│   │   ├── segments/
│   │   ├── analytics/
│   │   └── audit-log/
│   │
│   ├── layout/                         # App shell components
│   │   ├── header/
│   │   │   ├── header.component.ts
│   │   │   └── header.component.scss
│   │   ├── sidebar/
│   │   │   ├── sidebar.component.ts
│   │   │   └── nav-item.component.ts
│   │   └── footer/
│   │
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.scss
│   ├── app.config.ts                   # App providers configuration
│   └── app.routes.ts                   # Root routing
│
├── styles/                             # Global styles
│   ├── _variables.scss                 # Design tokens
│   ├── _mixins.scss                    # SCSS mixins
│   ├── _typography.scss                # Typography system
│   ├── _reset.scss                     # CSS reset
│   └── main.scss                       # Main stylesheet
│
├── environments/
│   ├── environment.ts                  # Development config
│   ├── environment.staging.ts          # Staging config
│   └── environment.prod.ts             # Production config
│
├── assets/
│   ├── icons/
│   └── images/
│
└── index.html
```

## State Management Pattern

### Store Structure

Each feature has its own store that manages its state using Angular Signals:

```typescript
// store/flag.store.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { FlagApiService } from '../services/flag-api.service';

@Injectable({ providedIn: 'root' })
export class FlagStore {
  private readonly api = inject(FlagApiService);
  private readonly errorHandler = inject(ErrorHandlerService);

  // Private writable signals
  private readonly _flags = signal<Flag[]>([]);
  private readonly _selectedFlag = signal<Flag | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<AppError | null>(null);

  // Public readonly signals (prevent external mutation)
  readonly flags = this._flags.asReadonly();
  readonly selectedFlag = this._selectedFlag.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals for derived state
  readonly activeFlags = computed(() => 
    this._flags().filter(f => f.enabled)
  );

  readonly flagCount = computed(() => this._flags().length);

  readonly flagsByTag = computed(() => {
    const flags = this._flags();
    return flags.reduce((acc, flag) => {
      flag.tags.forEach(tag => {
        acc[tag] = [...(acc[tag] || []), flag];
      });
      return acc;
    }, {} as Record<string, Flag[]>);
  });

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
      this._error.set(this.errorHandler.normalize(e));
    } finally {
      this._loading.set(false);
    }
  }

  async toggleFlag(id: string, enabled: boolean): Promise<void> {
    // Optimistic update
    const previousFlags = this._flags();
    this._flags.update(flags =>
      flags.map(f => f.id === id ? { ...f, enabled } : f)
    );

    try {
      await firstValueFrom(this.api.toggleFlag(id, enabled));
    } catch (e) {
      // Rollback on error
      this._flags.set(previousFlags);
      this._error.set(this.errorHandler.normalize(e));
    }
  }

  selectFlag(id: string | null): void {
    if (id === null) {
      this._selectedFlag.set(null);
    } else {
      const flag = this._flags().find(f => f.id === id);
      this._selectedFlag.set(flag ?? null);
    }
  }

  // Reset store state
  reset(): void {
    this._flags.set([]);
    this._selectedFlag.set(null);
    this._loading.set(false);
    this._error.set(null);
  }
}
```

### Component Integration

Components consume stores through injection and use signals in templates:

```typescript
// components/flag-list/flag-list.component.ts
@Component({
  selector: 'app-flag-list',
  standalone: true,
  imports: [FlagCardComponent, SearchInputComponent, SpinnerComponent],
  templateUrl: './flag-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlagListComponent implements OnInit {
  private readonly store = inject(FlagStore);
  private readonly route = inject(ActivatedRoute);

  // Local UI state
  readonly searchTerm = signal('');
  readonly sortField = signal<'name' | 'updatedAt'>('name');

  // Derived from store + local state
  readonly filteredFlags = computed(() => {
    const flags = this.store.flags();
    const term = this.searchTerm().toLowerCase();
    const sorted = this.sortFlags(flags, this.sortField());
    
    return term
      ? sorted.filter(f => f.name.toLowerCase().includes(term))
      : sorted;
  });

  // Delegate to store
  readonly loading = this.store.loading;
  readonly error = this.store.error;

  ngOnInit(): void {
    // React to route params
    effect(() => {
      const projectId = this.route.snapshot.params['projectId'];
      const envId = this.route.snapshot.params['envId'];
      this.store.loadFlags(projectId, envId);
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onToggle(flag: Flag): void {
    this.store.toggleFlag(flag.id, !flag.enabled);
  }

  private sortFlags(flags: Flag[], field: 'name' | 'updatedAt'): Flag[] {
    return [...flags].sort((a, b) => {
      if (field === 'name') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }
}
```

## Component Patterns

### Smart vs Presentational Components

**Smart (Container) Components:**
- Inject services and stores
- Coordinate data flow
- Handle user actions
- Usually route-level components

**Presentational (Dumb) Components:**
- Receive data via inputs
- Emit events via outputs
- No direct service/store access
- Highly reusable

```typescript
// Smart component
@Component({
  selector: 'app-flag-detail-container',
  template: `
    @if (loading()) {
      <app-spinner />
    } @else if (flag(); as flag) {
      <app-flag-detail 
        [flag]="flag"
        (save)="onSave($event)"
        (delete)="onDelete()"
      />
    }
  `
})
export class FlagDetailContainerComponent {
  private readonly store = inject(FlagStore);
  
  readonly flag = this.store.selectedFlag;
  readonly loading = this.store.loading;

  onSave(updates: Partial<Flag>): void {
    this.store.updateFlag(this.flag()!.id, updates);
  }

  onDelete(): void {
    this.store.deleteFlag(this.flag()!.id);
  }
}

// Presentational component
@Component({
  selector: 'app-flag-detail',
  templateUrl: './flag-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlagDetailComponent {
  readonly flag = input.required<Flag>();
  readonly save = output<Partial<Flag>>();
  readonly delete = output<void>();
}
```

## API Layer

### Service Structure

```typescript
// services/flag-api.service.ts
export interface FlagApi {
  getFlags(projectId: string, envId: string): Observable<Flag[]>;
  getFlag(id: string): Observable<Flag>;
  createFlag(flag: CreateFlagDto): Observable<Flag>;
  updateFlag(id: string, updates: UpdateFlagDto): Observable<Flag>;
  deleteFlag(id: string): Observable<void>;
  toggleFlag(id: string, enabled: boolean): Observable<Flag>;
}

@Injectable({ providedIn: 'root' })
export class FlagApiService implements FlagApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getFlags(projectId: string, envId: string): Observable<Flag[]> {
    return this.http.get<FlagDto[]>(
      `${this.baseUrl}/projects/${projectId}/environments/${envId}/flags`
    ).pipe(
      map(dtos => dtos.map(toFlag))
    );
  }

  createFlag(dto: CreateFlagDto): Observable<Flag> {
    return this.http.post<FlagDto>(
      `${this.baseUrl}/flags`,
      dto
    ).pipe(
      map(toFlag)
    );
  }

  // ... other methods
}

// Mapper function (pure)
const toFlag = (dto: FlagDto): Flag => ({
  id: dto.id,
  key: dto.key,
  name: dto.name,
  description: dto.description ?? '',
  enabled: dto.enabled,
  flagType: dto.flag_type as FlagType,
  variations: dto.variations.map(toVariation),
  targetingRules: dto.targeting_rules.map(toTargetingRule),
  tags: dto.tags,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
  createdBy: dto.created_by,
});
```

### HTTP Interceptors

```typescript
// core/api/api.interceptor.ts
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(APP_CONFIG);
  
  // Add API prefix if needed
  if (req.url.startsWith('/api')) {
    req = req.clone({
      url: `${config.apiBaseUrl}${req.url}`
    });
  }

  return next(req);
};

// core/auth/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};

// core/error-handling/error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const appError = errorHandler.normalize(error);
      
      // Handle specific errors globally
      if (error.status === 401) {
        inject(AuthService).logout();
      }

      return throwError(() => appError);
    })
  );
};
```

## Routing Strategy

### Route Configuration

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes')
          .then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'projects/:projectId/environments/:envId/flags',
        loadChildren: () => import('./features/flags/flags.routes')
          .then(m => m.FLAG_ROUTES)
      },
      {
        path: 'projects',
        loadChildren: () => import('./features/projects/projects.routes')
          .then(m => m.PROJECT_ROUTES)
      },
      // ... other routes
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
```

### Feature Routes

```typescript
// features/flags/flags.routes.ts
export const FLAG_ROUTES: Routes = [
  {
    path: '',
    component: FlagListComponent,
    data: { title: 'Flags' }
  },
  {
    path: 'new',
    component: FlagCreateComponent,
    data: { title: 'Create Flag' }
  },
  {
    path: ':flagId',
    component: FlagDetailComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: FlagOverviewComponent },
      { path: 'targeting', component: FlagTargetingComponent },
      { path: 'variations', component: FlagVariationsComponent },
      { path: 'history', component: FlagHistoryComponent }
    ]
  }
];
```

## Error Handling

### Error Types

```typescript
// core/error-handling/error.types.ts
export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  requestId?: string;
}

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN'
}

// Result type for operations that can fail
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export const ok = <T>(data: T): Result<T> => ({ success: true, data });
export const err = <E>(error: E): Result<never, E> => ({ success: false, error });
```

### Error Handler Service

```typescript
// core/error-handling/error-handler.service.ts
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private readonly toast = inject(ToastService);

  normalize(error: unknown): AppError {
    if (error instanceof HttpErrorResponse) {
      return this.normalizeHttpError(error);
    }
    
    if (error instanceof Error) {
      return {
        code: ErrorCode.UNKNOWN,
        message: error.message,
        timestamp: new Date()
      };
    }

    return {
      code: ErrorCode.UNKNOWN,
      message: 'An unexpected error occurred',
      timestamp: new Date()
    };
  }

  private normalizeHttpError(error: HttpErrorResponse): AppError {
    const codeMap: Record<number, ErrorCode> = {
      0: ErrorCode.NETWORK_ERROR,
      401: ErrorCode.UNAUTHORIZED,
      403: ErrorCode.FORBIDDEN,
      404: ErrorCode.NOT_FOUND,
      409: ErrorCode.CONFLICT,
      422: ErrorCode.VALIDATION_ERROR,
      500: ErrorCode.SERVER_ERROR
    };

    return {
      code: codeMap[error.status] ?? ErrorCode.UNKNOWN,
      message: error.error?.message ?? error.message,
      details: error.error?.details,
      timestamp: new Date(),
      requestId: error.headers.get('x-request-id') ?? undefined
    };
  }

  showError(error: AppError): void {
    this.toast.error(error.message);
  }
}
```

## Testing Strategy

### Unit Testing with Jest

```typescript
// store/flag.store.spec.ts
describe('FlagStore', () => {
  let store: FlagStore;
  let apiService: jest.Mocked<FlagApiService>;

  beforeEach(() => {
    apiService = {
      getFlags: jest.fn(),
      toggleFlag: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        FlagStore,
        { provide: FlagApiService, useValue: apiService }
      ]
    });

    store = TestBed.inject(FlagStore);
  });

  describe('loadFlags', () => {
    it('should set loading state while fetching', async () => {
      apiService.getFlags.mockReturnValue(of([]).pipe(delay(100)));
      
      const loadPromise = store.loadFlags('proj-1', 'env-1');
      
      expect(store.loading()).toBe(true);
      
      await loadPromise;
      
      expect(store.loading()).toBe(false);
    });

    it('should update flags on success', async () => {
      const mockFlags = [createMockFlag({ id: '1', name: 'Test' })];
      apiService.getFlags.mockReturnValue(of(mockFlags));
      
      await store.loadFlags('proj-1', 'env-1');
      
      expect(store.flags()).toEqual(mockFlags);
    });

    it('should set error on failure', async () => {
      apiService.getFlags.mockReturnValue(throwError(() => new Error('Failed')));
      
      await store.loadFlags('proj-1', 'env-1');
      
      expect(store.error()).not.toBeNull();
      expect(store.flags()).toEqual([]);
    });
  });
});
```

### Component Testing with Angular Testing Library

```typescript
// components/flag-card/flag-card.component.spec.ts
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

describe('FlagCardComponent', () => {
  it('should display flag name and key', async () => {
    const flag = createMockFlag({
      name: 'Dark Mode',
      key: 'dark-mode'
    });

    await render(FlagCardComponent, {
      componentInputs: { flag }
    });

    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    expect(screen.getByText('dark-mode')).toBeInTheDocument();
  });

  it('should emit toggle event when switch is clicked', async () => {
    const user = userEvent.setup();
    const flag = createMockFlag({ enabled: false });
    const onToggle = jest.fn();

    await render(FlagCardComponent, {
      componentInputs: { flag },
      componentOutputs: { toggled: onToggle }
    });

    await user.click(screen.getByRole('switch'));

    expect(onToggle).toHaveBeenCalledWith({ flag, enabled: true });
  });
});
```

## Performance Considerations

### Lazy Loading

All feature modules are lazy-loaded to reduce initial bundle size:

```typescript
// Routes use dynamic imports
loadChildren: () => import('./features/flags/flags.routes')
  .then(m => m.FLAG_ROUTES)
```

### Virtual Scrolling

Large lists use Angular CDK's virtual scrolling:

```html
<cdk-virtual-scroll-viewport itemSize="72" class="flag-list">
  <app-flag-card 
    *cdkVirtualFor="let flag of filteredFlags()"
    [flag]="flag"
  />
</cdk-virtual-scroll-viewport>
```

### Deferrable Views

Below-fold content uses `@defer`:

```html
<app-flag-overview [flag]="flag()" />

@defer (on viewport) {
  <app-flag-analytics [flagId]="flag().id" />
} @placeholder {
  <div class="analytics-placeholder">Analytics</div>
}
```

### OnPush Change Detection

All components use OnPush change detection for optimal performance:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

## Security

### Authentication Flow

1. User submits credentials to login endpoint
2. Backend validates and returns JWT
3. Token stored in memory (not localStorage)
4. Token attached to requests via interceptor
5. Token refresh handled automatically
6. Logout clears token and redirects

### XSS Prevention

- Angular's built-in sanitization for bound values
- Content Security Policy headers
- No use of `innerHTML` or `bypassSecurityTrust*`

### CSRF Protection

- Backend issues CSRF tokens
- Tokens included in mutation requests

## Deployment

### Build Configuration

```typescript
// angular.json (relevant sections)
{
  "configurations": {
    "production": {
      "budgets": [
        {
          "type": "initial",
          "maximumWarning": "500kb",
          "maximumError": "1mb"
        }
      ],
      "outputHashing": "all",
      "sourceMap": false
    },
    "staging": {
      "sourceMap": true
    }
  }
}
```

### Docker Build

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

# Runtime stage
FROM nginx:alpine
COPY --from=build /app/dist/feature-flag-ui /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

## Decision Records

### ADR-001: Signals over NgRx

**Decision**: Use Angular Signals for state management instead of NgRx.

**Rationale**: 
- Native Angular integration
- Simpler learning curve
- Smaller bundle size
- Sufficient for our complexity level

### ADR-002: Standalone Components Only

**Decision**: Use standalone components exclusively, no NgModules.

**Rationale**:
- Better tree-shaking
- Clearer imports
- Angular's recommended approach for new projects

### ADR-003: Jest over Karma

**Decision**: Use Jest for unit testing instead of Karma/Jasmine.

**Rationale**:
- Faster execution
- Better mocking capabilities
- Superior watch mode
- Snapshot testing support
