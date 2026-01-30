import { computed, signal, Signal, WritableSignal } from '@angular/core';

import { createId, createTimestamp } from '@/app/shared/utils/id.utils';

/**
 * Base interface for all store items.
 * All entities managed by BaseCrudStore must have these properties.
 */
export interface StoreItem {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Configuration for creating a BaseCrudStore instance.
 */
export interface BaseCrudStoreConfig<T extends StoreItem> {
  /** Prefix for generated IDs (e.g., 'proj', 'env', 'seg') */
  idPrefix: string;
  /** Initial seed data for the store */
  initialData?: T[];
  /** Whether to allow deletion when only one item remains (default: false) */
  allowDeleteLast?: boolean;
}

/**
 * Abstract base class for CRUD stores using Angular signals.
 *
 * Provides common functionality for:
 * - State management with signals
 * - CRUD operations (create, read, update, delete)
 * - ID generation and timestamps
 *
 * @example
 * ```typescript
 * @Injectable({ providedIn: 'root' })
 * export class ProjectStore extends BaseCrudStore<Project> {
 *   constructor() {
 *     super({ idPrefix: 'proj', initialData: [...] });
 *   }
 *
 *   // Add specialized methods here
 * }
 * ```
 */
export abstract class BaseCrudStore<T extends StoreItem> {
  /** Internal writable signal for store items */
  protected readonly _items: WritableSignal<T[]>;

  /** ID prefix for generating new item IDs */
  protected readonly idPrefix: string;

  /** Whether deletion is allowed when only one item remains */
  protected readonly allowDeleteLast: boolean;

  /** Public readonly signal for store items */
  readonly items: Signal<T[]>;

  /** Computed count of items in the store */
  readonly count: Signal<number>;

  constructor(config: BaseCrudStoreConfig<T>) {
    this.idPrefix = config.idPrefix;
    this.allowDeleteLast = config.allowDeleteLast ?? false;
    this._items = signal<T[]>(config.initialData ?? []);
    this.items = this._items.asReadonly();
    this.count = computed(() => this._items().length);
  }

  /**
   * Find an item by its ID.
   */
  getById(id: string): T | undefined {
    return this._items().find((item) => item.id === id);
  }

  /**
   * Check if an item with the given ID exists.
   */
  exists(id: string): boolean {
    return this._items().some((item) => item.id === id);
  }

  /**
   * Delete an item by ID.
   * Returns true if the item was deleted, false otherwise.
   */
  protected deleteItem(id: string): boolean {
    if (!this.allowDeleteLast && this._items().length <= 1) {
      return false;
    }

    const initialLength = this._items().length;
    this._items.update((items) => items.filter((item) => item.id !== id));
    return this._items().length < initialLength;
  }

  /**
   * Update an item by ID with partial updates.
   * Automatically sets updatedAt timestamp.
   */
  protected updateItem(id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): void {
    const stamp = createTimestamp();

    this._items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: stamp } : item)),
    );
  }

  /**
   * Add a new item to the store.
   * Generates ID and timestamps automatically.
   *
   * @param data - Item data without id, createdAt, updatedAt
   * @param prepend - If true, adds to beginning of list (default: false)
   * @returns The ID of the newly created item
   */
  protected addItem(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>, prepend = false): string {
    const stamp = createTimestamp();
    const id = createId(this.idPrefix);

    const newItem = {
      ...data,
      id,
      createdAt: stamp,
      updatedAt: stamp,
    } as T;

    this._items.update((items) => (prepend ? [newItem, ...items] : [...items, newItem]));

    return id;
  }

  /**
   * Update multiple items matching a predicate.
   * Useful for bulk operations like setting a default.
   */
  protected updateWhere(
    predicate: (item: T) => boolean,
    updater: (item: T) => Partial<Omit<T, 'id' | 'createdAt'>>,
  ): void {
    const stamp = createTimestamp();

    this._items.update((items) =>
      items.map((item) => {
        if (!predicate(item)) return item;
        const updates = updater(item);
        return { ...item, ...updates, updatedAt: stamp };
      }),
    );
  }

  /**
   * Replace all items in the store.
   * Useful for loading data from an API.
   */
  protected setItems(items: T[]): void {
    this._items.set(items);
  }

  /**
   * Clear all items from the store.
   */
  protected clearItems(): void {
    this._items.set([]);
  }
}
