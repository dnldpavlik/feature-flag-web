/**
 * Dashboard Page Object
 *
 * @description Page object for the main dashboard view.
 * @route /dashboard
 */

import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly path = '/dashboard';

  // ============================================================
  // Locators
  // ============================================================

  /** Stat cards showing overview metrics */
  get statCards(): Locator {
    return this.page.locator('ui-stat-card');
  }

  /** Get stat card by title */
  statCard(title: string): Locator {
    return this.statCards.filter({ hasText: title });
  }

  /** Total flags stat card */
  get totalFlagsCard(): Locator {
    return this.statCard('Flags');
  }

  /** Active flags stat card */
  get activeFlagsCard(): Locator {
    return this.statCard('Active');
  }

  /** Environments stat card */
  get environmentsCard(): Locator {
    return this.statCard('Environments');
  }

  /** Recent activity section */
  get recentActivity(): Locator {
    return this.page.locator('[data-testid="recent-activity"], .recent-activity');
  }

  /** Quick actions section */
  get quickActions(): Locator {
    return this.page.locator('[data-testid="quick-actions"], .quick-actions');
  }

  // ============================================================
  // Actions
  // ============================================================

  /** Click on a stat card to navigate to its detail page */
  async clickStatCard(title: string): Promise<void> {
    await this.statCard(title).click();
  }

  /** Get the value displayed in a stat card */
  async getStatValue(title: string): Promise<string> {
    const card = this.statCard(title);
    const value = card.locator('.stat-card__value, [data-testid="stat-value"]');
    return value.textContent() || '';
  }

  // ============================================================
  // Assertions
  // ============================================================

  /** Assert dashboard has loaded with expected elements */
  async assertDashboardLoaded(): Promise<void> {
    await this.assertAtPage();
    await this.assertVisible(this.statCards.first());
  }

  /** Assert stat card shows expected value */
  async assertStatValue(title: string, expectedValue: string | RegExp): Promise<void> {
    const value = await this.getStatValue(title);
    if (typeof expectedValue === 'string') {
      if (value.trim() !== expectedValue) {
        throw new Error(`Expected stat "${title}" to be "${expectedValue}" but got "${value}"`);
      }
    } else {
      if (!expectedValue.test(value)) {
        throw new Error(`Expected stat "${title}" to match ${expectedValue} but got "${value}"`);
      }
    }
  }
}
