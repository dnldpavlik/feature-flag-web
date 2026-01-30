/**
 * Flag List Page Object
 *
 * @description Page object for the feature flags list view.
 * @route /flags
 */

import { Locator, expect } from '@playwright/test';
import { BaseCrudListPage } from '../base-crud-list.page';

export class FlagListPage extends BaseCrudListPage {
  readonly path = '/flags';

  // ============================================================
  // Locators
  // ============================================================

  /** Create flag button */
  get createButton(): Locator {
    return this.button(/create|new flag/i);
  }

  /** Flag list container */
  get flagList(): Locator {
    return this.page.locator('[data-testid="flag-list"], .flag-list');
  }

  // Semantic aliases for backward compatibility
  get flagRows(): Locator {
    return this.itemRows;
  }

  flagRow(name: string | RegExp): Locator {
    return this.itemRow(name);
  }

  /** Flag name link in a row */
  flagNameLink(name: string): Locator {
    return this.itemLink(name);
  }

  /** Toggle switch for a flag */
  flagToggle(name: string): Locator {
    return this.flagRow(name).locator('app-toggle input, [role="switch"]');
  }

  /** Flag type badge */
  flagTypeBadge(name: string): Locator {
    return this.flagRow(name).locator('app-badge, .badge');
  }

  /** Bulk action toolbar (visible when items selected) */
  get bulkActionToolbar(): Locator {
    return this.page.locator('[data-testid="bulk-actions"], .bulk-actions');
  }

  /** Select all checkbox */
  get selectAllCheckbox(): Locator {
    return this.dataTable.locator('thead input[type="checkbox"]');
  }

  // ============================================================
  // Actions
  // ============================================================

  /** Click the create flag button */
  async clickCreateFlag(): Promise<void> {
    await this.createButton.click();
  }

  /** Click on a flag to view its details */
  async clickFlag(name: string): Promise<void> {
    await this.flagNameLink(name).click();
  }

  /** Toggle a flag on/off */
  async toggleFlag(name: string): Promise<void> {
    await this.flagToggle(name).click();
  }

  /** Check if a flag is enabled */
  async isFlagEnabled(name: string): Promise<boolean> {
    return this.flagToggle(name).isChecked();
  }

  /** Select a flag (checkbox) */
  async selectFlag(name: string): Promise<void> {
    const checkbox = this.flagRow(name).locator('input[type="checkbox"]');
    await checkbox.check();
  }

  /** Deselect a flag */
  async deselectFlag(name: string): Promise<void> {
    const checkbox = this.flagRow(name).locator('input[type="checkbox"]');
    await checkbox.uncheck();
  }

  /** Select all flags */
  async selectAllFlags(): Promise<void> {
    await this.selectAllCheckbox.check();
  }

  /** Get the count of flags displayed */
  async getFlagCount(): Promise<number> {
    return this.getItemCount();
  }

  /** Search for flags */
  async searchFlags(term: string): Promise<void> {
    await this.search(term);
  }

  /** Sort by column */
  async sortByColumn(columnName: string): Promise<void> {
    const header = this.dataTable
      .locator('th, [role="columnheader"]')
      .filter({ hasText: columnName });
    await header.click();
  }

  // ============================================================
  // Assertions
  // ============================================================

  /** Assert a flag exists in the list */
  async assertFlagExists(name: string | RegExp): Promise<void> {
    await this.assertItemExists(name);
  }

  /** Assert a flag does not exist in the list */
  async assertFlagNotExists(name: string | RegExp): Promise<void> {
    await this.assertItemNotExists(name);
  }

  /** Assert flag is enabled */
  async assertFlagEnabled(name: string): Promise<void> {
    await expect(this.flagToggle(name)).toBeChecked();
  }

  /** Assert flag is disabled */
  async assertFlagDisabled(name: string): Promise<void> {
    await expect(this.flagToggle(name)).not.toBeChecked();
  }

  /** Assert flag type */
  async assertFlagType(name: string, type: string): Promise<void> {
    await expect(this.flagTypeBadge(name)).toContainText(type);
  }

  /** Assert flag count */
  async assertFlagCount(expected: number): Promise<void> {
    await this.assertItemCount(expected);
  }
}
