# Feature Flag Management System - User Guide

A step-by-step guide to using the Feature Flag Management web application. This guide covers every feature available in the UI, organized by workflow.

> **Last updated:** 2026-02-08

---

## Table of Contents

- [Getting Started](#getting-started)
- [Navigation](#navigation)
- [Dashboard](#dashboard)
- [Feature Flags](#feature-flags)
- [Environments](#environments)
- [Projects](#projects)
- [Segments](#segments)
- [Audit Log](#audit-log)
- [Settings](#settings)

---

## Getting Started

### Launching the Application

1. Start the development server with `npm start`
2. Open your browser to `http://localhost:4200`
3. The app redirects to the **Dashboard** on first load

### Application Layout

The application has three main areas:

- **Header** (top): Breadcrumb navigation, global search, and the "Create Flag" button
- **Sidebar** (left): Main navigation links, environment list, and user menu
- **Main Content** (center): The active page

### Quick Search

Press `/` anywhere in the app to focus the search input in the header. Search filters the current page's list (flags, projects, environments, segments, or audit entries).

---

## Navigation

### Sidebar

The sidebar provides links to every section of the app:

| Section | Description |
|---------|-------------|
| Dashboard | Overview stats and recent activity |
| Flags | Create and manage feature flags |
| Projects | Organize flags into workspaces |
| Segments | Define user targeting groups |
| Audit | View change history |
| Settings | Profile, preferences, API keys, theme |
| Environments | Listed individually with color indicators |

Click any environment in the sidebar to navigate directly to its detail page.

### Breadcrumbs

The breadcrumb bar in the header shows your current location. It includes a dropdown to quickly switch projects or environments without leaving the current page.

### Toggling the Sidebar

Click the hamburger menu icon on the left side of the header to collapse or expand the sidebar.

---

## Dashboard

**Route:** `/dashboard`

The dashboard provides an at-a-glance overview of your feature flag system, scoped to the currently selected project and environment.

### Stat Cards

Four cards display key metrics:

| Card | Description |
|------|-------------|
| Total Flags | Number of flags in the selected project |
| Active | Flags enabled in the current environment |
| Inactive | Flags disabled in the current environment |
| Environments | Total number of environments |

### Recently Updated Flags

A table shows the most recently modified flags with their name, key, and description. Click any flag name to navigate to its detail page. Click "View All" to go to the full flag list.

### Empty State

If no flags exist yet, a prompt appears with a "Create Your First Flag" button that navigates to the flag creation page.

---

## Feature Flags

### Viewing Flags

**Route:** `/flags`

The flag list displays all flags in the currently selected project. Each row shows:

- **Name, key, and description**
- **Status toggle** to enable/disable the flag in the current environment
- **Current value** in the selected environment
- **Type badge** (boolean, string, number, or json)
- **Tags**
- **Last updated date**
- **Delete button** (visible when more than one flag exists)

### Filtering Flags

The toolbar above the flag list provides three filters:

| Filter | Options |
|--------|---------|
| Environment | Switch which environment's values are shown |
| Status | All, Enabled, Disabled |
| Type | All, Boolean, String, Number, JSON |

A count label shows how many flags match the current filters out of the total (e.g., "5 of 12 flags").

### Creating a Flag

**Route:** `/flags/create`

1. Click the **"Create Flag"** button in the header (available from any page)
2. Fill in the form:
   - **Name**: Display name for the flag
   - **Key**: Unique identifier (auto-generated from name, but editable)
   - **Description**: Optional explanation of what the flag controls
   - **Type**: Boolean, String, Number, or JSON
   - **Default Value**: The initial value (input varies by type)
   - **Tags**: Comma-separated labels for organization
3. Under **"Enable in Environments"**, check the environments where this flag should be active immediately
4. Click **"Create Flag"** to save, or **"Cancel"** to go back

### Viewing Flag Details

**Route:** `/flags/:id`

Click any flag name in the list to view its detail page. The detail page has three sections:

**Details Card**
- Edit the flag's name, description, and tags
- Changes are saved when you click **"Save Changes"**

**Default Value Card**
- View or edit the flag's default value
- Input type matches the flag type (toggle for boolean, text input for string, number input for number, textarea for JSON)

**Environment Overrides**
- A table showing each environment with:
  - **Enabled toggle**: Turn the flag on/off per environment
  - **Value input**: Set an environment-specific value that overrides the default
- Changes take effect immediately when toggling; value changes require saving

### Toggling a Flag

You can toggle a flag's enabled state from two places:

1. **Flag list**: Click the toggle switch in the Status column
2. **Flag detail**: Click the toggle switch next to each environment in the Environment Overrides table

### Deleting a Flag

1. From the **flag list**: Click the **"Delete"** button in the flag's row
2. From the **flag detail**: Click the **"Delete"** button in the page header
3. Confirm the deletion in the dialog

The delete button is hidden when only one flag remains in the system.

---

## Environments

Environments represent deployment stages (e.g., Development, Staging, Production) where feature flags can have different values and enabled states.

### Viewing Environments

**Route:** `/environments`

The environment list displays all environments in a table with:

- **Name** with color indicator dot
- **Key** (unique identifier)
- **Status badges**: "Default" and/or "Selected"
- **Last updated date**
- **Action buttons**: Select, Make Default, Delete

### Creating an Environment

1. Scroll to the **"New Environment"** form at the bottom of the environment list page
2. Fill in:
   - **Name**: Display name (e.g., "QA")
   - **Key**: Unique identifier (e.g., "qa")
   - **Color**: Pick a color for visual identification
3. Click **"Add Environment"**

The new environment is automatically assigned environment values for all existing flags.

### Selecting an Environment

The selected environment determines which flag values are displayed throughout the app (dashboard stats, flag list toggles, etc.).

To change the selected environment:

1. Click the **"Select"** button next to any environment in the list, **or**
2. Click an environment name in the sidebar

Your selection is persisted across page refreshes.

### Setting a Default Environment

The default environment is auto-selected when you first load the app or when your selected environment is deleted.

1. Click the **"Make Default"** button next to any non-default environment
2. The "Default" badge moves to the chosen environment

### Viewing Environment Details

**Route:** `/environments/:id`

Click any environment name in the list to view its detail page:

- **Overview card**: Environment status badges and color display
- **Details card**: Created and last updated timestamps
- **Flags in this environment**: A table showing all flags with their enabled state and current value in this environment

From the detail page you can also Select, Make Default, or Edit the environment.

### Deleting an Environment

1. Click the **"Delete"** button in the environment's row in the list
2. A confirmation dialog appears showing:
   - How many flags have values in this environment
   - A warning that the action cannot be undone
3. Click **"Delete Environment"** to confirm, or **"Cancel"** to dismiss

**Important notes:**
- The Delete button only appears when more than one environment exists (you cannot delete the last environment)
- Deleting an environment removes all flag values associated with it from every flag
- If you delete the currently selected environment, the app falls back to the default environment (or the first remaining one)

---

## Projects

Projects are workspaces that group related feature flags together. Each flag belongs to exactly one project.

### Viewing Projects

**Route:** `/projects`

The project list displays all projects with:

- **Name and description**
- **Key** (unique identifier)
- **Status badges**: "Default" and/or "Selected"
- **Last updated date**
- **Action buttons**: Select, Make Default, Delete

### Creating a Project

1. Scroll to the **"New Project"** form at the bottom of the project list page
2. Fill in:
   - **Name**: Display name (e.g., "Mobile App")
   - **Key**: Unique identifier (e.g., "mobile-app")
   - **Description**: Optional explanation
3. Click **"Add Project"**

### Selecting a Project

The selected project determines which flags appear in the flag list and dashboard.

Click the **"Select"** button next to any project to make it the active context. Your selection is persisted across page refreshes.

### Setting a Default Project

Click the **"Make Default"** button next to any non-default project. The default is auto-selected on first load.

### Viewing Project Details

**Route:** `/projects/:id`

Click any project name in the list to view its detail page:

- **Overview card**: Status badges and description
- **Details card**: Created and last updated timestamps

From the detail page you can Select, Make Default, or Delete the project.

### Deleting a Project

1. Click the **"Delete"** button in the project's row
2. A confirmation dialog appears showing:
   - How many flags belong to this project (if any)
   - A warning that all flags will be permanently deleted
3. Click **"Delete Project"** to confirm

**Important notes:**
- The Delete button only appears when more than one project exists
- Deleting a project also deletes all flags that belong to it
- If you delete the currently selected project, the app falls back to the default project

---

## Segments

Segments define groups of users that can be targeted with feature flags. Each segment contains rules that determine membership based on user attributes.

### Viewing Segments

**Route:** `/segments`

The segment list shows all segments with:

- **Name and description**
- **Key** (unique identifier)
- **Rule count**: Number of targeting rules defined
- **Last updated date**
- **Delete button**

### Creating a Segment

1. Scroll to the **"New Segment"** form at the bottom of the segment list page
2. Fill in:
   - **Name**: Display name (e.g., "Beta Users")
   - **Key**: Unique identifier (e.g., "beta-users")
   - **Description**: Optional explanation
3. Click **"Add Segment"**

### Viewing and Editing Segment Details

**Route:** `/segments/:id`

Click any segment name to view its detail page:

**Details Section**
- View the segment's name, key, and description
- Click **"Edit"** to modify these fields, then **"Save"** or **"Cancel"**

**Rules Section**
- Shows all targeting rules with their attribute, operator, and value
- Each rule can be edited or removed individually

### Managing Segment Rules

Rules define who belongs to a segment using attribute-operator-value conditions.

**Adding a Rule:**

1. On the segment detail page, locate the **"Add Rule"** area
2. Select an **Attribute** (email, country, plan, role, company, or custom)
3. Select an **Operator**:
   - equals / does not equal
   - contains / does not contain
   - starts with / ends with
   - is one of / is not one of (comma-separated values)
4. Enter a **Value**
5. Click **"Add Rule"**

**Editing a Rule:**
- Click **"Edit"** on any existing rule to modify its operator or value
- Click **"Save"** to apply changes

**Removing a Rule:**
- Click **"Remove"** on any rule to delete it from the segment

### Deleting a Segment

Click the **"Delete"** button in the segment's row on the list page.

---

## Audit Log

**Route:** `/audit`

The audit log provides a read-only history of all changes made in the system.

### Viewing Entries

Each audit entry shows:

| Column | Description |
|--------|-------------|
| Timestamp | When the action occurred |
| Action | What happened (created, updated, deleted, toggled) |
| Resource | The type and name of the affected item |
| User | Who performed the action |
| Details | A description of what changed |

### Filtering Entries

Use the toolbar filters to narrow down the log:

| Filter | Options |
|--------|---------|
| Action | All, Created, Updated, Deleted, Toggled |
| Resource Type | All, Flags, Environments, Projects, Segments |

A count label shows how many entries match the current filters.

### Searching Entries

Use the global search bar to filter audit entries by text content across all fields.

---

## Settings

**Route:** `/settings`

Settings are organized into four tabs:

### Profile Tab

Manage your user account information:

- **Name**: Update your display name
- **Email**: Update your email address
- **Password**: Change your password (requires current password and confirmation)

### Preferences Tab

Configure application behavior:

- **Default Environment**: Choose which environment is selected by default
- **Notification Preferences**: Toggle email notifications for flag changes
- **Email Digest Frequency**: Set how often digest emails are sent (daily, weekly, monthly)

### API Keys Tab

Manage API keys for programmatic access:

**Creating an API Key:**
1. Enter a **name** for the key
2. Select **scopes**: Read Flags, Write Flags, or Admin
3. Click **"Create API Key"**
4. Copy the generated secret immediately (it is shown only once)

**Revoking an API Key:**
- Click **"Revoke"** next to any active key to disable it permanently

### Theme Tab

Customize the visual appearance:

- **Theme**: Light, Dark, or System (follows OS preference)
- **Reduced Motion**: Disable animations for accessibility
- **Compact Mode**: Reduce spacing for information density

---

## Tips and Best Practices

### Organizing Flags

- Use **projects** to group flags by product area or team
- Apply **tags** to flags for cross-cutting categories (e.g., "experiment", "ops", "frontend")
- Use **descriptive names** and fill in descriptions so teammates can understand each flag's purpose

### Environment Strategy

- Keep the **development** environment as your default for safe experimentation
- Use **staging** to validate flag behavior before production
- Enable flags in **production** only after testing in lower environments
- Use distinct **colors** for each environment so they are easy to distinguish visually

### Audit Trail

- The audit log automatically tracks all flag, environment, project, and segment changes
- Use the resource type filter to see all changes to a specific entity type
- Review the audit log before and after production deployments to verify changes

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Focus the search input |
