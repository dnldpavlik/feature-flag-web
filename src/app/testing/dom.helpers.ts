/**
 * DOM Query & Assertion Helpers
 *
 * Simplifies common DOM queries and assertions in component tests.
 */

import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

/**
 * Query a single element by CSS selector
 */
export function query<T>(fixture: ComponentFixture<T>, selector: string): DebugElement | null {
  return fixture.debugElement.query(By.css(selector));
}

/**
 * Query all elements by CSS selector
 */
export function queryAll<T>(fixture: ComponentFixture<T>, selector: string): DebugElement[] {
  return fixture.debugElement.queryAll(By.css(selector));
}

/**
 * Get table rows from data table
 */
export function getTableRows<T>(fixture: ComponentFixture<T>): DebugElement[] {
  return queryAll(fixture, '.data-table__body-wrap tbody tr, ui-data-table tbody tr');
}

/**
 * Get table row count
 */
export function getRowCount<T>(fixture: ComponentFixture<T>): number {
  return getTableRows(fixture).length;
}

/**
 * Assert element exists
 */
export function expectExists<T>(fixture: ComponentFixture<T>, selector: string): void {
  expect(query(fixture, selector)).toBeTruthy();
}

/**
 * Assert element does not exist
 */
export function expectNotExists<T>(fixture: ComponentFixture<T>, selector: string): void {
  expect(query(fixture, selector)).toBeFalsy();
}

/**
 * Assert element text contains string
 */
export function expectTextContains<T>(
  fixture: ComponentFixture<T>,
  selector: string,
  text: string,
): void {
  const el = query(fixture, selector);
  const content = el?.nativeElement.textContent?.trim() ?? '';
  expect(content).toContain(text);
}

/**
 * Assert heading exists with text
 */
export function expectHeading<T>(
  fixture: ComponentFixture<T>,
  text: string,
  level: 1 | 2 | 3 | 4 | 5 | 6 = 1,
): void {
  const heading = query(fixture, `h${level}`);
  expect(heading).toBeTruthy();
  expect(heading?.nativeElement.textContent).toContain(text);
}

/**
 * Assert empty state is visible
 */
export function expectEmptyState<T>(fixture: ComponentFixture<T>): void {
  expectExists(fixture, 'ui-empty-state');
}

/**
 * Assert empty state is not visible
 */
export function expectNoEmptyState<T>(fixture: ComponentFixture<T>): void {
  expectNotExists(fixture, 'ui-empty-state');
}

/**
 * Assert row count matches expected
 */
export function expectRowCount<T>(fixture: ComponentFixture<T>, expected: number): void {
  expect(getRowCount(fixture)).toBe(expected);
}
