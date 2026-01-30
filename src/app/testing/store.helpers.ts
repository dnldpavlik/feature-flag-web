/**
 * Store Test Helpers
 *
 * Common assertions and utilities for testing Angular signal-based stores.
 */

import { Signal } from '@angular/core';

/**
 * Base interface for store items
 */
export interface StoreItem {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
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
 * Assert item exists by ID
 */
export function expectItemExists<T extends StoreItem>(items: Signal<T[]>, id: string): void {
  const item = items().find((i) => i.id === id);
  expect(item).toBeDefined();
}

/**
 * Assert item does not exist by ID
 */
export function expectItemNotExists<T extends StoreItem>(items: Signal<T[]>, id: string): void {
  const item = items().find((i) => i.id === id);
  expect(item).toBeUndefined();
}

/**
 * Assert ID matches prefix pattern (e.g., 'flag_xxx', 'env_xxx')
 */
export function expectIdPattern(id: string, prefix: string): void {
  expect(id).toMatch(new RegExp(`^${prefix}_`));
}

/**
 * Assert timestamp is set (either as Date object or ISO string)
 */
export function expectTimestamp(date: Date | string | undefined): void {
  expect(date).toBeDefined();
  if (typeof date === 'string') {
    // ISO string timestamp
    expect(new Date(date).toISOString()).toBe(date);
  } else {
    expect(date).toBeInstanceOf(Date);
  }
}

/**
 * Assert createdAt and updatedAt are set
 */
export function expectTimestamps(item: StoreItem): void {
  expectTimestamp(item.createdAt as Date | string | undefined);
  expectTimestamp(item.updatedAt as Date | string | undefined);
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

/**
 * Find item by ID
 */
export function findById<T extends StoreItem>(items: Signal<T[]>, id: string): T | undefined {
  return items().find((i) => i.id === id);
}

/**
 * Assert item property value
 */
export function expectItemProperty<T extends StoreItem, K extends keyof T>(
  items: Signal<T[]>,
  id: string,
  property: K,
  expected: T[K],
): void {
  const item = findById(items, id);
  expect(item).toBeDefined();
  expect(item?.[property]).toBe(expected);
}

/**
 * Create a test for standard store CRUD operations
 * Returns test cases that can be used with it.each or describe blocks
 */
export interface CrudTestConfig<T extends StoreItem> {
  getItems: () => Signal<T[]>;
  addItem: (item: Partial<T>) => void;
  deleteItem: (id: string) => void;
  idPrefix: string;
  createInput: () => Partial<T>;
}

export function testStoreCrud<T extends StoreItem>(config: CrudTestConfig<T>): void {
  describe('CRUD operations', () => {
    it('should have initial items', () => {
      expectHasItems(config.getItems());
    });

    it('should add new item', () => {
      const countBefore = getCountBefore(config.getItems());
      config.addItem(config.createInput());
      expectItemAdded(config.getItems(), countBefore);
    });

    it('should generate ID with correct prefix', () => {
      config.addItem(config.createInput());
      const items = config.getItems()();
      const newest = items[0]; // Assuming prepend
      expectIdPattern(newest.id, config.idPrefix);
    });

    it('should delete item by ID', () => {
      const items = config.getItems()();
      if (items.length > 1) {
        const itemToDelete = items[items.length - 1];
        const countBefore = items.length;
        config.deleteItem(itemToDelete.id);
        expectItemRemoved(config.getItems(), countBefore);
        expectItemNotExists(config.getItems(), itemToDelete.id);
      }
    });
  });
}
