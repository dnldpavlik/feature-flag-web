/**
 * Environment List Page Object
 *
 * @description Page object for the environments list view.
 * @route /environments
 */

import { Locator, expect } from '@playwright/test';
import { BaseCrudListPage } from '../base-crud-list.page';

export interface EnvironmentFormData {
  name: string;
  key?: string;
  color?: string;
}

export class EnvironmentListPage extends BaseCrudListPage {
  readonly path = '/environments';

  // ============================================================
  // Locators
  // ============================================================

  /** Create environment button (form is always visible, this is the Add button) */
  get createButton(): Locator {
    return this.createForm.getByRole('button', { name: /add environment/i });
  }

  /** Environment list/table */
  get environmentList(): Locator {
    return this.page.locator('[data-testid="environment-list"], app-ui-data-table');
  }

  // Semantic aliases for backward compatibility
  get environmentRows(): Locator {
    return this.itemRows;
  }

  environmentRow(name: string | RegExp): Locator {
    return this.itemRow(name);
  }

  /** Environment name link */
  environmentLink(name: string): Locator {
    return this.itemLink(name);
  }

  /** Environment color indicator */
  environmentColor(name: string): Locator {
    return this.environmentRow(name).locator('.env-dot, [data-testid="env-color"]');
  }

  // ============================================================
  // Create Form (in modal or inline)
  // ============================================================

  /** Create form (may be in modal) */
  get createForm(): Locator {
    return this.page.locator('.env-form, [data-testid="environment-form"]');
  }

  /** Name input in create form */
  get nameInput(): Locator {
    return this.createForm.getByLabel('Name');
  }

  /** Key input in create form */
  get keyInput(): Locator {
    return this.createForm.getByLabel('Key');
  }

  /** Color input in create form */
  get colorInput(): Locator {
    return this.createForm.locator('input[type="color"]');
  }

  /** Save/Add button in form — targets app-button host for reliable cross-browser clicks */
  get saveButton(): Locator {
    return this.createForm
      .locator('app-button')
      .filter({ hasText: /add environment|save|create/i })
      .locator('button');
  }

  /** Cancel button in form (may not exist in inline forms) */
  get cancelButton(): Locator {
    return this.createForm.getByRole('button', { name: /cancel/i });
  }

  // ============================================================
  // Actions
  // ============================================================

  /** Click create environment button (form is always visible, this is a no-op) */
  async clickCreate(): Promise<void> {
    // Form is always visible in inline mode, nothing to click to open it
    await this.createForm.waitFor({ state: 'visible' });
  }

  /** Click on an environment to view details */
  async clickEnvironment(name: string): Promise<void> {
    await this.environmentLink(name).click();
  }

  /** Fill the create/edit form */
  async fillForm(data: EnvironmentFormData): Promise<void> {
    await this.nameInput.fill(data.name);

    if (data.key) {
      await this.keyInput.fill(data.key);
    }

    if (data.color) {
      await this.colorInput.fill(data.color);
      // Blur dismisses the native color picker in Firefox, unblocking the submit button
      await this.colorInput.blur();
    }
  }

  /** Submit the form */
  async submitForm(): Promise<void> {
    await this.saveButton.dispatchEvent('click');
  }

  /** Cancel the form (clear fields since there's no cancel button in inline form) */
  async cancelForm(): Promise<void> {
    await this.nameInput.clear();
    await this.keyInput.clear();
  }

  /** Create a new environment */
  async createEnvironment(data: EnvironmentFormData): Promise<void> {
    await this.clickCreate();
    await this.fillForm(data);
    await this.submitForm();
    // Wait for the form to reset, confirming the API call completed
    await expect(this.nameInput).toHaveValue('', { timeout: 15000 });
  }

  /** Edit an existing environment */
  async editEnvironment(name: string, data: Partial<EnvironmentFormData>): Promise<void> {
    await this.clickEdit(name);
    if (data.name) await this.nameInput.fill(data.name);
    if (data.key) await this.keyInput.fill(data.key);
    if (data.color) await this.colorInput.fill(data.color);
    await this.submitForm();
  }

  /** Delete an environment */
  async deleteEnvironment(name: string): Promise<void> {
    await this.deleteItem(name);
  }

  /** Get count of environments */
  async getEnvironmentCount(): Promise<number> {
    return this.getItemCount();
  }

  // ============================================================
  // Assertions
  // ============================================================

  /** Assert environment exists */
  async assertEnvironmentExists(name: string | RegExp): Promise<void> {
    await this.assertItemExists(name);
  }

  /** Assert environment does not exist */
  async assertEnvironmentNotExists(name: string | RegExp): Promise<void> {
    await this.assertItemNotExists(name);
  }

  /** Assert environment count */
  async assertEnvironmentCount(expected: number): Promise<void> {
    await this.assertItemCount(expected);
  }

  /** Assert form is visible */
  async assertFormVisible(): Promise<void> {
    await expect(this.createForm).toBeVisible();
  }

  /** Assert form is hidden */
  async assertFormHidden(): Promise<void> {
    await expect(this.createForm).not.toBeVisible();
  }
}
