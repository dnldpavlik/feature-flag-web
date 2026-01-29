# Shared UI Components

This directory contains reusable UI components used throughout the Feature Flag application.

## Component Overview

| Component | Purpose |
|-----------|---------|
| [Badge](#badge) | Status indicators and labels |
| [Breadcrumb](#breadcrumb) | Navigation path with optional dropdowns |
| [Button](#button) | Action buttons with variants and states |
| [Card](#card) | Container with padding and styling |
| [DataTable](#datatable) | Sortable data tables with custom columns |
| [EmptyState](#emptystate) | Placeholder for empty content |
| [FormField](#formfield) | Text inputs and textareas for forms |
| [Icon](#icon) | SVG icons |
| [LabeledSelect](#labeledselect) | Compact select for toolbars/filters |
| [NavItem](#navitem) | Sidebar navigation link |
| [NavSection](#navsection) | Grouped navigation section |
| [PageHeader](#pageheader) | Page title and description |
| [SearchInput](#searchinput) | Search field with icon and shortcut hint |
| [SelectField](#selectfield) | Select dropdown for forms |
| [StatCard](#statcard) | Metric display card |
| [Tabs](#tabs) | Tab navigation with keyboard support |
| [Toggle](#toggle) | On/off switch |
| [Toolbar](#toolbar) | Action bar with slots for filters and actions |
| [UserMenu](#usermenu) | User avatar with name/email |

---

## Components

### Badge

Status indicators and labels with semantic colors.

```html
<app-badge variant="success">Active</app-badge>
<app-badge variant="error">Failed</app-badge>
<app-badge variant="info" size="sm">Beta</app-badge>
<app-badge variant="warning" [dismissible]="true" (dismissed)="onDismiss()">
  Warning
</app-badge>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `variant` | `'success' \| 'warning' \| 'error' \| 'info' \| 'created' \| 'updated' \| 'deleted' \| 'toggled'` | `'info'` | Color variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size |
| `dismissible` | `boolean` | `false` | Show dismiss button |

**Outputs:**
| Output | Type | Description |
|--------|------|-------------|
| `dismissed` | `void` | Emitted when dismiss is clicked |

---

### Breadcrumb

Navigation path with optional selectable dropdowns.

```html
<app-breadcrumb
  [items]="[
    { label: 'Projects', route: '/projects' },
    { label: 'My Project', route: '/projects/123' },
    { label: 'Flags' }
  ]"
/>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | required | Array of breadcrumb items |

**Outputs:**
| Output | Type | Description |
|--------|------|-------------|
| `selectionChange` | `{ key: string; value: string }` | Emitted when a dropdown selection changes |

---

### Button

Action buttons with multiple variants, sizes, and states.

```html
<app-button variant="primary">Save</app-button>
<app-button variant="secondary" size="sm">Cancel</app-button>
<app-button variant="ghost" icon="plus">Add Item</app-button>
<app-button variant="danger" [loading]="isSaving">Delete</app-button>
<app-button variant="primary" [disabled]="!form.valid">Submit</app-button>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state (disables button) |
| `icon` | `IconName` | `undefined` | Icon to display before text |
| `iconSize` | `number` | `16` | Icon size in pixels |

---

### Card

Container component with configurable padding.

```html
<app-card>
  <h3>Card Title</h3>
  <p>Card content goes here.</p>
</app-card>

<app-card padding="lg">
  Large padding content
</app-card>

<app-card padding="none">
  No padding (for custom layouts)
</app-card>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding size |

---

### DataTable

Sortable data table with custom column templates.

```html
<app-ui-data-table
  [items]="flags()"
  ariaLabel="Feature flags"
  emptyText="No flags found."
>
  <ng-template appUiCol="name" header="Name" width="30%" let-item>
    <a [routerLink]="['/flags', item.id]">{{ item.name }}</a>
  </ng-template>

  <ng-template appUiCol="status" header="Status" [sortable]="false" let-item>
    <app-badge [variant]="item.enabled ? 'success' : 'error'">
      {{ item.enabled ? 'Enabled' : 'Disabled' }}
    </app-badge>
  </ng-template>

  <ng-template appUiCol="updatedAt" header="Updated" let-item>
    {{ item.updatedAt | date }}
  </ng-template>
</app-ui-data-table>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `items` | `T[]` | `[]` | Array of data items |
| `ariaLabel` | `string` | `'Data table'` | Accessibility label |
| `emptyText` | `string` | `'No rows.'` | Text when no items |
| `maxHeight` | `string \| number` | `'60vh'` | Max height before scroll |
| `initialSort` | `SortState \| null` | `null` | Initial sort state |

**Outputs:**
| Output | Type | Description |
|--------|------|-------------|
| `sortChange` | `SortState \| null` | Emitted when sort changes |

**Column Directive (`appUiCol`):**
| Input | Type | Description |
|-------|------|-------------|
| `appUiCol` | `string` | Column key |
| `header` | `string` | Column header text |
| `width` | `string` | Column width (e.g., `'20%'`) |
| `sortable` | `boolean` | Whether column is sortable (default: `true`) |

---

### EmptyState

Placeholder display when content is empty.

```html
<app-empty-state
  title="No flags found"
  message="Create your first feature flag to get started."
/>

<app-empty-state
  title="No results"
  message="Try adjusting your filters."
  size="sm"
/>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | `string` | required | Title text |
| `message` | `string` | required | Description text |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |

---

### FormField

Text input and textarea for reactive forms with label, hint, and error support.

```html
<app-form-field
  label="Email"
  type="email"
  placeholder="you@example.com"
  hint="We'll never share your email."
  [formControl]="emailControl"
/>

<app-form-field
  label="Description"
  type="textarea"
  [rows]="4"
  [error]="descriptionError()"
  [formControl]="form.controls.description"
/>

<app-form-field
  label="Password"
  type="password"
  [formControl]="form.controls.password"
/>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | required | Field label |
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'color' \| 'textarea'` | `'text'` | Input type |
| `placeholder` | `string` | `''` | Placeholder text |
| `hint` | `string` | `''` | Help text below input |
| `error` | `string \| null` | `''` | Error message |
| `disabled` | `boolean` | `false` | Disabled state |
| `rows` | `number` | `3` | Rows for textarea |
| `id` | `string` | auto | Custom ID for input |

**Reactive Forms:** Implements `ControlValueAccessor` - use with `[formControl]` or `formControlName`.

---

### Icon

SVG icon component with configurable size.

```html
<app-icon name="flag" />
<app-icon name="settings" [size]="24" />
<app-icon name="plus" size="16" />
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | `IconName` | required | Icon name |
| `size` | `number \| string` | `20` | Size in pixels |

**Available Icons:** `flag`, `settings`, `chart`, `users`, `folder`, `layers`, `list`, `search`, `plus`, `chevron-right`, `menu`, `check`, `x`, `info`, `warning`, `error`

---

### LabeledSelect

Compact select dropdown for toolbars and filters (not for forms).

```html
<app-labeled-select
  label="Environment"
  [options]="environmentOptions"
  [value]="selectedEnv()"
  (valueChange)="onEnvChange($event)"
/>

<app-labeled-select
  label="Status"
  [options]="[
    { value: 'all', label: 'All' },
    { value: 'enabled', label: 'Enabled' },
    { value: 'disabled', label: 'Disabled' }
  ]"
  [value]="statusFilter()"
  minWidth="120px"
  (valueChange)="onStatusChange($event)"
/>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | required | Label above select |
| `options` | `SelectOption[]` | required | Available options |
| `value` | `string` | `''` | Currently selected value |
| `minWidth` | `string` | `'140px'` | Minimum width |
| `disabled` | `boolean` | `false` | Disabled state |

**Outputs:**
| Output | Type | Description |
|--------|------|-------------|
| `valueChange` | `string` | Emitted when selection changes |

**When to use:** Toolbars, filter bars, compact UIs. For forms, use `SelectField` instead.

---

### NavItem

Sidebar navigation link with icon and active state.

```html
<app-nav-item
  label="Dashboard"
  route="/dashboard"
  icon="chart"
/>

<app-nav-item
  label="Development"
  route="/environments/dev"
  indicatorColor="#22c55e"
/>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | required | Display text |
| `route` | `string` | required | Router link |
| `icon` | `IconName` | `undefined` | Icon (mutually exclusive with indicator) |
| `indicatorColor` | `string` | `undefined` | Colored dot indicator |

---

### NavSection

Grouped navigation section with title.

```html
<app-nav-section title="Environments">
  <app-nav-item label="Development" route="/env/dev" indicatorColor="#22c55e" />
  <app-nav-item label="Staging" route="/env/staging" indicatorColor="#f59e0b" />
  <app-nav-item label="Production" route="/env/prod" indicatorColor="#ef4444" />
</app-nav-section>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | `string` | required | Section title |

---

### PageHeader

Page title with optional description.

```html
<app-page-header
  title="Feature Flags"
  description="Manage feature flags across environments."
/>

<app-page-header title="Settings" />
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | `string` | required | Page title |
| `description` | `string` | `undefined` | Subtitle/description |

---

### SearchInput

Search field with icon, placeholder, and keyboard shortcut hint.

```html
<app-search-input
  placeholder="Search flags..."
  [value]="searchTerm()"
  shortcutHint="/"
  (valueChange)="onSearch($event)"
  (searchSubmit)="onSearchSubmit($event)"
/>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `placeholder` | `string` | `'Search...'` | Placeholder text |
| `value` | `string` | `''` | Current value |
| `shortcutHint` | `string` | `undefined` | Keyboard shortcut to display |
| `disabled` | `boolean` | `false` | Disabled state |
| `ariaLabel` | `string` | `'Search'` | Accessibility label |

**Outputs:**
| Output | Type | Description |
|--------|------|-------------|
| `valueChange` | `string` | Emitted on input |
| `searchSubmit` | `string` | Emitted on Enter key |

**Methods:**
| Method | Description |
|--------|-------------|
| `focus()` | Programmatically focus the input |

---

### SelectField

Select dropdown for forms with label, hint, and error support.

```html
<app-select-field
  label="Type"
  [options]="typeOptions"
  placeholder="Select a type..."
  hint="Choose the data type for this flag."
  [error]="typeError()"
  [formControl]="form.controls.type"
/>

<app-select-field
  label="Priority"
  [options]="[
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical', disabled: true }
  ]"
  [formControl]="form.controls.priority"
/>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `label` | `string` | required | Field label |
| `options` | `SelectOption[]` | required | Available options |
| `placeholder` | `string` | `''` | Placeholder (shown as disabled first option) |
| `hint` | `string` | `''` | Help text below select |
| `error` | `string \| null` | `''` | Error message |
| `disabled` | `boolean` | `false` | Disabled state |
| `id` | `string` | auto | Custom ID |

**Reactive Forms:** Implements `ControlValueAccessor` - use with `[formControl]` or `formControlName`.

**When to use:** Forms with validation. For toolbars/filters, use `LabeledSelect` instead.

---

### StatCard

Metric display card showing a value and label.

```html
<app-stat-card [value]="42" label="Total Flags" />
<app-stat-card [value]="flagsEnabled()" label="Active" />
<app-stat-card value="99.9%" label="Uptime" />
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `value` | `string \| number` | required | The metric value |
| `label` | `string` | required | Description label |

---

### Tabs

Tab navigation with keyboard support (arrow keys, Home, End).

```html
<app-tabs
  [tabs]="[
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'targeting', label: 'Targeting', icon: 'users' },
    { id: 'history', label: 'History', icon: 'list', disabled: true }
  ]"
  [activeTabId]="activeTab()"
  (tabChange)="onTabChange($event)"
/>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `tabs` | `TabItem[]` | required | Array of tab definitions |
| `activeTabId` | `string` | required | Currently active tab ID |

**Outputs:**
| Output | Type | Description |
|--------|------|-------------|
| `tabChange` | `string` | Emitted with new tab ID |

**TabItem Interface:**
```typescript
interface TabItem {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
}
```

---

### Toggle

On/off switch control.

```html
<app-toggle
  [checked]="flag.enabled"
  label="Enable flag"
  (toggled)="onToggle($event)"
/>

<app-toggle
  [checked]="isEnabled()"
  [disabled]="!canEdit"
  (toggled)="onToggle($event)"
/>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `checked` | `boolean` | `false` | Current state |
| `label` | `string` | `undefined` | Accessibility label |
| `disabled` | `boolean` | `false` | Disabled state |

**Outputs:**
| Output | Type | Description |
|--------|------|-------------|
| `toggled` | `boolean` | Emitted with new state |

---

### Toolbar

Container for filters and actions with two slot areas.

```html
<app-toolbar>
  <ng-container toolbar-filters>
    <app-labeled-select label="Environment" [options]="envOptions" ... />
    <app-labeled-select label="Status" [options]="statusOptions" ... />
  </ng-container>

  <ng-container toolbar-meta>
    <span class="text-muted">{{ count }} items</span>
    <app-button variant="ghost">Export</app-button>
  </ng-container>
</app-toolbar>
```

**Slots:**
| Slot | Description |
|------|-------------|
| `toolbar-filters` | Left side - filters and search |
| `toolbar-meta` | Right side - counts and actions |

---

### UserMenu

User avatar with name and email display.

```html
<app-user-menu
  name="John Doe"
  email="john@example.com"
  (menuToggle)="openUserMenu()"
/>

<app-user-menu
  name="Jane Smith"
  email="jane@example.com"
  avatarUrl="/avatars/jane.jpg"
  [compact]="true"
  (menuToggle)="openUserMenu()"
/>
```

**Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | `string` | required | User's display name |
| `email` | `string` | required | User's email |
| `avatarUrl` | `string` | `undefined` | Avatar image URL |
| `compact` | `boolean` | `false` | Show avatar only |

**Outputs:**
| Output | Type | Description |
|--------|------|-------------|
| `menuToggle` | `void` | Emitted when clicked |

---

## Shared Types

### SelectOption

Used by `SelectField` and `LabeledSelect`:

```typescript
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

Import from: `@/app/shared/ui/select/select.types`

---

## Guidelines

### When to Use Which Component

| Scenario | Component |
|----------|-----------|
| Text input in a form | `FormField` |
| Dropdown in a form | `SelectField` |
| Dropdown in a toolbar/filter bar | `LabeledSelect` |
| On/off switch | `Toggle` |
| Action button | `Button` |
| Status indicator | `Badge` |
| Empty list placeholder | `EmptyState` |
| Data listing | `DataTable` |
| Filter/action bar | `Toolbar` |

### Accessibility

All components follow accessibility best practices:
- Proper ARIA attributes
- Keyboard navigation support
- Label associations
- Focus management
