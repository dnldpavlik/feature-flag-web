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
| Authentication | Complete | Keycloak OIDC/PKCE via keycloak-angular |
| Authorization | Complete | Role-based guards (admin/user) via Keycloak roles |
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

### Implementation: Complete (Keycloak OIDC/PKCE)

Authentication is handled by **Keycloak** via `keycloak-angular` (v21) and `keycloak-js` (v26). The app uses `login-required` mode, redirecting unauthenticated users to the Keycloak login page.

#### Configuration

```typescript
// app.config.ts
provideKeycloak({
  config: environment.keycloak,  // { url, realm, clientId }
  initOptions: { onLoad: 'login-required' },
  providers: [AutoRefreshTokenService, UserActivityService],
  features: [
    withAutoRefreshToken({ sessionTimeout: 300000, onInactivityTimeout: 'logout' }),
  ],
})
```

#### AuthService (`core/auth/auth.service.ts`)

Wraps the Keycloak instance with Angular signals:

- `isAuthenticated: Signal<boolean>` — reactive auth state from Keycloak events
- `userProfile: Signal<UserProfile | null>` — loaded via `keycloak.loadUserProfile()`
- `roles: Signal<string[]>` — combined realm + client roles
- `token: Signal<string | undefined>` — current access token
- `login()`, `logout()`, `hasRole()`, `isAdmin()`

#### Route Guards

- **`authGuard`** — redirects to Keycloak login if not authenticated
- **`roleGuard`** — checks Keycloak client/realm roles against route `data.role`; redirects to `/dashboard` if lacking required role

#### Bearer Token Interceptor

`keycloak-angular`'s `includeBearerTokenInterceptor` automatically attaches the Bearer token to requests matching `/api/` URL pattern.

### Implementation Checklist

- [x] Integrate Keycloak via `keycloak-angular` with `login-required`
- [x] Create `AuthService` wrapping Keycloak with Angular signals
- [x] Create `authGuard` for protected routes
- [x] Create `roleGuard` for admin-only routes
- [x] Bearer token attachment via `includeBearerTokenInterceptor`
- [x] Automatic token refresh via `withAutoRefreshToken`
- [x] Handle 401 in error interceptor ("Session expired")
- [x] Logout clears Keycloak session and redirects
- [x] User profile and roles loaded reactively via signals

### Security Rules

1. **Tokens managed by Keycloak** - No manual localStorage/sessionStorage handling
2. **OIDC/PKCE flow** - Secure browser-based authentication
3. **Automatic token refresh** - `withAutoRefreshToken` refreshes before expiry
4. **Inactivity timeout** - 5-minute session timeout with automatic logout
5. **Validate tokens on every request** - Backend responsibility (Keycloak JWT validation)

---

## Authorization

### Implementation: Complete (Keycloak Role-Based)

Authorization uses Keycloak roles (client + realm) checked via `roleGuard`.

#### Current Roles

| Role | Source | Access |
|------|--------|--------|
| `admin` | Keycloak client role (`feature-flags-ui`) | All routes including Settings and Environments |
| `user` | Default | All routes except Settings and Environments |

#### Implementation

- **`roleGuard`** reads `keycloak.resourceAccess` and `keycloak.realmAccess` directly
- **Nav filtering** — `AppComponent` filters `NAV_ITEMS` by `authService.isAdmin()`, hiding admin-only items
- **Route data** — admin routes have `data: { role: 'admin' }` and use `[authGuard, roleGuard]`

### Implementation Checklist

- [x] Define roles in Keycloak (admin, user)
- [x] Create `roleGuard` checking route `data.role` against Keycloak roles
- [x] Hide nav items based on roles (`adminOnly` flag on NavItem)
- [x] Redirect unauthorized users to `/dashboard`
- [ ] Create granular permission system (future: developer, viewer roles)
- [ ] Create `HasPermissionDirective` for template use (future)
- [ ] Create unauthorized page (future)

### Security Rules

1. **Always verify permissions on backend** - Frontend guards are for UX only
2. **Use least privilege principle** - Default to minimal permissions
3. **Environment-scoped permissions** - Production access should be restricted (future)
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
| A01 | Broken Access Control | Route guards (authGuard, roleGuard), Keycloak roles | Complete |
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

### Phase 1: MVP Security (P0) — Complete

1. ~~Authentication service and interceptor~~ — Keycloak OIDC via keycloak-angular
2. ~~Route guards for protected pages~~ — authGuard + roleGuard
3. ~~Basic authorization (admin/user)~~ — Keycloak role-based
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
