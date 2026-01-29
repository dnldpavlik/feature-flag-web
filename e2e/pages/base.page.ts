/**
 * Base Page Object for Feature Flag UI
 *
 * @description Provides common methods and selectors shared across all pages.
 * All page objects should extend this class.
 */

import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  /** The Playwright page instance */
  protected readonly page: Page;

  /** Abstract property for the page URL path */
  abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
  }

  // ============================================================
  // Navigation
  // ============================================================

  /** Navigate to this page */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForPageLoad();
  }

  /** Wait for page to finish loading */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForSelector('app-root', { state: 'attached' });
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Get current URL */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  // ============================================================
  // Common Layout Elements
  // ============================================================

  /** Sidebar navigation */
  get sidebar(): Locator {
    return this.page.locator('app-sidebar');
  }

  /** Header */
  get header(): Locator {
    return this.page.locator('app-header');
  }

  /** Main content area */
  get mainContent(): Locator {
    return this.page.locator('main, [role="main"]');
  }

  /** Page header component */
  get pageHeader(): Locator {
    return this.page.locator('app-page-header');
  }

  /** Page title */
  get pageTitle(): Locator {
    return this.pageHeader.locator('h1');
  }

  /** Breadcrumb navigation */
  get breadcrumb(): Locator {
    return this.page.locator('app-breadcrumb, [aria-label="Breadcrumb"]');
  }

  // ============================================================
  // Common UI Elements
  // ============================================================

  /** Get a button by its accessible name */
  button(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name });
  }

  /** Get a link by its accessible name */
  link(name: string | RegExp): Locator {
    return this.page.getByRole('link', { name });
  }

  /** Get a form field by its label */
  field(label: string): Locator {
    return this.page.getByLabel(label);
  }

  /** Get a select/dropdown by its label */
  select(label: string): Locator {
    return this.page.getByLabel(label);
  }

  /** Get an element by test ID */
  testId(id: string): Locator {
    return this.page.getByTestId(id);
  }

  /** Get a heading by level and text */
  heading(level: 1 | 2 | 3 | 4 | 5 | 6, text?: string | RegExp): Locator {
    const heading = this.page.getByRole('heading', { level });
    return text ? heading.filter({ hasText: text }) : heading;
  }

  // ============================================================
  // Tables
  // ============================================================

  /** Get data table component */
  get dataTable(): Locator {
    return this.page.locator('app-data-table');
  }

  /** Get table rows */
  get tableRows(): Locator {
    return this.dataTable
      .locator('tbody tr, [role="row"]')
      .filter({ hasNot: this.page.locator('th') });
  }

  /** Get table row by text content */
  tableRow(text: string | RegExp): Locator {
    return this.tableRows.filter({ hasText: text });
  }

  /** Get cell in a row by column header name */
  tableCell(rowText: string | RegExp, columnHeader: string): Locator {
    // This is a simplified implementation - adjust based on actual table structure
    return this.tableRow(rowText).locator('td').filter({ hasText: columnHeader });
  }

  // ============================================================
  // Modals/Dialogs
  // ============================================================

  /** Get the currently open modal/dialog */
  get modal(): Locator {
    return this.page.locator('[role="dialog"], .modal');
  }

  /** Check if a modal is open */
  async isModalOpen(): Promise<boolean> {
    return this.modal.isVisible();
  }

  /** Close the current modal */
  async closeModal(): Promise<void> {
    // Try close button first, then escape key
    const closeButton = this.modal.locator('[aria-label="Close"], .modal-close');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
    await expect(this.modal).not.toBeVisible();
  }

  /** Confirm modal action (click primary button) */
  async confirmModal(): Promise<void> {
    await this.modal.getByRole('button', { name: /confirm|save|create|delete|yes/i }).click();
  }

  /** Cancel modal action */
  async cancelModal(): Promise<void> {
    await this.modal.getByRole('button', { name: /cancel|no|close/i }).click();
  }

  // ============================================================
  // Notifications/Toasts
  // ============================================================

  /** Get toast notification */
  get toast(): Locator {
    return this.page.locator('[role="alert"], .toast, .notification');
  }

  /** Wait for toast with specific text */
  async waitForToast(text: string | RegExp): Promise<void> {
    await expect(this.toast.filter({ hasText: text })).toBeVisible({ timeout: 5000 });
  }

  /** Dismiss all visible toasts */
  async dismissToasts(): Promise<void> {
    const closeButtons = this.toast.locator('button[aria-label="Close"], .toast-close');
    const count = await closeButtons.count();
    for (let i = 0; i < count; i++) {
      await closeButtons.nth(i).click();
    }
  }

  // ============================================================
  // Loading States
  // ============================================================

  /** Get loading spinner */
  get spinner(): Locator {
    return this.page.locator('.spinner, [data-testid="loading"], app-spinner');
  }

  /** Wait for loading to complete */
  async waitForLoadingComplete(): Promise<void> {
    // Wait for spinner to disappear if it's visible
    try {
      await this.spinner.waitFor({ state: 'visible', timeout: 1000 });
      await this.spinner.waitFor({ state: 'hidden', timeout: 30000 });
    } catch {
      // Spinner never appeared, which is fine
    }
  }

  /** Check if page is loading */
  async isLoading(): Promise<boolean> {
    return this.spinner.isVisible();
  }

  // ============================================================
  // Empty States
  // ============================================================

  /** Get empty state component */
  get emptyState(): Locator {
    return this.page.locator('app-empty-state, [data-testid="empty-state"]');
  }

  /** Check if empty state is shown */
  async isEmptyStateVisible(): Promise<boolean> {
    return this.emptyState.isVisible();
  }

  // ============================================================
  // Search
  // ============================================================

  /** Get search input */
  get searchInput(): Locator {
    return this.page.locator('app-search-input input, [role="searchbox"]');
  }

  /** Search for a term */
  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    // Wait for debounce
    await this.page.waitForTimeout(300);
  }

  /** Clear search */
  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.page.waitForTimeout(300);
  }

  // ============================================================
  // Assertions
  // ============================================================

  /** Assert page is at correct URL */
  async assertAtPage(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(this.path));
  }

  /** Assert page title */
  async assertPageTitle(title: string | RegExp): Promise<void> {
    await expect(this.pageTitle).toHaveText(title);
  }

  /** Assert element is visible */
  async assertVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  /** Assert element is not visible */
  async assertNotVisible(locator: Locator): Promise<void> {
    await expect(locator).not.toBeVisible();
  }

  /** Assert element has text */
  async assertText(locator: Locator, text: string | RegExp): Promise<void> {
    await expect(locator).toHaveText(text);
  }

  /** Assert element contains text */
  async assertContainsText(locator: Locator, text: string | RegExp): Promise<void> {
    await expect(locator).toContainText(text);
  }
}
