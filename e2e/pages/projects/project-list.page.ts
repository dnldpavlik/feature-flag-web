/**
 * Project List Page Object
 *
 * @description Page object for the projects list view.
 * @route /projects
 */

import { Locator, expect } from '@playwright/test';
import { BaseCrudListPage } from '../base-crud-list.page';

export interface ProjectFormData {
  name: string;
  key?: string;
  description?: string;
}

export class ProjectListPage extends BaseCrudListPage {
  readonly path = '/projects';

  // ============================================================
  // Locators
  // ============================================================

  /** Create project button (form is always visible, this is the Add button) */
  get createButton(): Locator {
    return this.createForm.getByRole('button', { name: /add project/i });
  }

  /** Project list/table */
  get projectList(): Locator {
    return this.page.locator('[data-testid="project-list"], ui-data-table');
  }

  // Semantic aliases for backward compatibility
  get projectRows(): Locator {
    return this.itemRows;
  }

  projectRow(name: string | RegExp): Locator {
    return this.itemRow(name);
  }

  /** Project name link */
  projectLink(name: string): Locator {
    return this.itemLink(name);
  }

  // ============================================================
  // Create Form
  // ============================================================

  /** Create form */
  get createForm(): Locator {
    return this.page.locator('.project-form, [data-testid="project-form"]');
  }

  /** Name input */
  get nameInput(): Locator {
    return this.createForm.getByLabel('Name');
  }

  /** Key input */
  get keyInput(): Locator {
    return this.createForm.getByLabel('Key');
  }

  /** Description input */
  get descriptionInput(): Locator {
    return this.createForm.getByLabel('Description');
  }

  /** Save/Add button — targets inner button for disabled state checks */
  get saveButton(): Locator {
    return this.createForm
      .locator('ui-button')
      .filter({ hasText: /add project|save|create/i })
      .locator('button');
  }

  /** Cancel button (may not exist in inline forms) */
  get cancelButton(): Locator {
    return this.createForm.getByRole('button', { name: /cancel/i });
  }

  // ============================================================
  // Actions
  // ============================================================

  /** Click create button (form is always visible, this is a no-op) */
  async clickCreate(): Promise<void> {
    // Form is always visible in inline mode, nothing to click to open it
    await this.createForm.waitFor({ state: 'visible' });
  }

  /** Click on a project */
  async clickProject(name: string): Promise<void> {
    await this.projectLink(name).click();
  }

  /** Fill the form */
  async fillForm(data: ProjectFormData): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.key) await this.keyInput.fill(data.key);
    if (data.description) await this.descriptionInput.fill(data.description);
  }

  /** Submit the form */
  async submitForm(): Promise<void> {
    await this.saveButton.dispatchEvent('click');
  }

  /** Create a new project */
  async createProject(data: ProjectFormData): Promise<void> {
    await this.clickCreate();
    await this.fillForm(data);
    await this.submitForm();
    // Wait for the project to appear in the table (API call must complete)
    await expect(this.itemRow(new RegExp(data.name))).toBeVisible({ timeout: 15000 });
  }

  /** Delete a project */
  async deleteProject(name: string): Promise<void> {
    await this.deleteItem(name);
  }

  /** Get project count */
  async getProjectCount(): Promise<number> {
    return this.getItemCount();
  }

  // ============================================================
  // Assertions
  // ============================================================

  /** Assert project exists */
  async assertProjectExists(name: string | RegExp): Promise<void> {
    await this.assertItemExists(name);
  }

  /** Assert project does not exist */
  async assertProjectNotExists(name: string | RegExp): Promise<void> {
    await this.assertItemNotExists(name);
  }
}
