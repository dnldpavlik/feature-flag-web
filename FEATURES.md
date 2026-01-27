# Feature Flag Management System - Features

Comprehensive feature catalog across all platform components: Rust API backend, Angular web UI, and Android mobile app.

> **Last updated:** 2026-01-27
> **Status legend:** Done | In Progress | Planned

---

## Table of Contents

- [Core Feature Flag Operations](#core-feature-flag-operations)
- [Environment Management](#environment-management)
- [Project Management](#project-management)
- [Segment Management](#segment-management)
- [Targeting Rules](#targeting-rules)
- [User Settings & Preferences](#user-settings--preferences)
- [Audit Log](#audit-log)
- [Dashboard & Analytics](#dashboard--analytics)
- [Search & Navigation](#search--navigation)
- [API Capabilities](#api-capabilities)
- [Web UI Features](#web-ui-features)
- [Mobile App (Android)](#mobile-app-android)
- [SDK & Integration Points](#sdk--integration-points)
- [User Management & Permissions](#user-management--permissions)

---

## Core Feature Flag Operations

| Feature | API | Web UI | Status |
|---------|-----|--------|--------|
| List all flags | `GET /api/v1/flags` | FlagListComponent | Done |
| Create flag | `POST /api/v1/flags` | FlagCreateComponent | Done |
| View flag detail | `GET /api/v1/flags/{id}` | FlagDetailComponent | Done |
| Get flag by key | `GET /api/v1/flags/key/{key}` | - | Done |
| Update flag | `PUT /api/v1/flags/{id}`, `PATCH /api/v1/flags/{id}` | FlagDetailComponent | Done |
| Delete flag | `DELETE /api/v1/flags/{id}` | FlagListComponent, FlagDetailComponent | Done |
| Toggle flag per environment | `PATCH /api/v1/flags/{id}/environments/{env_id}` | FlagListComponent | Done |
| Update environment-specific value | `PATCH /api/v1/flags/{id}/environments/{env_id}` | FlagDetailComponent | Done |
| Evaluate flag | `GET /api/v1/evaluate/{key}` | - | Done |
| Bulk flag operations | - | - | Planned |
| Flag archiving | - | - | Planned |
| Flag scheduling (kill dates) | - | - | Planned |

### Flag Types Supported

| Type | API | Web UI | Status |
|------|-----|--------|--------|
| Boolean | Supported | Supported | Done |
| String | Supported | Supported | Done |
| Number | Supported | Supported | Done |
| JSON | Supported | Supported (with validation) | Done |

### Flag Creation Details

- **Web UI wizard:** Name, auto-generated key (editable), description, type selection, per-environment enabled state, tags (comma-separated)
- **API:** Accepts `name`, `key`, `description`, `flagType`, `defaultValue`, `tags`, `initialEnabledEnvironments`
- **Validation:** Key uniqueness enforced at API level (PostgreSQL unique constraint)

---

## Environment Management

| Feature | API | Web UI | Status |
|---------|-----|--------|--------|
| List environments | `GET /api/v1/environments` | EnvironmentListComponent | Done |
| Create environment | `POST /api/v1/environments` | EnvironmentListComponent | Done |
| View environment detail | `GET /api/v1/environments/{id}` | EnvironmentDetailComponent | Done |
| Update environment | `PATCH /api/v1/environments/{id}` | - | API Done, UI Planned |
| Set default environment | `POST /api/v1/environments/{id}/default` | EnvironmentListComponent | Done |
| Delete environment | - | - | Planned |
| Environment color coding | Stored in DB | Displayed in list and sidebar | Done |
| Environment ordering | Stored in DB (`order` column) | Sorted display | Done |
| View flags per environment | - | EnvironmentDetailComponent | Done |
| Copy configuration between environments | - | - | Planned |
| API key rotation per environment | - | - | Planned |

### Implementation Details

- **API:** Auto-creates `flag_environment_values` entries for all existing flags when a new environment is created
- **Database:** 3 default environments seeded: Development (green, order 0, default), Staging (orange, order 1), Production (red, order 2)
- **Web UI:** Color picker on creation, sorted display, default indicator

---

## Project Management

| Feature | API | Web UI | Status |
|---------|-----|--------|--------|
| List projects | - | ProjectListComponent | UI Done, API Planned |
| Create project | - | ProjectListComponent | UI Done, API Planned |
| View project detail | - | ProjectDetailComponent | UI Done, API Planned |
| Set default project | - | ProjectListComponent | UI Done, API Planned |
| Delete project | - | ProjectListComponent | UI Done, API Planned |
| Project search/filter | - | ProjectListComponent | UI Done |
| Project switcher (header) | - | BreadcrumbComponent | UI Done |

### Implementation Notes

- Web UI uses local mock store with 2 sample projects (Default Project, Growth Experiments)
- API does not yet have project endpoints -- flags are currently global
- Prevents deleting the last remaining project in the UI

---

## Segment Management

| Feature | API | Web UI | Status |
|---------|-----|--------|--------|
| List segments | - | SegmentListComponent | UI Done, API Planned |
| Create segment | - | SegmentListComponent | UI Done, API Planned |
| View segment detail | - | SegmentDetailComponent | UI Done, API Planned |
| Edit segment (name, key, description) | - | SegmentDetailComponent | UI Done, API Planned |
| Delete segment | - | SegmentListComponent | UI Done, API Planned |
| Add rules to segment | - | RuleBuilderComponent | UI Done, API Planned |
| Edit rules | - | RuleRowComponent | UI Done, API Planned |
| Remove rules | - | RuleRowComponent | UI Done, API Planned |
| Segment search/filter | - | SegmentListComponent | UI Done |
| Link segments to flags | - | - | Planned |
| Segment membership preview | - | - | Planned |
| Bulk user import | - | - | Planned |

### Segment Rule Configuration

Rules define membership criteria using attribute-operator-value triples:

**Supported attributes:** email, country, plan, role, company, custom (user-defined)

**Supported operators:**

| Operator | Label | Value Type |
|----------|-------|------------|
| `equals` | equals | string |
| `not_equals` | does not equal | string |
| `contains` | contains | string |
| `not_contains` | does not contain | string |
| `starts_with` | starts with | string |
| `ends_with` | ends with | string |
| `in` | is one of | string[] (comma-separated input) |
| `not_in` | is not one of | string[] (comma-separated input) |

### Implementation Details

- Immutable state updates via pure utility functions (`addRuleToSegment`, `updateRuleInSegment`, `removeRuleFromSegment`)
- Rule IDs auto-generated with `rule_` prefix
- Timestamps tracked per rule (`createdAt`, `updatedAt`)
- Mock data: 2 segments (Beta Testers, Internal Users) with sample rules

---

## Targeting Rules

| Feature | API | Web UI | Status |
|---------|-----|--------|--------|
| Segment-based targeting rules | - | RuleBuilderComponent (segments) | Done |
| Flag-level targeting rules | - | - | Planned |
| Percentage rollout | - | - | Planned |
| User-specific targeting | - | - | Planned |
| Rule ordering/priority | - | - | Planned |
| Rule testing/preview | - | - | Planned |
| Multi-condition rules (AND logic) | - | - | Planned |
| Default rule (fallback) | - | - | Planned |

---

## User Settings & Preferences

| Feature | API | Web UI | Status |
|---------|-----|--------|--------|
| Settings page with tabs | - | SettingsPageComponent | Done |
| User profile (name, email) | - | UserProfileTabComponent | Done |
| Change password | - | UserProfileTabComponent | Done |
| Default environment preference | - | PreferencesTabComponent | Done |
| Notification preferences | - | PreferencesTabComponent | Done |
| Email digest frequency | - | PreferencesTabComponent | Done |
| Theme selection (light/dark/system) | - | ThemeTabComponent | Done |
| Reduced motion preference | - | ThemeTabComponent | Done |
| Compact mode | - | ThemeTabComponent | Done |
| API key management | - | ApiKeysTabComponent | Done |
| API key creation with scopes | - | ApiKeysTabComponent | Done |
| API key revocation | - | ApiKeysTabComponent | Done |
| Copy API key secret | - | ApiKeysTabComponent | Done |

### API Key Scopes

| Scope | Description |
|-------|-------------|
| `read:flags` | Read-only access to flags |
| `write:flags` | Create and modify flags |
| `admin` | Full administrative access |

### Implementation Notes

- Settings are managed via local SettingsStore (no API persistence yet)
- API key secrets shown only once on creation
- Theme mode computed from system preference when set to "system"
- Password change validates current password match and new password confirmation

---

## Audit Log

| Feature | API | Web UI | Status |
|---------|-----|--------|--------|
| View audit entries | - | AuditListComponent | UI Done, API Planned |
| Filter by action type | - | AuditListComponent | UI Done |
| Filter by resource type | - | AuditListComponent | UI Done |
| Search audit entries | - | AuditListComponent | UI Done |
| Audit entry detail | - | - | Planned |
| Before/after diff view | - | - | Planned |
| Export audit log | - | - | Planned |
| Immutable log storage | - | - | Planned |

### Tracked Actions

| Action | Description |
|--------|-------------|
| `created` | Resource was created |
| `updated` | Resource was modified |
| `deleted` | Resource was removed |
| `toggled` | Flag was enabled/disabled |

### Tracked Resource Types

`flag`, `segment`, `environment`, `project`

Each entry records: resource name, action, resource type, user, details string, timestamp.

---

## Dashboard & Analytics

| Feature | API | Web UI | Status |
|---------|-----|--------|--------|
| Dashboard overview | - | DashboardComponent | Done |
| Total flags count | - | DashboardComponent | Done |
| Active/inactive flag counts | - | DashboardComponent | Done |
| Total environments count | - | DashboardComponent | Done |
| Recent flags list | - | DashboardComponent | Done |
| Search integration | - | DashboardComponent | Done |
| Evaluation volume charts | - | - | Planned |
| Variation distribution | - | - | Planned |
| Unique users per variation | - | - | Planned |
| Error rate tracking | - | - | Planned |
| Latency metrics (p50/p95/p99) | - | - | Planned |
| Time range selection | - | - | Planned |
| CSV export | - | - | Planned |

---

## Search & Navigation

| Feature | API | Web UI | Status |
|---------|-----|--------|--------|
| Global search input | - | SearchInputComponent | Done |
| Search across flags | - | FlagListComponent | Done |
| Search across segments | - | SegmentListComponent | Done |
| Search across projects | - | ProjectListComponent | Done |
| Search across environments | - | EnvironmentListComponent | Done |
| Search across audit entries | - | AuditListComponent | Done |
| Breadcrumb navigation | - | BreadcrumbComponent | Done |
| Sidebar navigation | - | SidebarComponent | Done |
| Flag status filter | - | FlagListComponent | Done |
| Flag type filter | - | FlagListComponent | Done |
| Keyboard shortcut (Cmd+K) | - | - | Planned |
| Saved filter presets | - | - | Planned |
| URL-reflected filters | - | - | Planned |

---

## API Capabilities

| Feature | Endpoint | Status |
|---------|----------|--------|
| Health check | `GET /health` | Done |
| Flag CRUD | `GET/POST/PUT/PATCH/DELETE /api/v1/flags/*` | Done |
| Flag lookup by key | `GET /api/v1/flags/key/{key}` | Done |
| Environment CRUD | `GET/POST/PATCH /api/v1/environments/*` | Done |
| Set default environment | `POST /api/v1/environments/{id}/default` | Done |
| Environment-specific flag values | `PATCH /api/v1/flags/{id}/environments/{env_id}` | Done |
| Flag evaluation | `GET /api/v1/evaluate/{key}` | Done |
| Data backup/export | `GET /api/v1/backup` | Done |
| CORS configuration | Configurable via `CORS_ORIGINS` | Done |
| Request logging/tracing | Tower HTTP TraceLayer | Done |
| Error handling | Typed error responses (400, 404, 500) | Done |
| Database migrations | SQLx migrate (3 migrations) | Done |
| Seed file execution | Configurable via `RUN_SEEDS` | Done |
| Authentication/authorization | - | Planned |
| Rate limiting | - | Planned |
| Pagination | - | Planned |
| Webhook delivery | - | Planned |
| SDK endpoint | - | Planned |
| Batch evaluation | - | Planned |
| Audit logging API | - | Planned |
| Project API endpoints | - | Planned |
| Segment API endpoints | - | Planned |

### Database Architecture

- **PostgreSQL** with SQLx (async, compile-time checked queries)
- **In-memory repository** for testing/development
- **Repository pattern** with `FlagRepository` trait for swappable implementations
- **Connection pooling** (max 10 connections, 5s timeout)
- **3 migrations:** Initial schema, environment support, web UI contract alignment

### Configuration (Environment Variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/feature_flags` | PostgreSQL connection |
| `API_HOST` | `127.0.0.1` | Server bind address |
| `API_PORT` | `3000` | Server port |
| `RUN_SEEDS` | `false` | Execute seed SQL on startup |
| `SEEDS_DIR` | `./seeds` | Seed files directory |
| `CORS_ORIGINS` | `*` | Allowed origins (comma-separated) |

---

## Web UI Features

### Shared UI Component Library

| Component | Description | Status |
|-----------|-------------|--------|
| ButtonComponent | Variants: primary, secondary, tertiary, danger, ghost. Sizes: sm, md, lg | Done |
| TabsComponent | Keyboard-navigable tabs with disabled support | Done |
| LabeledSelectComponent | Select dropdown with label | Done |
| BreadcrumbComponent | Navigation breadcrumbs with project selector | Done |
| SearchInputComponent | Global search field | Done |
| IconComponent | SVG icon display | Done |
| EmptyStateComponent | Empty state messaging | Done |
| StatCardComponent | Statistics display card | Done |
| NavItemComponent | Sidebar navigation item | Done |
| NavSectionComponent | Sidebar section divider | Done |
| UserMenuComponent | User profile menu | Done |

### Layout

| Component | Description | Status |
|-----------|-------------|--------|
| HeaderComponent | Breadcrumbs, search, create button, menu toggle | Done |
| SidebarComponent | Navigation, environment links, user menu | Done |
| AppComponent | Shell with header, sidebar, router outlet | Done |

### Architecture

- **Framework:** Angular 20 with standalone components
- **State:** Signals-first (signal, computed, effect)
- **Routing:** Lazy-loaded feature routes
- **Styling:** SCSS with BEM methodology
- **Change Detection:** OnPush throughout
- **Testing:** Jest with 100% coverage on feature code
- **Build:** Angular CLI with component style budgets

### Shared Utilities

| Utility | Functions | Status |
|---------|-----------|--------|
| `id.utils.ts` | `createId(prefix)`, `createTimestamp()` | Done |
| `search.utils.ts` | `matchesSearch()`, `highlightParts()` | Done |
| `url.utils.ts` | `toKey()`, `getSectionLabel()` | Done |
| `segment-rule.utils.ts` | `createSegmentRule()`, `addRuleToSegment()`, `updateRuleInSegment()`, `removeRuleFromSegment()`, `validateRuleInput()`, `formatRuleValue()`, `parseArrayValue()`, `getOperatorLabel()` | Done |
| `flag-format.utils.ts` | `formatFlagValue()`, `formatDisplayValue()`, `parseValueForType()`, `validateJsonObject()` | Done |
| `flag-value.utils.ts` | `isEnabledInEnvironment()`, `getEffectiveValue()`, `getDefaultForType()` | Done |

---

## Mobile App (Android)

| Feature | Status |
|---------|--------|
| Project directory created | Done |
| Android project setup | Planned |
| Flag list view | Planned |
| Flag toggle | Planned |
| Environment switching | Planned |
| Push notifications | Planned |
| Offline flag caching | Planned |
| SDK integration | Planned |

> The Android app directory (`feature-flags-android`) exists but contains no code. Development has not started.

---

## SDK & Integration Points

| Feature | Status |
|---------|--------|
| Server-side SDK (Rust/Go/Python/Node) | Planned |
| Client-side SDK (JavaScript/React) | Planned |
| Mobile SDK (Android/iOS) | Planned |
| REST API evaluation endpoint | Done |
| Streaming/SSE updates | Planned |
| Webhook system | Planned |
| Slack integration | Planned |
| GitHub integration | Planned |
| Jira integration | Planned |
| DataDog metrics export | Planned |
| PagerDuty incident toggles | Planned |

---

## User Management & Permissions

| Feature | Status |
|---------|--------|
| User profile display | Done (UI) |
| Password management | Done (UI) |
| API key management | Done (UI) |
| Authentication (login/signup) | Planned |
| Role-based access control | Planned |
| Team/organization management | Planned |
| Invite users by email | Planned |
| Session management | Planned |
| 2FA/MFA | Planned |
| SSO (SAML/OIDC) | Planned |

### Planned Roles

| Role | Permissions |
|------|-------------|
| Owner | Full access, organization deletion |
| Admin | Manage users, projects, environments |
| Developer | Create/edit flags and targeting |
| Viewer | Read-only access |

---

## Feature Count Summary

| Category | Done | In Progress | Planned | Total |
|----------|------|-------------|---------|-------|
| Flag Operations | 11 | 0 | 2 | 13 |
| Environments | 8 | 0 | 3 | 11 |
| Projects | 7 | 0 | 0 | 7 |
| Segments | 10 | 0 | 3 | 13 |
| Targeting Rules | 1 | 0 | 7 | 8 |
| Settings | 14 | 0 | 0 | 14 |
| Audit Log | 4 | 0 | 4 | 8 |
| Dashboard | 6 | 0 | 7 | 13 |
| Search & Nav | 10 | 0 | 3 | 13 |
| API | 14 | 0 | 10 | 24 |
| Web UI Components | 14 | 0 | 0 | 14 |
| Mobile | 1 | 0 | 7 | 8 |
| SDK & Integrations | 1 | 0 | 10 | 11 |
| User Management | 3 | 0 | 7 | 10 |
| **Total** | **104** | **0** | **63** | **167** |
