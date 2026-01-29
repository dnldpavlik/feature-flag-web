/**
 * Segment List Page Object
 *
 * @description Page object for the user segments list view.
 * @route /segments
 */

import { Locator, expect } from '@playwright/test';
import { BasePage } from '../base.page';

export interface SegmentFormData {
  name: string;
  key?: string;
  description?: string;
}

export class SegmentListPage extends BasePage {
  readonly path = '/segments';

  // ============================================================
  // Locators
  // ============================================================

  /** Create segment button */
  get createButton(): Locator {
    return this.button(/create|new segment/i);
  }

  /** Segment list/table */
  get segmentList(): Locator {
    return this.page.locator('[data-testid="segment-list"], app-data-table');
  }

  /** All segment rows */
  get segmentRows(): Locator {
    return this.tableRows;
  }

  /** Get segment row by name */
  segmentRow(name: string | RegExp): Locator {
    return this.tableRow(name);
  }

  /** Segment name link */
  segmentLink(name: string): Locator {
    return this.segmentRow(name).getByRole('link');
  }

  /** Edit button for a segment */
  editButton(name: string): Locator {
    return this.segmentRow(name).getByRole('button', { name: /edit/i });
  }

  /** Delete button for a segment */
  deleteButton(name: string): Locator {
    return this.segmentRow(name).getByRole('button', { name: /delete/i });
  }

  // ============================================================
  // Create Form
  // ============================================================

  /** Create form */
  get createForm(): Locator {
    return this.page.locator('.segment-form, [data-testid="segment-form"]');
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

  /** Save button */
  get saveButton(): Locator {
    return this.createForm.getByRole('button', { name: /save|create/i });
  }

  /** Cancel button */
  get cancelButton(): Locator {
    return this.createForm.getByRole('button', { name: /cancel/i });
  }

  // ============================================================
  // Actions
  // ============================================================

  /** Click create button */
  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  /** Click on a segment */
  async clickSegment(name: string): Promise<void> {
    await this.segmentLink(name).click();
  }

  /** Click edit for a segment */
  async clickEdit(name: string): Promise<void> {
    await this.editButton(name).click();
  }

  /** Click delete for a segment */
  async clickDelete(name: string): Promise<void> {
    await this.deleteButton(name).click();
  }

  /** Fill the form */
  async fillForm(data: SegmentFormData): Promise<void> {
    await this.nameInput.fill(data.name);
    if (data.key) await this.keyInput.fill(data.key);
    if (data.description) await this.descriptionInput.fill(data.description);
  }

  /** Submit the form */
  async submitForm(): Promise<void> {
    await this.saveButton.click();
  }

  /** Create a new segment */
  async createSegment(data: SegmentFormData): Promise<void> {
    await this.clickCreate();
    await this.fillForm(data);
    await this.submitForm();
  }

  /** Delete a segment */
  async deleteSegment(name: string): Promise<void> {
    await this.clickDelete(name);
    await this.confirmModal();
  }

  /** Get segment count */
  async getSegmentCount(): Promise<number> {
    return this.segmentRows.count();
  }

  // ============================================================
  // Assertions
  // ============================================================

  /** Assert page has loaded */
  async assertPageLoaded(): Promise<void> {
    await this.assertAtPage();
    await expect(this.createButton).toBeVisible();
  }

  /** Assert segment exists */
  async assertSegmentExists(name: string | RegExp): Promise<void> {
    await expect(this.segmentRow(name)).toBeVisible();
  }

  /** Assert segment does not exist */
  async assertSegmentNotExists(name: string | RegExp): Promise<void> {
    await expect(this.segmentRow(name)).not.toBeVisible();
  }
}
