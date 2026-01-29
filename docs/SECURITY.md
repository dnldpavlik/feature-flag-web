# Security Guidelines

This document outlines security requirements, best practices, and implementation status for the Feature Flag UI application.

## Overview

As a feature flag management system, this application handles sensitive configuration that can affect production systems. Security is critical because:

- Feature flags control application behavior in production
- Misconfigured flags can cause outages or expose unreleased features
- Access control determines who can modify production systems
- Audit trails are required for compliance

## Implementation Status

### Current State

| Category | Status | Notes |
|----------|--------|-------|
| Authentication | Not Started | No auth service, guard, or interceptor |
| Authorization | Not Started | No RBAC implementation |
| XSS Prevention | Complete | Using Angular's built-in sanitization |
| CSRF Protection | Not Started | Backend integration required |
| Secure Storage | Partial | Theme uses localStorage (acceptable) |
| Input Validation | Partial | Form validation exists, API validation TBD |
| Audit Logging | UI Only | Display exists, backend integration TBD |

### Priority Levels

- **P0 (Critical)**: Must have before production
- **P1 (High)**: Should have before production
- **P2 (Medium)**: Should have soon after launch
- **P3 (Low)**: Nice to have

---

## Authentication

### Requirements (P0)

#### Token-Based Authentication

```typescript
// core/auth/auth.types.ts
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

#### Auth Service

```typescript
// core/auth/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Store tokens in memory, NOT localStorage
  private tokens = signal<AuthTokens | null>(null);
  private user = signal<AuthUser | null>(null);

  readonly isAuthenticated = computed(() => !!this.tokens());
  readonly currentUser = this.user.asReadonly();

  async login(credentials: LoginCredentials): Promise<void> { }
  async logout(): Promise<void> { }
  async refreshToken(): Promise<void> { }
  getAccessToken(): string | null { }
}
```

#### Auth Interceptor

```typescript
// core/auth/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  if (token && !req.url.includes('/auth/')) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
```

#### Route Guards

```typescript
// core/auth/auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store intended destination for redirect after login
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
```

### Implementation Checklist

- [ ] Create `AuthService` with login/logout/refresh
- [ ] Create `authInterceptor` for token attachment
- [ ] Create `authGuard` for protected routes
- [ ] Create login page component
- [ ] Store tokens in memory only (not localStorage/sessionStorage)
- [ ] Implement automatic token refresh before expiry
- [ ] Handle 401 responses globally
- [ ] Clear all state on logout
- [ ] Add loading states during auth operations

### Security Rules

1. **Never store tokens in localStorage/sessionStorage** - Vulnerable to XSS
2. **Use httpOnly cookies for refresh tokens** - When backend supports it
3. **Short access token expiry** - 15 minutes recommended
4. **Validate tokens on every request** - Backend responsibility
5. **Implement token refresh** - Before access token expires

---

## Authorization

### Requirements (P0)

#### Role-Based Access Control (RBAC)

```typescript
// core/auth/permissions.types.ts
export type Role = 'admin' | 'developer' | 'viewer';

