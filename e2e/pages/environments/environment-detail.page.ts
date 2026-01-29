/**
 * Environment Detail Page Object
 *
 * @description Page object for viewing environment details and its flags.
 * @route /environments/:envId
 */

import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class EnvironmentDetailPage extends BasePage {
  readonly path = '/environments';

  // ============================================================
  // Locators
  // ============================================================

  /** Back button */
  get backButton(): Locator {
    return this.page.locator('[data-testid="back-button"], .back-button');
  }

  /** Environment name heading */
  get environmentName(): Locator {
    return this.page.locator('h1').first();
  }

  /** Environment key */
  get environmentKey(): Locator {
    return this.page.locator('[data-testid="env-key"], .environment-key');
  }

  /** Environment color indicator */
  get colorIndicator(): Locator {
    return this.page.locator('.env-dot, [data-testid="env-color"]');
  }

  /** Edit button */
  get editButton(): Locator {
    return this.button(/edit/i);
  }

  /** Delete button */
  get deleteButton(): Locator {
    return this.button(/delete/i);
  }

  /** Flags in this environment section */
  get flagsSection(): Locator {
    return this.page.locator('[data-testid="environment-flags"], .environment-flags');
  }

  /** Flag rows in this environment */
  get flagRows(): Locator {
    return this.flagsSection.locator('tr, [data-testid="flag-row"]');
  }

  /** Stats cards */
  get statCards(): Locator {
    return this.page.locator('app-stat-card');
  }

  // ============================================================
  // Navigation
  // ============================================================

  /** Navigate to a specific environment */
  async gotoEnvironment(envId: string): Promise<void> {
    await this.page.goto(`/environments/${envId}`);
    await this.waitForPageLoad();
  }

  /** Go back to environment list */
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

  /** Delete the environment */
  async deleteEnvironment(): Promise<void> {
    await this.clickDelete();
    await this.confirmModal();
  }

  /** Get environment name text */
  async getEnvironmentName(): Promise<string> {
    return (await this.environmentName.textContent()) || '';
  }

  /** Get flag count in this environment */
  async getFlagCount(): Promise<number> {
    return this.flagRows.count();
  }

  // ============================================================
  // Assertions
  // ============================================================

  /** Assert page has loaded */
  async assertPageLoaded(): Promise<void> {
    await expect(this.environmentName).toBeVisible();
  }

  /** Assert environment name */
  async assertEnvironmentName(name: string | RegExp): Promise<void> {
    await expect(this.environmentName).toHaveText(name);
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
