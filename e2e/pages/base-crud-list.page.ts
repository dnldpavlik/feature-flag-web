/**
 * Base CRUD List Page Object
 *
 * @description Provides common methods for list pages with CRUD operations.
 * Extends BasePage with standardized patterns for row access, counting, and assertions.
 *
 * Usage:
 * ```typescript
 * export class ProjectListPage extends BaseCrudListPage {
 *   readonly path = '/projects';
 *
 *   get createButton(): Locator {
 *     return this.form.getByRole('button', { name: /add project/i });
 *   }
 *
 *   // Optional semantic aliases
 *   get projectRows() { return this.itemRows; }
 *   projectRow(name: string) { return this.itemRow(name); }
 * }
 * ```
 */

import { Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export abstract class BaseCrudListPage extends BasePage {
  // ============================================================
  // Abstract Locators - Must be implemented by subclasses
  // ============================================================

  /**
   * Create/Add button locator.
   * Used by assertPageLoaded() to verify page is ready.
   */
  abstract get createButton(): Locator;

  // ============================================================
  // Row Accessors
  // ============================================================

  /**
   * All item rows in the table.
   * Alias for tableRows for semantic clarity in CRUD contexts.
   */
  get itemRows(): Locator {
    return this.tableRows;
  }

  /**
   * Get an item row by name/text content.
   */
  itemRow(name: string | RegExp): Locator {
    return this.tableRow(name);
  }

  /**
   * Get a link in a specific row.
   */
  itemLink(name: string | RegExp): Locator {
    return this.itemRow(name).getByRole('link').first();
  }

  /**
   * Get edit button in a row.
   */
  editButton(name: string | RegExp): Locator {
    return this.itemRow(name).getByRole('button', { name: /edit/i });
  }

  /**
   * Get delete button in a row.
   */
  deleteButton(name: string | RegExp): Locator {
    return this.itemRow(name).getByRole('button', { name: /delete/i });
  }

  /**
   * Get default badge in a row.
   */
  defaultBadge(name: string | RegExp): Locator {
    return this.itemRow(name)
      .locator('app-badge')
      .filter({ hasText: /default/i });
  }

  // ============================================================
  // Actions
  // ============================================================

  /**
   * Get the count of items displayed.
   */
  async getItemCount(): Promise<number> {
    return this.itemRows.count();
  }

  /**
   * Click on an item's link to view details.
   */
  async clickItem(name: string | RegExp): Promise<void> {
    await this.itemLink(name).click();
  }

  /**
   * Click edit button for an item.
   */
  async clickEdit(name: string | RegExp): Promise<void> {
    await this.editButton(name).click();
  }

  /**
   * Click delete button for an item.
   */
  async clickDelete(name: string | RegExp): Promise<void> {
    await this.deleteButton(name).click();
  }

  /**
   * Delete an item with confirmation.
   */
  async deleteItem(name: string | RegExp): Promise<void> {
    await this.clickDelete(name);
    await this.confirmModal();
  }

  // ============================================================
  // Assertions
  // ============================================================

  /**
   * Assert page has loaded by checking URL and create button visibility.
   */
  async assertPageLoaded(): Promise<void> {
    await this.assertAtPage();
    await expect(this.createButton).toBeVisible();
  }

  /**
   * Assert an item exists in the list.
   */
  async assertItemExists(name: string | RegExp): Promise<void> {
    await expect(this.itemRow(name)).toBeVisible();
  }

  /**
   * Assert an item does not exist in the list.
   */
  async assertItemNotExists(name: string | RegExp): Promise<void> {
    await expect(this.itemRow(name)).not.toBeVisible();
  }

  /**
   * Assert the count of items in the list.
   */
  async assertItemCount(expected: number): Promise<void> {
    await expect(this.itemRows).toHaveCount(expected);
  }

  /**
   * Assert an item is marked as default.
   */
  async assertIsDefault(name: string | RegExp): Promise<void> {
    await expect(this.defaultBadge(name)).toBeVisible();
  }

  /**
   * Assert empty state is shown.
   */
  async assertEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
  }
}