export type Permission =
  | 'flags:read'
  | 'flags:write'
  | 'flags:delete'
  | 'flags:toggle'
  | 'environments:read'
  | 'environments:write'
  | 'environments:delete'
  | 'projects:read'
  | 'projects:write'
  | 'projects:delete'
  | 'users:read'
  | 'users:write'
  | 'audit:read';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['*'], // All permissions
  developer: [
    'flags:read', 'flags:write', 'flags:toggle',
    'environments:read',
    'projects:read',
    'audit:read'
  ],
  viewer: [
    'flags:read',
    'environments:read',
    'projects:read',
    'audit:read'
  ]
};
```

#### Permission Directive

```typescript
// shared/directives/has-permission.directive.ts
@Directive({
  selector: '[appHasPermission]',
})
export class HasPermissionDirective {
  private readonly authService = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  @Input() set appHasPermission(permission: Permission) {
    if (this.authService.hasPermission(permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
```

#### Permission Guard

```typescript
// core/auth/permission.guard.ts
export const permissionGuard = (permission: Permission): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasPermission(permission)) {
      return true;
    }

    return router.createUrlTree(['/unauthorized']);
  };
};
```

### Implementation Checklist

- [ ] Define roles and permissions
- [ ] Add permissions to user object from backend
- [ ] Create `hasPermission()` method in AuthService
- [ ] Create `HasPermissionDirective` for template use
- [ ] Create `permissionGuard` for route protection
- [ ] Hide UI elements based on permissions
- [ ] Disable actions user cannot perform
- [ ] Create unauthorized page

### Security Rules

1. **Always verify permissions on backend** - Frontend is for UX only
2. **Use least privilege principle** - Default to minimal permissions
3. **Environment-scoped permissions** - Production access should be restricted
4. **Log permission denials** - For security monitoring

---

## XSS Prevention

### Current Status: Complete

Angular provides built-in XSS protection through automatic sanitization.

### Rules (Enforced)

1. **Never use `innerHTML`** - Use Angular bindings instead
2. **Never use `bypassSecurityTrust*`** - Unless absolutely necessary with review
3. **Sanitize user input in templates** - Angular does this automatically
4. **Use `[textContent]` for dynamic text** - Instead of interpolation in sensitive contexts

### Verification

```bash
# Check for unsafe patterns (should return empty)
grep -r "bypassSecurityTrust\|innerHTML\|\[innerHTML\]" src/ --include="*.ts" --include="*.html"
```

### Content Security Policy (P1)

Configure CSP headers in the deployment environment:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

---

## CSRF Protection

### Requirements (P1)

#### CSRF Token Handling

```typescript
// core/api/csrf.interceptor.ts
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add CSRF token for mutation requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const csrfToken = getCsrfTokenFromCookie();

    if (csrfToken) {
      req = req.clone({
        setHeaders: {
          'X-CSRF-Token': csrfToken
        }
      });
    }
  }

  return next(req);
};

function getCsrfTokenFromCookie(): string | null {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? match[1] : null;
}
```

### Implementation Checklist

- [ ] Backend sets CSRF token in cookie
- [ ] Create CSRF interceptor
- [ ] Add interceptor to app config
- [ ] Verify token sent on all mutations
- [ ] Handle CSRF token refresh

### Security Rules

1. **Use SameSite cookies** - `SameSite=Strict` or `SameSite=Lax`
2. **Verify origin header** - Backend should check Origin/Referer
3. **Use custom headers** - `X-CSRF-Token` or similar

---

## Data Protection

### Sensitive Data Handling (P0)

#### What NOT to Store Client-Side

- Authentication tokens (use memory only)
- API keys or secrets
- Personal identifiable information (PII)
- Flag targeting rules with sensitive data

#### Acceptable Client-Side Storage

- User preferences (theme, language)
- UI state (sidebar collapsed, table sorting)
- Non-sensitive cache (flag names for autocomplete)

### Implementation Checklist

- [ ] Audit all localStorage/sessionStorage usage
- [ ] Remove any sensitive data from client storage
- [ ] Use memory for tokens
- [ ] Clear sensitive data on logout
- [ ] Implement data classification

### Secure Communication (P0)

1. **HTTPS only** - No HTTP in production
2. **HSTS headers** - `Strict-Transport-Security`
3. **Certificate pinning** - For mobile apps (if applicable)

---

## Input Validation

### Client-Side Validation (P1)

```typescript
// Validation should happen at multiple levels

// 1. Form validation (UX)
readonly flagForm = new FormGroup({
  name: new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(100),
    Validators.pattern(/^[a-zA-Z0-9\s\-_]+$/)
  ]),
  key: new FormControl('', [
    Validators.required,
    Validators.pattern(/^[a-z0-9\-_]+$/),
    Validators.maxLength(50)
  ])
});

// 2. Type validation (compile-time)
interface CreateFlagDto {
  name: string;
  key: string;
  description?: string;
  type: FlagType;
}

