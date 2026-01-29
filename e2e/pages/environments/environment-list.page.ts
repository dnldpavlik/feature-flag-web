/**
 * Environment List Page Object
 *
 * @description Page object for the environments list view.
 * @route /environments
 */

import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export interface EnvironmentFormData {
  name: string;
  key?: string;
  color?: string;
}

export class EnvironmentListPage extends BasePage {
  readonly path = '/environments';

  // ============================================================
  // Locators
  // ============================================================

  /** Create environment button */
  get createButton(): Locator {
    return this.button(/create|new environment/i);
  }

  /** Environment list/table */
  get environmentList(): Locator {
    return this.page.locator('[data-testid="environment-list"], app-data-table');
  }

  /** All environment rows */
  get environmentRows(): Locator {
    return this.tableRows;
  }

  /** Get environment row by name */
  environmentRow(name: string | RegExp): Locator {
    return this.tableRow(name);
  }

  /** Environment name link */
  environmentLink(name: string): Locator {
    return this.environmentRow(name).getByRole('link');
  }

  /** Environment color indicator */
  environmentColor(name: string): Locator {
    return this.environmentRow(name).locator('.env-dot, [data-testid="env-color"]');
  }

  /** Edit button for an environment */
  editButton(name: string): Locator {
    return this.environmentRow(name).getByRole('button', { name: /edit/i });
  }

  /** Delete button for an environment */
  deleteButton(name: string): Locator {
    return this.environmentRow(name).getByRole('button', { name: /delete/i });
  }

  /** Default badge indicator */
  defaultBadge(name: string): Locator {
    return this.environmentRow(name)
      .locator('app-badge')
      .filter({ hasText: /default/i });
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

  /** Save button in form */
  get saveButton(): Locator {
    return this.createForm.getByRole('button', { name: /save|create/i });
  }

  /** Cancel button in form */
  get cancelButton(): Locator {
    return this.createForm.getByRole('button', { name: /cancel/i });
  }

  // ============================================================
  // Actions
  // ============================================================

  /** Click create environment button */
  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  /** Click on an environment to view details */
  async clickEnvironment(name: string): Promise<void> {
    await this.environmentLink(name).click();
  }

  /** Click edit for an environment */
  async clickEdit(name: string): Promise<void> {
    await this.editButton(name).click();
  }

  /** Click delete for an environment */
  async clickDelete(name: string): Promise<void> {
    await this.deleteButton(name).click();
  }

  /** Fill the create/edit form */
  async fillForm(data: EnvironmentFormData): Promise<void> {
    await this.nameInput.fill(data.name);

    if (data.key) {
      await this.keyInput.fill(data.key);
    }

    if (data.color) {
      await this.colorInput.fill(data.color);
    }
  }

  /** Submit the form */
  async submitForm(): Promise<void> {
    await this.saveButton.click();
  }

  /** Cancel the form */
  async cancelForm(): Promise<void> {
    await this.cancelButton.click();
  }

  /** Create a new environment */
  async createEnvironment(data: EnvironmentFormData): Promise<void> {
    await this.clickCreate();
    await this.fillForm(data);
    await this.submitForm();
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
    await this.clickDelete(name);
    await this.confirmModal();
  }

  /** Get count of environments */
  async getEnvironmentCount(): Promise<number> {
    return this.environmentRows.count();
  }

  // ============================================================
  // Assertions
  // ============================================================

  /** Assert page has loaded */
  async assertPageLoaded(): Promise<void> {
    await this.assertAtPage();
    await expect(this.createButton).toBeVisible();
  }

  /** Assert environment exists */
  async assertEnvironmentExists(name: string | RegExp): Promise<void> {
    await expect(this.environmentRow(name)).toBeVisible();
  }

  /** Assert environment does not exist */
  async assertEnvironmentNotExists(name: string | RegExp): Promise<void> {
    await expect(this.environmentRow(name)).not.toBeVisible();
  }

  /** Assert environment is default */
  async assertIsDefault(name: string): Promise<void> {
    await expect(this.defaultBadge(name)).toBeVisible();
  }

  /** Assert environment count */
  async assertEnvironmentCount(expected: number): Promise<void> {
    await expect(this.environmentRows).toHaveCount(expected);
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
