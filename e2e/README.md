# E2E Testing Guide

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

## Quick Start

```bash
# Run all tests
npm run e2e

# Run smoke tests only (fastest)
npm run e2e:smoke

# Interactive UI mode
npm run e2e:ui
```

## NPM Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run e2e` | Run all E2E tests across all projects |
| `npm run e2e:smoke` | Run smoke tests only (Chrome) |
| `npm run e2e:journeys` | Run user journey tests (Chrome) |
| `npm run e2e:regression` | Run regression tests (Chrome) |
| `npm run e2e:all-browsers` | Run regression tests on Chrome, Firefox, and Safari |
| `npm run e2e:ui` | Open Playwright's interactive UI mode |
| `npm run e2e:debug` | Run tests with Playwright Inspector for debugging |
| `npm run e2e:headed` | Run tests with visible browser windows |
| `npm run e2e:report` | View the HTML report from the last test run |
| `npm run e2e:ci` | CI pipeline command: smoke + journeys against staging |

## Test Suites

### Smoke Tests (`e2e/smoke/`)

**Command:** `npm run e2e:smoke`

**Purpose:** Quick sanity checks to verify the application is functional after deployment.

**Characteristics:**
- Fast execution (~15 seconds)
- Tests critical paths only
- No complex setup or teardown
- Should never be flaky

**What they test:**
- Application bootstraps successfully
- Core pages load (dashboard, flags, environments, projects)
- Navigation works between sections
- Basic UI components render
- Theme support (light/dark)

**When to run:**
- After every deployment to staging/production
- As the first check in CI pipelines
- When debugging "is the app broken?" issues

---

### Journey Tests (`e2e/journeys/`)

**Command:** `npm run e2e:journeys`

**Purpose:** Simulate complete user workflows from start to finish.

**Characteristics:**
- Test realistic user scenarios
- Cover the "happy path" through features
- May create and clean up test data
- Medium execution time (~1-2 minutes)

**What they test:**
- **Flag Management:** Create flag → View details → Toggle state → Delete
- **Environment Management:** Full CRUD operations for environments
- **Project Management:** Project lifecycle
- **Navigation:** Multi-step navigation flows

**When to run:**
- Before releases to catch workflow regressions
- During feature development to validate full flows
- As part of PR validation for feature changes

---

### Regression Tests (`e2e/regression/`)

**Command:** `npm run e2e:regression`

**Purpose:** Comprehensive testing of edge cases, cross-browser compatibility, and non-functional requirements.

**Characteristics:**
- Thorough coverage of edge cases
- Tests multiple browsers (when using `e2e:all-browsers`)
- Tests multiple viewports
- Longer execution time (~5 minutes for Chrome only)

**Test files:**

| File | What it tests |
|------|---------------|
| `flags.spec.ts` | All flag types (boolean, string, number, JSON), form validation edge cases, search/filter variations, sorting |
| `accessibility.spec.ts` | Keyboard navigation, ARIA attributes, focus management, screen reader compatibility |
| `responsive.spec.ts` | Mobile (375×667), tablet (768×1024), desktop (1280×800), wide (1920×1080) viewports |

**When to run:**
- Full QA cycles before major releases
- When changing shared components
- Periodically to catch browser-specific issues

---

### Cross-Browser Testing

**Command:** `npm run e2e:all-browsers`

Runs regression tests across three browser engines:
- **Chrome** (Chromium)
- **Firefox** (Gecko)
- **Safari** (WebKit)

This takes significantly longer but catches browser-specific bugs.

---

### CI Pipeline Tests

**Command:** `npm run e2e:ci`

Configured for CI environments:
- Targets staging environment (`E2E_ENV=staging`)
- Runs smoke + journey tests (not full regression)
- Optimized for speed while maintaining coverage of critical paths

## Development Commands

### Interactive UI Mode

```bash
npm run e2e:ui
```

Opens Playwright's interactive test runner with:
- Visual test tree
- Step-by-step execution
- Time-travel debugging
- DOM snapshots

### Debug Mode

```bash
npm run e2e:debug
```

Opens Playwright Inspector allowing you to:
- Step through test code
- Inspect selectors
- See live browser interaction

### Headed Mode

```bash
npm run e2e:headed
```

Runs tests with visible browser windows. Useful for:
- Watching test execution
- Quick visual debugging
- Demos

### View Test Report

```bash
npm run e2e:report
```

Opens the HTML report from the last test run showing:
- Pass/fail status
- Screenshots on failure
- Video recordings (on failure)
- Trace files for debugging

## Test Organization

```
e2e/
├── fixtures/              # Shared test fixtures and utilities
│   ├── base.fixture.ts    # Custom test fixtures (navigateTo, waitForApp, etc.)
│   └── test-data.ts       # Test data generators
├── pages/                 # Page Object Model classes
│   ├── base.page.ts       # Base page with common methods
│   ├── dashboard.page.ts
│   ├── flags/
│   │   ├── flag-list.page.ts
│   │   ├── flag-create.page.ts
│   │   └── flag-detail.page.ts
│   ├── environments/
│   ├── projects/
│   └── segments/
├── smoke/                 # Smoke tests
│   └── smoke.spec.ts
├── journeys/              # User journey tests
│   ├── flag-management.spec.ts
│   ├── environment-management.spec.ts
│   ├── project-management.spec.ts
│   └── navigation.spec.ts
└── regression/            # Regression tests
    ├── flags.spec.ts
    ├── accessibility.spec.ts
    └── responsive.spec.ts
```

## Writing New Tests

### Adding Smoke Tests

Add quick, critical-path checks to `smoke/smoke.spec.ts` or create focused files for specific areas.

### Adding Journey Tests

Create a new file following the pattern `<feature>-management.spec.ts`:

```typescript
import { test, expect } from '../fixtures/base.fixture';
import { MyFeaturePage } from '../pages';

test.describe('My Feature Journey', () => {
  test('should complete the full workflow', async ({ page }) => {
    // Test the happy path
  });
});
```

### Adding Regression Tests

Add to the appropriate category file or create a new one:
- `flags.spec.ts` - Flag-specific edge cases
- `accessibility.spec.ts` - A11y tests
- `responsive.spec.ts` - Viewport tests
- Create new files for other categories

### Using Page Objects

Always use Page Objects from `e2e/pages/` for:
- Consistent selectors across tests
- Reusable actions
- Easier maintenance when UI changes

```typescript
// Good - using page object
const flagList = new FlagListPage(page);
await flagList.goto();
await flagList.clickCreateFlag();

// Avoid - hardcoded selectors in tests
await page.goto('/flags');
await page.click('[data-testid="create-flag"]');
```

## Configuration

See `playwright.config.ts` for full configuration. Key settings:

| Setting | Value | Description |
|---------|-------|-------------|
| `timeout` | 30s | Max time per test |
| `expect.timeout` | 10s | Max time for assertions |
| `retries` | 0 (local), 2 (CI) | Retry failed tests |
| `workers` | auto (local), 1 (CI) | Parallel workers |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `E2E_BASE_URL` | `http://localhost:4200` | Base URL for tests |
| `E2E_ENV` | `local` | Target environment (local, staging, production) |
| `CI` | - | Set automatically in CI, enables stricter settings |
