/**
 * Store Test Helpers
 *
 * Common assertions and utilities for testing Angular signal-based stores.
 */

import { Signal } from '@angular/core';

/**
 * Base interface for store items
 */
interface StoreItem {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Assert signal exists and is callable
 */
export function expectSignal<T>(signal: Signal<T>): void {
  expect(typeof signal).toBe('function');
}

/**
 * Assert store has items
 */
export function expectHasItems<T>(items: Signal<T[]>, minCount = 1): void {
  expect(items().length).toBeGreaterThanOrEqual(minCount);
}

/**
 * Assert store is empty
 */
export function expectEmpty<T>(items: Signal<T[]>): void {
  expect(items().length).toBe(0);
}

/**
 * Assert item count
 */
export function expectItemCount<T>(items: Signal<T[]>, expected: number): void {
  expect(items().length).toBe(expected);
}

/**
 * Assert item does not exist by ID
 */
export function expectItemNotExists<T extends StoreItem>(items: Signal<T[]>, id: string): void {
  const item = items().find((i) => i.id === id);
  expect(item).toBeUndefined();
}

/**
 * Get item count before operation (for CRUD assertions)
 */
export function getCountBefore<T>(items: Signal<T[]>): number {
  return items().length;
}

/**
 * Assert item was added (count increased by 1)
 */
export function expectItemAdded<T>(items: Signal<T[]>, countBefore: number): void {
  expect(items().length).toBe(countBefore + 1);
}

/**
 * Assert item was removed (count decreased by 1)
 */
export function expectItemRemoved<T>(items: Signal<T[]>, countBefore: number): void {
  expect(items().length).toBe(countBefore - 1);
}

/**
 * Find item by key field
 */
export function findByKey<T extends { key: string }>(
  items: Signal<T[]>,
  key: string,
): T | undefined {
  return items().find((i) => i.key === key);
}
