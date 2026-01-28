# TODO - Feature Flag UI

Development task tracker organized by phase and priority.

## Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked
- 🔴 P0 - Critical path
- 🟡 P1 - Important
- 🟢 P2 - Nice to have

---

## Phase 1: Foundation (Weeks 1-2)

### Project Setup 🔴

- [x] Initialize Angular 20 project with standalone components
- [x] Configure DevContainer environment
- [x] Set up Jest testing framework
- [x] Configure Angular Testing Library
- [x] Set up Playwright for E2E tests
- [x] Configure ESLint with strict rules
- [x] Configure Prettier
- [ ] Set up Husky pre-commit hooks
- [x] Configure path aliases (@ for src)
- [x] Set up environment configuration system
- [x] Create initial CI/CD pipeline configuration

### Core Infrastructure 🔴

- [x] Implement app shell (header, sidebar, main content area)
- [x] Set up routing structure with lazy loading
- [ ] Create base API client service with error handling
- [ ] Implement HTTP interceptor for auth tokens
- [ ] Implement HTTP interceptor for error handling
- [ ] Create global loading indicator service
- [ ] Set up toast/notification service
- [ ] Implement theme service (light/dark mode)
- [ ] Create responsive breakpoint service

### Authentication 🔴

- [ ] Create auth service interface
- [ ] Implement JWT token handling
- [ ] Create auth guard for protected routes
- [ ] Implement login page/flow
- [ ] Handle token refresh
- [ ] Create logged-in user state
- [ ] Implement logout functionality

### Layout Components 🔴

Components extracted from `app.html` shell:

- [x] **Sidebar** - Full sidebar with logo, navigation, environments, user menu
- [x] **Header** - Top bar with menu toggle, breadcrumb, search, actions

### Shared UI Components 🔴

Components extracted from `app.html`:

- [x] **StatCard** - Stats display card with value and label
- [x] **Icon** - Centralized icon component to replace inline SVGs
- [x] **Button** - Button component with optional leading icon
- [x] **EmptyState** - Placeholder with icon, title, message, and action button
- [x] **SearchInput** - Search field with icon and keyboard shortcut hint
- [x] **Breadcrumb** - Breadcrumb path with separator icons
- [x] **UserMenu** - Avatar with user name/email dropdown trigger
- [x] **NavItem** - Navigation link with icon, label, and active state
- [x] **NavSection** - Grouped nav section with title header
- [x] **Tabs** - Keyboard-navigable tabs with disabled support
- [x] **LabeledSelect** - Select dropdown with label

Additional shared components:

- [ ] Input component with validation states
- [ ] Select/dropdown component
- [ ] Checkbox component
- [x] Toggle switch component
- [x] Card component
- [ ] Modal/dialog component
- [ ] Toast notification component
- [ ] Loading spinner component
- [ ] Error state component
- [ ] Skeleton loader component
- [x] Badge/tag component
- [ ] Tooltip directive

Additional shared infrastructure:

- [x] **DataTable** - Sortable table with column templates (UiColDirective)
- [x] **PageHeader** - Page title with description and action slot
- [x] **Toolbar** - Filter bar with content projection for filters and meta
- [x] **SCSS Mixins** - auto-grid, form-label in `src/styles/_mixins.scss`

---

## Phase 2: Core Features (Weeks 3-4)

### Flag Management 🔴

#### Flag Store

- [x] Create Flag interface/types
- [x] Implement FlagStore with signals
- [x] Add flag loading action
- [x] Add flag CRUD actions
- [x] Add flag toggle action
- [x] Implement computed selectors (filtered, sorted)
- [x] Write store unit tests

#### Flag List View

- [x] Create flag list container component
- [x] Create flag list item component
- [x] Implement search functionality
- [x] Implement filter panel
- [ ] Implement sort functionality
- [ ] Add bulk selection
- [ ] Implement virtual scrolling
- [x] Add inline toggle capability
- [x] Write component tests

#### Flag Detail View

- [x] Create flag detail container component
- [x] Create flag header component
- [x] Create flag overview tab
- [ ] Create SDK snippet display component
- [ ] Create flag settings tab
- [x] Implement flag editing
- [x] Write component tests

#### Flag Creation

- [x] Create flag creation wizard component
- [x] Step 1: Basic info form
- [x] Step 2: Type and variations form
- [x] Step 3: Initial targeting (optional)
- [ ] Step 4: Review and create
- [x] Implement form validation
- [x] Write component tests

### Environment Management 🔴

#### Environment Store

- [x] Create Environment interface/types
- [x] Implement EnvironmentStore with signals
- [x] Add environment CRUD actions (add, update, setDefault, select)
- [x] Write store unit tests

#### Environment UI

