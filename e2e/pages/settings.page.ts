/**
 * Settings Page Object
 *
 * @description Page object for the settings/preferences page.
 * @route /settings
 */

import { Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export type ThemeMode = 'light' | 'dark' | 'system';

export class SettingsPage extends BasePage {
  readonly path = '/settings';

  // ============================================================
  // Locators
  // ============================================================

  /** Tab navigation */
  get tabs(): Locator {
    return this.page.locator('ui-tabs, [role="tablist"]');
  }

  /** Profile tab */
  get profileTab(): Locator {
    return this.page.getByRole('tab', { name: /profile/i });
  }

  /** Theme tab */
  get themeTab(): Locator {
    return this.page.getByRole('tab', { name: /theme|appearance/i });
  }

  /** API Keys tab */
  get apiKeysTab(): Locator {
    return this.page.getByRole('tab', { name: /api|keys/i });
  }

  // ============================================================
  // Profile Section
  // ============================================================

  /** Profile form */
  get profileForm(): Locator {
    return this.page.locator('[data-testid="profile-form"], .profile-form');
  }

  /** Display name input */
  get displayNameInput(): Locator {
    return this.page.getByLabel(/display name|name/i);
  }

  /** Email input */
  get emailInput(): Locator {
    return this.page.getByLabel(/email/i);
  }

  /** Save profile button */
  get saveProfileButton(): Locator {
    return this.profileForm.getByRole('button', { name: /save/i });
  }

  // ============================================================
  // Theme Section
  // ============================================================

  /** Theme selector */
  get themeSelector(): Locator {
    return this.page.locator('[data-testid="theme-selector"], .theme-selector');
  }

  /** Light theme option */
  get lightThemeOption(): Locator {
    return this.themeSelector
      .locator('[data-testid="theme-light"], label')
      .filter({ hasText: /light/i });
  }

  /** Dark theme option */
  get darkThemeOption(): Locator {
    return this.themeSelector
      .locator('[data-testid="theme-dark"], label')
      .filter({ hasText: /dark/i });
  }

  /** System theme option */
  get systemThemeOption(): Locator {
    return this.themeSelector
      .locator('[data-testid="theme-system"], label')
      .filter({ hasText: /system/i });
  }

  // ============================================================
  // API Keys Section
  // ============================================================

  /** API keys list */
  get apiKeysList(): Locator {
    return this.page.locator('[data-testid="api-keys-list"], .api-keys');
  }

  /** Create API key button */
  get createApiKeyButton(): Locator {
    return this.button(/create|generate.*key/i);
  }

  /** API key rows */
  get apiKeyRows(): Locator {
    return this.apiKeysList.locator('tr, [data-testid="api-key-row"]');
  }

  /** Revoke key button */
  revokeKeyButton(keyName: string): Locator {
    return this.apiKeysList
      .locator('tr')
      .filter({ hasText: keyName })
      .getByRole('button', { name: /revoke|delete/i });
  }

  // ============================================================
  // Actions
  // ============================================================

  /** Switch to profile tab */
  async goToProfileTab(): Promise<void> {
    await this.profileTab.click();
  }

  /** Switch to theme tab */
  async goToThemeTab(): Promise<void> {
    await this.themeTab.click();
  }

  /** Switch to API keys tab */
  async goToApiKeysTab(): Promise<void> {
    await this.apiKeysTab.click();
  }

  /** Update display name */
  async updateDisplayName(name: string): Promise<void> {
    await this.displayNameInput.fill(name);
    await this.saveProfileButton.click();
  }

  /** Select theme */
  async selectTheme(theme: ThemeMode): Promise<void> {
    switch (theme) {
      case 'light':
        await this.lightThemeOption.click();
        break;
      case 'dark':
        await this.darkThemeOption.click();
        break;
      case 'system':
        await this.systemThemeOption.click();
        break;
    }
  }

  /** Create a new API key */
  async createApiKey(): Promise<void> {
    await this.createApiKeyButton.click();
  }

  /** Revoke an API key */
  async revokeApiKey(keyName: string): Promise<void> {
    await this.revokeKeyButton(keyName).click();
    await this.confirmModal();
  }

  // ============================================================
  // Assertions
  // ============================================================

  /** Assert page has loaded */
  async assertPageLoaded(): Promise<void> {
    await this.assertAtPage();
    await expect(this.tabs).toBeVisible();
  }

  /** Assert theme is selected */
  async assertThemeSelected(theme: ThemeMode): Promise<void> {
    let option: Locator;
    switch (theme) {
      case 'light':
        option = this.lightThemeOption;
        break;
      case 'dark':
        option = this.darkThemeOption;
        break;
      case 'system':
        option = this.systemThemeOption;
        break;
    }
    await expect(option.locator('input')).toBeChecked();
  }

  /** Assert API key exists */
  async assertApiKeyExists(keyName: string): Promise<void> {
    await expect(this.apiKeysList.locator('tr').filter({ hasText: keyName })).toBeVisible();
  }
}
