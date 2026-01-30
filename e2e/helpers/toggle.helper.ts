/**
 * Toggle Component Helper
 *
 * Centralizes all toggle switch interactions.
 * Toggle inputs are visually hidden (opacity: 0, width: 0, height: 0),
 * so we must click the label element instead.
 */

import { Locator, Page, expect } from '@playwright/test';

export class ToggleHelper {
  constructor(private readonly page: Page) {}

  /**
   * Get the toggle label (clickable element) for a toggle component
   */
  getToggleLabel(container?: Locator): Locator {
    const base = container ?? this.page;
    return base.locator('app-toggle label.toggle');
  }

  /**
   * Get the toggle input (for checking state)
   */
  getToggleInput(container?: Locator): Locator {
    const base = container ?? this.page;
    return base.locator('app-toggle input');
  }

  /**
   * Click a toggle and return the new checked state
   */
  async click(container?: Locator): Promise<boolean> {
    const label = this.getToggleLabel(container).first();
    const input = this.getToggleInput(container).first();

    await label.click();
    return input.isChecked();
  }

  /**
   * Get the current checked state of a toggle
   */
  async isChecked(container?: Locator): Promise<boolean> {
    const input = this.getToggleInput(container).first();
    return input.isChecked();
  }

  /**
   * Toggle and verify the state changed
   */
  async toggleAndVerify(container?: Locator): Promise<{ initial: boolean; final: boolean }> {
    const input = this.getToggleInput(container).first();
    const label = this.getToggleLabel(container).first();

    const initial = await input.isChecked();
    await label.click();
    const final = await input.isChecked();

    expect(final).toBe(!initial);
    return { initial, final };
  }

  /**
   * Toggle, verify change, then restore to original state
   */
  async toggleVerifyAndRestore(container?: Locator): Promise<void> {
    const { initial, final } = await this.toggleAndVerify(container);

    // Restore original state
    if (final !== initial) {
      await this.click(container);
    }
  }

  /**
   * Perform rapid clicks (for stress testing)
   */
  async rapidClicks(count: number, container?: Locator): Promise<boolean> {
    const label = this.getToggleLabel(container).first();
    const input = this.getToggleInput(container).first();

    for (let i = 0; i < count; i++) {
      await label.click();
    }

    return input.isChecked();
  }

  /**
   * Toggle by row text (finds toggle in a table row containing the text)
   */
  async toggleInRow(rowText: string | RegExp, tableLocator: Locator): Promise<boolean> {
    const row = tableLocator.locator('tbody tr, [role="row"]').filter({ hasText: rowText });
    return this.click(row);
  }
}