// 3. Runtime validation (API boundary)
function validateFlagDto(data: unknown): CreateFlagDto {
  // Use zod, io-ts, or similar for runtime validation
}
```

### Implementation Checklist

- [ ] Add form validation to all inputs
- [ ] Validate data before API calls
- [ ] Sanitize data displayed from API
- [ ] Implement max length on all text inputs
- [ ] Restrict allowed characters where appropriate

### Security Rules

1. **Never trust client input** - Always validate on backend
2. **Whitelist over blacklist** - Define what's allowed, not what's blocked
3. **Validate data types** - Ensure numbers are numbers, etc.
4. **Limit input length** - Prevent buffer overflow attacks

---

## API Security

### Secure API Communication (P0)

```typescript
// core/api/api.config.ts
export const apiConfig = {
  baseUrl: environment.apiBaseUrl,
  timeout: 30000,
  retries: 3,

  // Security headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Helps prevent CSRF
  }
};
```

### Error Handling

```typescript
// Don't expose sensitive information in errors
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log full error for debugging (not in production)
      if (!environment.production) {
        console.error('API Error:', error);
      }

      // Return sanitized error to UI
      const sanitizedError = {
        status: error.status,
        message: getPublicErrorMessage(error.status),
        code: error.error?.code || 'UNKNOWN_ERROR'
      };

      return throwError(() => sanitizedError);
    })
  );
};

function getPublicErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Please log in to continue.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    429: 'Too many requests. Please try again later.',
    500: 'An unexpected error occurred. Please try again.',
  };
  return messages[status] || 'An error occurred. Please try again.';
}
```

### Implementation Checklist

- [ ] Configure base API client with security headers
- [ ] Implement error interceptor with sanitized messages
- [ ] Add request timeout handling
- [ ] Implement retry logic with backoff
- [ ] Add request/response logging (dev only)

---

## OWASP Top 10 Considerations

### Relevant to Frontend

| # | Vulnerability | Mitigation | Status |
|---|--------------|------------|--------|
| A01 | Broken Access Control | Route guards, permission checks | Not Started |
| A02 | Cryptographic Failures | HTTPS only, no client-side crypto | Partial |
| A03 | Injection | Angular sanitization, parameterized queries | Complete |
| A05 | Security Misconfiguration | CSP headers, secure defaults | Not Started |
| A07 | XSS | Angular built-in protection | Complete |

### Backend Responsibility (Verify with API team)

| # | Vulnerability | Notes |
|---|--------------|-------|
| A01 | Broken Access Control | Verify all endpoints check permissions |
| A02 | Cryptographic Failures | Proper password hashing, token signing |
| A04 | Insecure Design | Threat modeling, security reviews |
| A06 | Vulnerable Components | Dependency scanning |
| A08 | Software Integrity | Signed releases, CI/CD security |
| A09 | Logging Failures | Security event logging |
| A10 | SSRF | Validate URLs, restrict outbound calls |

---

## Security Testing

### Automated Checks (P1)

```bash
# Add to CI pipeline

# Check for known vulnerabilities in dependencies
npm audit

# Check for security anti-patterns
npm run lint:security  # Custom ESLint rules
```

### ESLint Security Rules

```javascript
// eslint.config.js additions
{
  rules: {
    // Prevent dangerous patterns
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',

    // Angular-specific
    '@angular-eslint/template/no-any': 'error',
    '@angular-eslint/no-empty-lifecycle-method': 'error',
  }
}
```

### Manual Security Review Checklist

- [ ] Review authentication flow
- [ ] Test authorization bypass attempts
- [ ] Check for sensitive data in browser storage
- [ ] Verify CSP headers in production
- [ ] Test with browser security tools
- [ ] Review third-party dependencies

### Penetration Testing (P2)

Before production launch:
- [ ] Engage security team or external auditor
- [ ] Perform OWASP testing
- [ ] Document and remediate findings

---

## Security Incident Response

### If a Vulnerability is Found

1. **Assess severity** - Determine impact and scope
2. **Contain** - Disable affected features if needed
3. **Fix** - Develop and test patch
4. **Deploy** - Emergency release process
5. **Communicate** - Notify affected users if required
6. **Review** - Post-mortem and process improvement

### Contact

- Security issues: security@example.com
- Responsible disclosure: Follow company policy

---

## Implementation Roadmap

### Phase 1: MVP Security (P0)

1. Authentication service and interceptor
2. Route guards for protected pages
3. Basic authorization (admin/user)
4. HTTPS enforcement
5. Input validation on all forms

### Phase 2: Production Hardening (P1)

1. Full RBAC implementation
2. CSRF protection
3. CSP headers
4. Security logging
5. Rate limiting (backend)

### Phase 3: Compliance (P2)

1. Audit logging UI
2. Session management
3. Security testing automation
4. Penetration testing
5. Documentation for compliance

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Angular Security Guide](https://angular.io/guide/security)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
