/**
 * Navigation Helper
 *
 * Centralizes common navigation patterns for table rows and detail pages.
 */

import { Locator, Page, expect } from '@playwright/test';
import { WaitHelper } from './wait.helper';

export class NavigationHelper {
  private readonly wait: WaitHelper;

  constructor(private readonly page: Page) {
    this.wait = new WaitHelper(page);
  }

  /**
   * Click the first link in a table and verify navigation to detail page
   */
  async clickFirstRowLink(
    tableRows: Locator,
    urlPattern: RegExp,
  ): Promise<{ name: string | null }> {
    const firstRow = tableRows.first();
    const link = firstRow.getByRole('link').first();
    const name = await link.textContent();

    await link.click();
    await expect(this.page).toHaveURL(urlPattern);

    return { name };
  }

  /**
   * Click a link in a row that matches the given text
   */
  async clickRowLinkByText(
    tableRows: Locator,
    text: string | RegExp,
    urlPattern: RegExp,
  ): Promise<void> {
    const row = tableRows.filter({ hasText: text });
    const link = row.getByRole('link').first();

    await link.click();
    await expect(this.page).toHaveURL(urlPattern);
  }

  /**
   * Navigate to a detail page and verify it loaded
   */
  async goToDetail(
    tableRows: Locator,
    itemName: string,
    urlPattern: RegExp,
    detailHeading: Locator,
  ): Promise<void> {
    await this.clickRowLinkByText(tableRows, itemName, urlPattern);
    await expect(detailHeading).toBeVisible();
  }

  /**
   * Go back from detail page and verify return to list
   */
  async goBackToList(backButton: Locator, listUrlPattern: RegExp): Promise<void> {
    await backButton.click();
    await expect(this.page).toHaveURL(listUrlPattern);
  }

  /**
   * Check if sidebar nav item is active
   */
  async isNavItemActive(navItemText: string | RegExp): Promise<boolean> {
    await this.wait.forRouteSettle();

    const navItem = this.page.locator('app-sidebar li').filter({ hasText: navItemText }).first();

    return navItem.evaluate((el) => el.classList.contains('nav-item--active'));
  }

  /**
   * Assert sidebar nav item is active
   */
  async assertNavItemActive(navItemText: string | RegExp): Promise<void> {
    const isActive = await this.isNavItemActive(navItemText);
    expect(isActive).toBeTruthy();
  }
}
