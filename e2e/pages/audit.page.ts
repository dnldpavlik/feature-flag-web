/**
 * Audit Log Page Object
 *
 * @description Page object for the audit log view.
 * @route /audit
 */

import { Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export type AuditAction = 'created' | 'updated' | 'deleted' | 'toggled';
export type AuditResourceType = 'flag' | 'environment' | 'project' | 'segment';

export class AuditPage extends BasePage {
  readonly path = '/audit';

  // ============================================================
  // Locators
  // ============================================================

  /** Audit log table */
  get auditTable(): Locator {
    return this.page.locator('[data-testid="audit-table"], app-data-table');
  }

  /** All audit entry rows */
  get auditRows(): Locator {
    return this.tableRows;
  }

  /** Get audit row by text content */
  auditRow(text: string | RegExp): Locator {
    return this.tableRow(text);
  }

  /** Filter by action dropdown */
  get actionFilter(): Locator {
    return this.page
      .locator('[data-testid="action-filter"], select')
      .filter({ hasText: /action/i });
  }

  /** Filter by resource type dropdown */
  get resourceTypeFilter(): Locator {
    return this.page
      .locator('[data-testid="resource-filter"], select')
      .filter({ hasText: /resource/i });
  }

  /** Date range picker */
  get dateRangePicker(): Locator {
    return this.page.locator('[data-testid="date-range"], .date-picker');
  }

  /** Clear filters button */
  get clearFiltersButton(): Locator {
    return this.button(/clear|reset/i);
  }

  /** Export button */
  get exportButton(): Locator {
    return this.button(/export/i);
  }

  /** Pagination controls */
  get pagination(): Locator {
    return this.page.locator('[data-testid="pagination"], .pagination');
  }

  /** Next page button */
  get nextPageButton(): Locator {
    return this.pagination.getByRole('button', { name: /next/i });
  }

  /** Previous page button */
  get prevPageButton(): Locator {
    return this.pagination.getByRole('button', { name: /prev/i });
  }

  // ============================================================
  // Actions
  // ============================================================

  /** Filter by action type */
  async filterByAction(action: AuditAction): Promise<void> {
    await this.actionFilter.selectOption(action);
  }

  /** Filter by resource type */
  async filterByResourceType(resourceType: AuditResourceType): Promise<void> {
    await this.resourceTypeFilter.selectOption(resourceType);
  }

  /** Clear all filters */
  async clearFilters(): Promise<void> {
    await this.clearFiltersButton.click();
  }

  /** Go to next page */
  async nextPage(): Promise<void> {
    await this.nextPageButton.click();
  }

  /** Go to previous page */
  async prevPage(): Promise<void> {
    await this.prevPageButton.click();
  }

  /** Export audit log */
  async exportLog(): Promise<void> {
    await this.exportButton.click();
  }

  /** Get audit entry count */
  async getAuditEntryCount(): Promise<number> {
    return this.auditRows.count();
  }

  /** Search audit entries */
  async searchAudit(term: string): Promise<void> {
    await this.search(term);
  }

  // ============================================================
  // Assertions
  // ============================================================

  /** Assert page has loaded */
  async assertPageLoaded(): Promise<void> {
    await this.assertAtPage();
    await expect(this.auditTable).toBeVisible();
  }

  /** Assert audit entry exists */
  async assertEntryExists(text: string | RegExp): Promise<void> {
    await expect(this.auditRow(text)).toBeVisible();
  }

  /** Assert audit entry count */
  async assertEntryCount(expected: number): Promise<void> {
    await expect(this.auditRows).toHaveCount(expected);
  }

  /** Assert empty state */
  async assertEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }
}
