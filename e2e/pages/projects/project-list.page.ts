/**
 * Project List Page Object
 *
 * @description Page object for the projects list view.
 * @route /projects
 */

import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export interface ProjectFormData {
  name: string;
  key?: string;
  description?: string;
}

export class ProjectListPage extends BasePage {
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
    return this.page.locator('[data-testid="project-list"], app-ui-data-table');
  }

  /** All project rows */
  get projectRows(): Locator {
    return this.tableRows;
  }

  /** Get project row by name */
  projectRow(name: string | RegExp): Locator {
    return this.tableRow(name);
  }

  /** Project name link */
  projectLink(name: string): Locator {
    return this.projectRow(name).getByRole('link');
  }

  /** Edit button for a project */
  editButton(name: string): Locator {
    return this.projectRow(name).getByRole('button', { name: /edit/i });
  }

  /** Delete button for a project */
  deleteButton(name: string): Locator {
    return this.projectRow(name).getByRole('button', { name: /delete/i });
  }

  /** Default badge */
  defaultBadge(name: string): Locator {
    return this.projectRow(name)
      .locator('app-badge')
      .filter({ hasText: /default/i });
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

  /** Save/Add button */
  get saveButton(): Locator {
    return this.createForm.getByRole('button', { name: /add project|save|create/i });
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

  /** Click edit for a project */
  async clickEdit(name: string): Promise<void> {
    await this.editButton(name).click();
  }

  /** Click delete for a project */
  async clickDelete(name: string): Promise<void> {
    await this.deleteButton(name).click();
  }

  /** Fill the form */
  async fillForm(data: ProjectFormData): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.key) await this.keyInput.fill(data.key);
    if (data.description) await this.descriptionInput.fill(data.description);
  }

  /** Submit the form */
  async submitForm(): Promise<void> {
    await this.saveButton.click();
  }

  /** Create a new project */
  async createProject(data: ProjectFormData): Promise<void> {
    await this.clickCreate();
    await this.fillForm(data);
    await this.submitForm();
  }

  /** Delete a project */
  async deleteProject(name: string): Promise<void> {
    await this.clickDelete(name);
    await this.confirmModal();
  }

  /** Get project count */
  async getProjectCount(): Promise<number> {
    return this.projectRows.count();
  }

  // ============================================================
  // Assertions
  // ============================================================

  /** Assert page has loaded */
  async assertPageLoaded(): Promise<void> {
    await this.assertAtPage();
    await expect(this.createButton).toBeVisible();
  }

  /** Assert project exists */
  async assertProjectExists(name: string | RegExp): Promise<void> {
    await expect(this.projectRow(name)).toBeVisible();
  }

  /** Assert project does not exist */
  async assertProjectNotExists(name: string | RegExp): Promise<void> {
    await expect(this.projectRow(name)).not.toBeVisible();
  }

  /** Assert project is default */
  async assertIsDefault(name: string): Promise<void> {
    await expect(this.defaultBadge(name)).toBeVisible();
  }
}
