/**
 * Wait Helper
 *
 * Semantic wait utilities to replace magic timeout numbers.
 * Provides consistent, documented delays for common scenarios.
 */

import { Page } from '@playwright/test';

/** Standard delay durations (in milliseconds) */
export const Delays = {
  /** Short delay for micro-interactions (animations, focus) */
  SHORT: 100,

  /** Delay for search input debounce */
  SEARCH_DEBOUNCE: 300,

  /** Delay for form submissions and UI updates */
  FORM_SUBMISSION: 500,

  /** Delay for Angular routing to settle */
  ROUTE_SETTLE: 500,

  /** Delay for network operations */
  NETWORK: 1000,

  /** Long delay for complex operations */
  LONG: 2000,
} as const;

export class WaitHelper {
  constructor(private readonly page: Page) {}

  /**
   * Wait for search input debounce to complete
   */
  async forSearchDebounce(): Promise<void> {
    await this.page.waitForTimeout(Delays.SEARCH_DEBOUNCE);
  }

  /**
   * Wait for form submission and UI update
   */
  async forFormSubmission(): Promise<void> {
    await this.page.waitForTimeout(Delays.FORM_SUBMISSION);
  }

  /**
   * Wait for Angular routing to settle
   */
  async forRouteSettle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(Delays.ROUTE_SETTLE);
  }

  /**
   * Wait for animations to complete
   */
  async forAnimation(): Promise<void> {
    await this.page.waitForTimeout(Delays.SHORT);
  }

  /**
   * Wait for network operations
   */
  async forNetwork(): Promise<void> {
    await this.page.waitForTimeout(Delays.NETWORK);
  }

  /**
   * Wait for page to fully load
   */
  async forPageLoad(): Promise<void> {
    await this.page.waitForSelector('app-root', { state: 'attached' });
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for a URL pattern to match
   */
  async forUrl(pattern: RegExp): Promise<void> {
    await this.page.waitForURL(pattern);
  }

  /**
   * Wait for an element to be visible
   */
  async forVisible(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  /**
   * Wait for an element to be hidden
   */
  async forHidden(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'hidden' });
  }
}