- [x] Create environment list component
- [x] Create environment card component
- [x] Create environment creation dialog
- [x] Create environment detail with inline editing
- [ ] Create environment settings component
- [x] Implement API key display/copy
- [ ] Implement API key rotation
- [x] Add environment selector (global)
- [x] Write component tests

### Project Management 🔴

#### Project Store

- [x] Create Project interface/types
- [x] Implement ProjectStore with signals
- [x] Add project CRUD actions
- [x] Write store unit tests

#### Project UI

- [x] Create project list view
- [x] Create project card component
- [x] Create project creation dialog
- [ ] Create project settings page
- [x] Implement project switcher in header
- [x] Write component tests

---

## Phase 3: Advanced Features (Weeks 5-6)

### Targeting Rules Builder 🔴

- [ ] Create TargetingRule interface/types
- [ ] Create targeting rules container component
- [ ] Create rule item component (draggable)
- [ ] Create condition builder component
- [ ] Implement condition operators dropdown
- [ ] Create attribute selector with autocomplete
- [ ] Create value input (type-aware)
- [ ] Implement percentage rollout slider
- [ ] Add rule drag-and-drop reordering
- [ ] Create rule testing panel
- [ ] Implement rule validation
- [ ] Write comprehensive tests

### Segments 🟡

#### Segment Store

- [x] Create Segment interface/types
- [x] Implement SegmentStore with signals
- [x] Write store unit tests

#### Segment UI

- [x] Create segment list view
- [x] Create segment detail/edit view
- [x] Create segment builder (similar to rules)
- [ ] Implement included/excluded user lists
- [ ] Add segment usage tracking display
- [x] Write component tests

### Bulk Operations 🟡

- [ ] Implement multi-select for flag list
- [ ] Create bulk action toolbar
- [ ] Implement bulk enable/disable
- [ ] Implement bulk delete with confirmation
- [ ] Implement bulk tag assignment
- [ ] Write tests

### Copy Configuration 🟡

- [ ] Create copy config dialog
- [ ] Implement flag selection for copy
- [ ] Create diff preview component
- [ ] Implement copy execution with rollback
- [ ] Write tests

---

## Phase 4: Analytics & Polish (Weeks 7-8)

### Analytics Dashboard 🟡

- [x] Create analytics container component
- [ ] Add performance metrics data source (API ingestion + storage)
- [ ] Implement evaluation volume chart
- [ ] Implement variation distribution pie chart
- [ ] Implement unique users metric
- [ ] Implement error rate display
- [ ] Implement latency percentiles
- [ ] Add time range selector
- [ ] Add export to CSV
- [ ] Write tests

### Audit Log 🟡

- [x] Create AuditEvent interface/types
- [x] Implement audit log store
- [x] Create audit log list view
- [ ] Create audit event detail component
- [x] Implement filtering (date, user, action)
- [ ] Add diff viewer for changes
- [ ] Implement export functionality
- [x] Write tests

### Performance Optimization 🟡

- [ ] Audit bundle size
- [ ] Implement `@defer` for below-fold content
- [ ] Optimize images and assets
- [ ] Add service worker for caching
- [ ] Implement preloading strategies
- [ ] Profile and fix memory leaks
- [ ] Optimize rendering performance

### Accessibility Audit 🔴

- [ ] Run automated accessibility tests
- [ ] Test keyboard navigation throughout
- [ ] Test screen reader compatibility
- [ ] Verify color contrast ratios
- [ ] Add ARIA labels where needed
- [ ] Test focus management in modals
- [ ] Fix all critical accessibility issues

### Documentation 🟡

- [ ] Complete API documentation
- [ ] Write component usage guides
- [ ] Create architecture decision records
- [ ] Document testing strategies
- [ ] Write deployment guide
- [ ] Create troubleshooting guide

---

## Backlog (Future Phases)

### User Settings 🟢

- [x] User profile page
- [x] Theme preference
- [x] Notification settings
- [x] Personal API tokens

### Team Management 🟢

- [ ] User invitation flow
- [ ] Role management UI
- [ ] Permission matrix display
- [ ] Team member list

### Integrations 🟢

- [ ] Slack integration
- [ ] GitHub integration
- [ ] Webhook configuration UI
- [ ] Integration status monitoring

### Advanced Features 🟢

- [ ] Flag scheduling (future activation)
- [ ] Flag dependencies visualization
- [ ] A/B test results analysis
- [ ] Feature comparison tool
- [ ] Mobile app (React Native or Flutter)

---

## Technical Debt

- [ ] (Add items as they arise during development)

---

## Bugs

- [ ] (Add bugs as they are discovered)

---

## Notes

### Current Sprint Focus

(Update this section with current sprint goals)

### Blockers

(Document any blocking issues)

### Decisions Needed

- Real-time updates: WebSocket vs polling?
- Offline support level for PWA?
- Third-party analytics integration?

---

_Last updated: 2026-01-28_
