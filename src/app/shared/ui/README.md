# Shared UI Components

Most shared UI components have been migrated to the `@watt/ui` npm package (private GitLab registry).

## Import Pattern

```typescript
import { ButtonComponent, DataTableComponent, UiColDirective, ToastService, IconName, SelectOption } from '@watt/ui';
```

All `@watt/ui` components use the `ui-*` selector prefix (e.g., `<ui-button>`, `<ui-card>`, `<ui-data-table>`).

## Local-Only Components

These components remain local because they are app-specific:

| Component | Selector | Purpose |
|-----------|----------|---------|
| `LogoIconComponent` | `app-logo-icon` | App branding SVG |
| `FlagsEmptyIconComponent` | `app-flags-empty-icon` | Empty state illustration SVG |

Additionally, `AuditBadgeComponent` lives in `features/audit/components/audit-badge/` (selector: `app-audit-badge`) with audit-specific variants (created, updated, deleted, toggled).

## Data Table Directive

The `UiColDirective` from `@watt/ui` uses selector `ng-template[uiCol]`. In templates:

```html
<ng-template uiCol="name" header="Name" let-item>{{ item.name }}</ng-template>
```

## Setup

The `@watt/ui` package is installed from a private GitLab npm registry. Requires `GITLAB_TOKEN` environment variable:

```bash
export GITLAB_TOKEN=<your-gitlab-personal-access-token>
npm install
```

Registry configuration is in `.npmrc` at the project root.
