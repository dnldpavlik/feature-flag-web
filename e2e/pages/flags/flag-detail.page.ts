/**
 * Flag Detail Page Object
 *
 * @description Page object for viewing and editing a feature flag.
 * @route /flags/:flagId
 */

import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export class FlagDetailPage extends BasePage {
  readonly path = '/flags';

  // ============================================================
  // Locators
  // ============================================================

  /** Back button to return to flag list */
  get backButton(): Locator {
    return this.page.locator('.flag-detail__back, [data-testid="back-button"]');
  }

  /** Flag name heading */
  get flagName(): Locator {
    return this.page.locator('h1').first();
  }

  /** Flag key display */
  get flagKey(): Locator {
    return this.page.locator('[data-testid="flag-key"], .flag-detail__key');
  }

  /** Flag type badge */
  get flagTypeBadge(): Locator {
    return this.page.locator('app-badge, .badge').first();
  }

  /** Edit button */
  get editButton(): Locator {
    return this.button(/edit/i);
  }

  /** Delete button */
  get deleteButton(): Locator {
    return this.button(/delete|archive/i);
  }

  /** Main toggle for the flag */
  get mainToggle(): Locator {
    return this.page.locator('.flag-detail__toggle app-toggle input, [data-testid="main-toggle"]');
  }

  /** Environment toggles section */
  get environmentToggles(): Locator {
    return this.page.locator('[data-testid="environment-toggles"], .flag-detail__environments');
  }

  /** Get toggle for specific environment */
  environmentToggle(envName: string): Locator {
    return this.page
      .locator('.flag-detail__env-row')
      .filter({ hasText: envName })
      .locator('app-toggle input');
  }

  /** Environment value input (for non-boolean flags) */
  environmentValueInput(envName: string): Locator {
    return this.page
      .locator('.flag-detail__env-row')
      .filter({ hasText: envName })
      .locator('input, textarea');
  }

  /** Targeting rules section */
  get targetingSection(): Locator {
    return this.page.locator('[data-testid="targeting-rules"], .targeting-rules');
  }

  /** Add targeting rule button */
  get addRuleButton(): Locator {
    return this.button(/add rule/i);
  }

  /** Activity/History section */
  get activitySection(): Locator {
    return this.page.locator('[data-testid="activity"], .activity-log');
  }

  /** Settings card */
  get settingsCard(): Locator {
    return this.page.locator('app-card').filter({ hasText: /settings/i });
  }

  // ============================================================
  // Navigation
  // ============================================================

  /** Navigate to a specific flag */
  async gotoFlag(flagId: string): Promise<void> {
    await this.page.goto(`/flags/${flagId}`);
    await this.waitForPageLoad();
  }

  /** Go back to flag list */
  async goBack(): Promise<void> {
    await this.backButton.click();
  }

  // ============================================================
  // Actions
  // ============================================================

  /** Toggle the main flag state */
  async toggleMainFlag(): Promise<void> {
    await this.mainToggle.click();
  }

  /** Toggle flag for a specific environment */
  async toggleEnvironment(envName: string): Promise<void> {
    await this.environmentToggle(envName).click();
  }

  /** Set flag value for an environment (for non-boolean flags) */
  async setEnvironmentValue(envName: string, value: string): Promise<void> {
    const input = this.environmentValueInput(envName);
    await input.clear();
    await input.fill(value);
  }

  /** Click edit to enter edit mode */
  async clickEdit(): Promise<void> {
    await this.editButton.click();
  }

  /** Click delete to delete the flag */
  async clickDelete(): Promise<void> {
    await this.deleteButton.click();
  }

  /** Confirm deletion in modal */
  async confirmDelete(): Promise<void> {
    await this.confirmModal();
  }

  /** Delete the flag (clicks delete and confirms) */
  async deleteFlag(): Promise<void> {
    await this.clickDelete();
    await this.confirmDelete();
  }

  /** Get the current flag name */
  async getFlagName(): Promise<string> {
    return (await this.flagName.textContent()) || '';
  }

  /** Check if flag is enabled for an environment */
  async isEnvironmentEnabled(envName: string): Promise<boolean> {
    return this.environmentToggle(envName).isChecked();
  }

  /** Get the current value for an environment */
  async getEnvironmentValue(envName: string): Promise<string> {
    return this.environmentValueInput(envName).inputValue();
  }

  // ============================================================
  // Assertions
  // ============================================================

  /** Assert flag detail page has loaded */
  async assertPageLoaded(): Promise<void> {
    await expect(this.flagName).toBeVisible();
    await expect(this.environmentToggles).toBeVisible();
  }

  /** Assert flag has expected name */
  async assertFlagName(name: string | RegExp): Promise<void> {
    await expect(this.flagName).toHaveText(name);
  }

  /** Assert flag has expected type */
  async assertFlagType(type: string): Promise<void> {
    await expect(this.flagTypeBadge).toContainText(type);
  }

  /** Assert flag is enabled for environment */
  async assertEnvironmentEnabled(envName: string): Promise<void> {
    await expect(this.environmentToggle(envName)).toBeChecked();
  }

  /** Assert flag is disabled for environment */
  async assertEnvironmentDisabled(envName: string): Promise<void> {
    await expect(this.environmentToggle(envName)).not.toBeChecked();
  }

  /** Assert environment has expected value */
  async assertEnvironmentValue(envName: string, value: string): Promise<void> {
    await expect(this.environmentValueInput(envName)).toHaveValue(value);
  }

  /** Assert edit button is visible */
  async assertCanEdit(): Promise<void> {
    await expect(this.editButton).toBeVisible();
  }

  /** Assert delete button is visible */
  async assertCanDelete(): Promise<void> {
    await expect(this.deleteButton).toBeVisible();
  }
}
