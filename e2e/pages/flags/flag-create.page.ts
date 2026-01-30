/**
 * Flag Create Page Object
 *
 * @description Page object for the create new feature flag form.
 * @route /flags/new
 */

import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export type FlagType = 'boolean' | 'string' | 'number' | 'json';

export interface FlagFormData {
  name: string;
  key?: string;
  description?: string;
  type?: FlagType;
  enabled?: boolean;
  environments?: string[];
}

export class FlagCreatePage extends BasePage {
  readonly path = '/flags/new';

  // ============================================================
  // Locators
  // ============================================================

  /** Form container */
  get form(): Locator {
    return this.page.locator('form, .flag-create__form');
  }

  /** Name input field */
  get nameInput(): Locator {
    return this.field('Name');
  }

  /** Key input field */
  get keyInput(): Locator {
    return this.field('Key');
  }

  /** Description textarea */
  get descriptionInput(): Locator {
    return this.field('Description');
  }

  /** Flag type selector */
  get typeSelect(): Locator {
    return this.select('Type');
  }

  /** Enabled toggle */
  get enabledToggle(): Locator {
    return this.page.locator('app-toggle input, [role="switch"]').first();
  }

  /** Environment checkboxes container */
  get environmentsSection(): Locator {
    return this.page.locator('[data-testid="environments"], .flag-create__environments');
  }

  /** Create button (form submit button) */
  get createButton(): Locator {
    return this.form.getByRole('button', { name: /create|save/i });
  }

  /** Cancel button */
  get cancelButton(): Locator {
    return this.button(/cancel/i);
  }

  /** Form validation errors */
  get validationErrors(): Locator {
    return this.page.locator('.form-field__error, [role="alert"]');
  }

  // ============================================================
  // Actions
  // ============================================================

  /** Fill the flag name */
  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  /** Fill the flag key */
  async fillKey(key: string): Promise<void> {
    await this.keyInput.fill(key);
  }

  /** Fill the description */
  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.fill(description);
  }

  /** Select flag type */
  async selectType(type: FlagType): Promise<void> {
    await this.typeSelect.selectOption(type);
  }

  /** Toggle the enabled state */
  async toggleEnabled(): Promise<void> {
    await this.enabledToggle.click();
  }

  /** Set enabled state */
  async setEnabled(enabled: boolean): Promise<void> {
    const isCurrentlyEnabled = await this.enabledToggle.isChecked();
    if (isCurrentlyEnabled !== enabled) {
      await this.toggleEnabled();
    }
  }

  /** Toggle environment enablement */
  async toggleEnvironment(envName: string): Promise<void> {
    const checkbox = this.environmentsSection
      .locator(`label`)
      .filter({ hasText: envName })
      .locator('input');
    await checkbox.click();
  }

  /** Enable specific environments */
  async enableEnvironments(envNames: string[]): Promise<void> {
    for (const name of envNames) {
      const checkbox = this.environmentsSection
        .locator(`label`)
        .filter({ hasText: name })
        .locator('input');
      await checkbox.check();
    }
  }

  /** Fill the entire form */
  async fillForm(data: FlagFormData): Promise<void> {
    await this.fillName(data.name);

    if (data.key) {
      await this.fillKey(data.key);
    }

    if (data.description) {
      await this.fillDescription(data.description);
    }

    if (data.type) {
      await this.selectType(data.type);
    }

    if (data.enabled !== undefined) {
      await this.setEnabled(data.enabled);
    }

    if (data.environments) {
      await this.enableEnvironments(data.environments);
    }
  }

  /** Submit the form */
  async submit(): Promise<void> {
    await this.createButton.click();
  }

  /** Cancel and go back */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /** Create a flag with the given data */
  async createFlag(data: FlagFormData): Promise<void> {
    await this.fillForm(data);
    await this.submit();
  }

  /** Clear all form fields */
  async clearForm(): Promise<void> {
    await this.nameInput.clear();
    await this.keyInput.clear();
    await this.descriptionInput.clear();
  }

  // ============================================================
  // Assertions
  // ============================================================

  /** Assert page has loaded */
  async assertPageLoaded(): Promise<void> {
    await this.assertAtPage();
    await expect(this.form).toBeVisible();
    await expect(this.createButton).toBeVisible();
  }

  /** Assert form has validation error */
  async assertHasValidationError(message?: string | RegExp): Promise<void> {
    if (message) {
      await expect(this.validationErrors.filter({ hasText: message })).toBeVisible();
    } else {
      await expect(this.validationErrors.first()).toBeVisible();
    }
  }

  /** Assert form has no validation errors */
  async assertNoValidationErrors(): Promise<void> {
    await expect(this.validationErrors).not.toBeVisible();
  }

  /** Assert create button is disabled */
  async assertCreateDisabled(): Promise<void> {
    await expect(this.createButton).toBeDisabled();
  }

  /** Assert create button is enabled */
  async assertCreateEnabled(): Promise<void> {
    await expect(this.createButton).toBeEnabled();
  }

  /** Assert key was auto-generated from name */
  async assertKeyAutoGenerated(expectedKey: string): Promise<void> {
    await expect(this.keyInput).toHaveValue(expectedKey);
  }
}
