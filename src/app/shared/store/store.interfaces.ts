import { Signal } from '@angular/core';

/**
 * Store Interfaces
 *
 * These interfaces define contracts for store patterns used throughout the application.
 * They enable type-safe dependency injection and testing.
 */

/**
 * Base interface for items managed by stores.
 * All entities must have an id for lookup operations.
 */
export interface Identifiable {
  readonly id: string;
}

/**
 * Interface for stores that provide read-only access to a collection.
 *
 * Use this interface when a component only needs to read data from a store,
 * not modify it. This follows the Interface Segregation Principle.
 *
 * @example
 * ```typescript
 * // Component that only needs to read projects
 * export class ProjectDisplayComponent {
 *   constructor(@Inject(PROJECT_STORE) private store: ReadableStore<Project>) {}
 *
 *   readonly projects = this.store.items;
 * }
 * ```
 */
export interface ReadableStore<T extends Identifiable> {
  /** Signal containing all items in the store */
  readonly items: Signal<T[]>;

  /** Signal containing the count of items */
  readonly count: Signal<number>;

  /** Find an item by its ID */
  getById(id: string): T | undefined;

  /** Check if an item with the given ID exists */
  exists(id: string): boolean;
}

/**
 * Interface for stores that support item selection.
 *
 * Many stores need to track a "current" or "selected" item for context.
 *
 * @example
 * ```typescript
 * const store: SelectableStore<Project> = inject(ProjectStore);
 * store.select('proj_123');
 * const current = store.selected();
 * ```
 */
export interface SelectableStore<T extends Identifiable> extends ReadableStore<T> {
  /** Signal containing the ID of the selected item */
  readonly selectedId: Signal<string>;

  /** Signal containing the selected item (or undefined if not found) */
  readonly selected: Signal<T | undefined>;

  /** Select an item by ID */
  select(id: string): void;
}

/**
 * Interface for stores that support creating items.
 *
 * @typeParam T - The item type
 * @typeParam C - The create input type (data needed to create a new item)
 */
export interface CreatableStore<T extends Identifiable, C> extends ReadableStore<T> {
  /** Add a new item to the store */
  add(input: C): void;
}

/**
 * Interface for stores that support deleting items.
 */
export interface DeletableStore<T extends Identifiable> extends ReadableStore<T> {
  /** Delete an item by ID */
  delete(id: string): void;
}

/**
 * Interface for stores that support updating items.
 *
 * @typeParam T - The item type
 * @typeParam U - The update input type (partial data for updates)
 */
export interface UpdatableStore<T extends Identifiable, U> extends ReadableStore<T> {
  /** Update an item by ID */
  update(id: string, updates: U): void;
}

/**
 * Combined interface for full CRUD store capabilities.
 *
 * @typeParam T - The item type
 * @typeParam C - The create input type
 * @typeParam U - The update input type
 *
 * @example
 * ```typescript
 * interface ProjectCrudStore extends CrudStore<Project, CreateProjectInput, UpdateProjectInput> {
 *   // Additional project-specific methods
 *   setDefaultProject(id: string): void;
 * }
 * ```
 */
export interface CrudStore<T extends Identifiable, C, U = Partial<T>>
  extends CreatableStore<T, C>, DeletableStore<T>, UpdatableStore<T, U> {}

/**
 * Interface for stores that support a "default" item pattern.
 *
 * Common for stores where one item can be marked as the default
 * (e.g., default project, default environment).
 */
export interface DefaultableStore<T extends Identifiable> extends ReadableStore<T> {
  /** Signal containing the default item (or undefined if none) */
  readonly default: Signal<T | undefined>;

  /** Set an item as the default */
  setDefault(id: string): void;
}

/**
 * Interface for stores that support filtering.
 *
 * @typeParam T - The item type
 * @typeParam F - The filter criteria type
 */
export interface FilterableStore<T extends Identifiable, F> extends ReadableStore<T> {
  /** Signal containing the current filter criteria */
  readonly filter: Signal<F>;

  /** Signal containing filtered items */
  readonly filteredItems: Signal<T[]>;

  /** Update the filter criteria */
  setFilter(filter: F): void;
}
