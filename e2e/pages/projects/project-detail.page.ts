/**
 * Project Detail Page Object
 *
 * @description Page object for viewing project details.
 * @route /projects/:projectId
 */

import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class ProjectDetailPage extends BasePage {
  readonly path = '/projects';

  // ============================================================
  // Locators
  // ============================================================

  /** Back button */
  get backButton(): Locator {
    return this.page.locator('[data-testid="back-button"], .back-button, .project-detail__back');
  }

  /** Project name heading */
  get projectName(): Locator {
    return this.page.locator('h1').first();
  }

  /** Project key */
  get projectKey(): Locator {
    return this.page.locator('[data-testid="project-key"], .project-key');
  }

  /** Project description */
  get projectDescription(): Locator {
    return this.page.locator('[data-testid="project-description"], .project-description');
  }

  /** Edit button */
  get editButton(): Locator {
    return this.button(/edit/i);
  }

  /** Delete button */
  get deleteButton(): Locator {
    return this.button(/delete/i);
  }

  /** Stats cards */
  get statCards(): Locator {
    return this.page.locator('app-stat-card');
  }

  /** Flags count stat */
  get flagsCountStat(): Locator {
    return this.statCards.filter({ hasText: /flags/i });
  }

  /** Environments count stat */
  get environmentsCountStat(): Locator {
    return this.statCards.filter({ hasText: /environments/i });
  }

  // ============================================================
  // Navigation
  // ============================================================

  /** Navigate to a specific project */
  async gotoProject(projectId: string): Promise<void> {
    await this.page.goto(`/projects/${projectId}`);
    await this.waitForPageLoad();
  }

  /** Go back to project list */
  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  // ============================================================
  // Actions
  // ============================================================

  /** Click edit */
  async clickEdit(): Promise<void> {
    await this.editButton.click();
  }

  /** Click delete */
  async clickDelete(): Promise<void> {
    await this.deleteButton.click();
  }

  /** Delete the project */
  async deleteProject(): Promise<void> {
    await this.clickDelete();
    await this.confirmModal();
  }

  /** Get project name text */
  async getProjectName(): Promise<string> {
    return (await this.projectName.textContent()) || '';
  }

  // ============================================================
  // Assertions
  // ============================================================

  /** Assert page has loaded */
  async assertPageLoaded(): Promise<void> {
    await expect(this.projectName).toBeVisible();
  }

  /** Assert project name */
  async assertProjectName(name: string | RegExp): Promise<void> {
    await expect(this.projectName).toHaveText(name);
  }

  /** Assert can edit */
  async assertCanEdit(): Promise<void> {
    await expect(this.editButton).toBeVisible();
  }

  /** Assert can delete */
  async assertCanDelete(): Promise<void> {
    await expect(this.deleteButton).toBeVisible();
  }
}
