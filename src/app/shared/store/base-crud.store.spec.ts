import { of, throwError, delay, Observable } from 'rxjs';

import { BaseCrudStore, StoreItem, BaseCrudStoreConfig } from './base-crud.store';

interface TestItem extends StoreItem {
  name: string;
  value: number;
}

class TestStore extends BaseCrudStore<TestItem> {
  constructor(config: Partial<BaseCrudStoreConfig<TestItem>> = {}) {
    super({
      idPrefix: 'test',
      initialData: [],
      ...config,
    });
  }

  // Expose protected methods for testing
  load(source: Observable<TestItem[]>): Promise<void> {
    return this.loadFromApi(source);
  }

  add(data: Omit<TestItem, 'id' | 'createdAt' | 'updatedAt'>, prepend = false): string {
    return this.addItem(data, prepend);
  }

  // Add without prepend parameter to test default branch
  addWithDefault(data: Omit<TestItem, 'id' | 'createdAt' | 'updatedAt'>): string {
    return this.addItem(data);
  }

  update(id: string, updates: Partial<Omit<TestItem, 'id' | 'createdAt'>>): void {
    this.updateItem(id, updates);
  }

  delete(id: string): boolean {
    return this.deleteItem(id);
  }

  bulkUpdate(
    predicate: (item: TestItem) => boolean,
    updater: (item: TestItem) => Partial<Omit<TestItem, 'id' | 'createdAt'>>,
  ): void {
    this.updateWhere(predicate, updater);
  }

  replaceAll(items: TestItem[]): void {
    this.setItems(items);
  }

  clear(): void {
    this.clearItems();
  }
}

describe('BaseCrudStore', () => {
  let store: TestStore;

  beforeEach(() => {
    store = new TestStore();
  });

  describe('initialization', () => {
    it('should start with loading false', () => {
      expect(store.loading()).toBe(false);
    });

    it('should start with error null', () => {
      expect(store.error()).toBeNull();
    });

    it('should start with empty items by default', () => {
      expect(store.items()).toEqual([]);
      expect(store.count()).toBe(0);
    });

    it('should accept initial data', () => {
      const initialData: TestItem[] = [
        {
          id: 'test_1',
          name: 'Item 1',
          value: 10,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 'test_2',
          name: 'Item 2',
          value: 20,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      const storeWithData = new TestStore({ initialData });

      expect(storeWithData.items()).toHaveLength(2);
      expect(storeWithData.count()).toBe(2);
    });

    it('should handle undefined initialData', () => {
      const storeWithUndefined = new TestStore({ initialData: undefined });

      expect(storeWithUndefined.items()).toEqual([]);
      expect(storeWithUndefined.count()).toBe(0);
    });
  });

  describe('addItem', () => {
    it('should add a new item with generated id and timestamps', () => {
      const id = store.add({ name: 'New Item', value: 42 });

      expect(id).toMatch(/^test_/);
      expect(store.items()).toHaveLength(1);

      const item = store.getById(id);
      expect(item).toBeDefined();
      expect(item?.name).toBe('New Item');
      expect(item?.value).toBe(42);
      expect(item?.createdAt).toBeDefined();
      expect(item?.updatedAt).toBeDefined();
    });

    it('should append items by default', () => {
      store.add({ name: 'First', value: 1 });
      store.add({ name: 'Second', value: 2 });

      const items = store.items();
      expect(items[0].name).toBe('First');
      expect(items[1].name).toBe('Second');
    });

    it('should prepend items when specified', () => {
      store.add({ name: 'First', value: 1 });
      store.add({ name: 'Second', value: 2 }, true);

      const items = store.items();
      expect(items[0].name).toBe('Second');
      expect(items[1].name).toBe('First');
    });

    it('should append items when prepend is explicitly false', () => {
      store.add({ name: 'First', value: 1 }, false);
      store.add({ name: 'Second', value: 2 }, false);

      const items = store.items();
      expect(items[0].name).toBe('First');
      expect(items[1].name).toBe('Second');
    });

    it('should append items when prepend parameter is omitted', () => {
      store.addWithDefault({ name: 'First', value: 1 });
      store.addWithDefault({ name: 'Second', value: 2 });

      const items = store.items();
      expect(items[0].name).toBe('First');
      expect(items[1].name).toBe('Second');
    });

    it('should update count signal', () => {
      expect(store.count()).toBe(0);

      store.add({ name: 'Item', value: 1 });
      expect(store.count()).toBe(1);

      store.add({ name: 'Item 2', value: 2 });
      expect(store.count()).toBe(2);
    });
  });

  describe('getById', () => {
    it('should return item when found', () => {
      const id = store.add({ name: 'Test', value: 100 });

      const item = store.getById(id);

      expect(item).toBeDefined();
      expect(item?.name).toBe('Test');
    });

    it('should return undefined when not found', () => {
      const item = store.getById('nonexistent');

      expect(item).toBeUndefined();
    });
  });

  describe('exists', () => {
    it('should return true when item exists', () => {
      const id = store.add({ name: 'Test', value: 1 });

      expect(store.exists(id)).toBe(true);
    });

    it('should return false when item does not exist', () => {
      expect(store.exists('nonexistent')).toBe(false);
    });
  });

  describe('updateItem', () => {
    it('should update item properties', () => {
      const id = store.add({ name: 'Original', value: 10 });

      store.update(id, { name: 'Updated', value: 20 });

      const item = store.getById(id);
      expect(item?.name).toBe('Updated');
      expect(item?.value).toBe(20);
    });

    it('should update only specified properties', () => {
      const id = store.add({ name: 'Original', value: 10 });

      store.update(id, { name: 'Updated' });

      const item = store.getById(id);
      expect(item?.name).toBe('Updated');
      expect(item?.value).toBe(10);
    });

    it('should update updatedAt timestamp', () => {
      const id = store.add({ name: 'Test', value: 1 });

      store.update(id, { name: 'Changed' });

      const item = store.getById(id);
      // updatedAt should be set with ISO timestamp format
      expect(item?.updatedAt).toBeDefined();
      expect(item?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should not modify createdAt', () => {
      const id = store.add({ name: 'Test', value: 1 });
      const originalCreatedAt = store.getById(id)?.createdAt;

      store.update(id, { name: 'Changed' });

      const item = store.getById(id);
      expect(item?.createdAt).toBe(originalCreatedAt);
    });

    it('should not affect other items', () => {
      const id1 = store.add({ name: 'Item 1', value: 1 });
      const id2 = store.add({ name: 'Item 2', value: 2 });

      store.update(id1, { name: 'Updated' });

      const item2 = store.getById(id2);
      expect(item2?.name).toBe('Item 2');
    });
  });

  describe('deleteItem', () => {
    it('should remove item from store', () => {
      const id1 = store.add({ name: 'Item 1', value: 1 });
      const id2 = store.add({ name: 'Item 2', value: 2 });

      const result = store.delete(id1);

      expect(result).toBe(true);
      expect(store.getById(id1)).toBeUndefined();
      expect(store.getById(id2)).toBeDefined();
      expect(store.count()).toBe(1);
    });

    it('should not delete last item by default', () => {
      const id = store.add({ name: 'Only Item', value: 1 });

      const result = store.delete(id);

      expect(result).toBe(false);
      expect(store.getById(id)).toBeDefined();
      expect(store.count()).toBe(1);
    });

    it('should delete last item when allowDeleteLast is true', () => {
      const storeWithDelete = new TestStore({ allowDeleteLast: true });
      const id = storeWithDelete.add({ name: 'Only Item', value: 1 });

      const result = storeWithDelete.delete(id);

      expect(result).toBe(true);
      expect(storeWithDelete.count()).toBe(0);
    });

    it('should return false when item not found', () => {
      store.add({ name: 'Item', value: 1 });

      const result = store.delete('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('updateWhere', () => {
    it('should update all items matching predicate', () => {
      store.add({ name: 'Low', value: 5 });
      store.add({ name: 'High', value: 15 });
      store.add({ name: 'Medium', value: 10 });

      store.bulkUpdate(
        (item) => item.value >= 10,
        () => ({ name: 'Updated' }),
      );

      const items = store.items();
      expect(items.find((i) => i.value === 5)?.name).toBe('Low');
      expect(items.find((i) => i.value === 15)?.name).toBe('Updated');
      expect(items.find((i) => i.value === 10)?.name).toBe('Updated');
    });

    it('should allow dynamic updates based on item', () => {
      store.add({ name: 'Item', value: 10 });
      store.add({ name: 'Item', value: 20 });

      store.bulkUpdate(
        () => true,
        (item) => ({ value: item.value * 2 }),
      );

      const items = store.items();
      expect(items[0].value).toBe(20);
      expect(items[1].value).toBe(40);
    });
  });

  describe('setItems', () => {
    it('should replace all items', () => {
      store.add({ name: 'Original', value: 1 });

      const newItems: TestItem[] = [
        {
          id: 'new_1',
          name: 'New 1',
          value: 100,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 'new_2',
          name: 'New 2',
          value: 200,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      store.replaceAll(newItems);

      expect(store.items()).toEqual(newItems);
      expect(store.count()).toBe(2);
    });
  });

  describe('clearItems', () => {
    it('should remove all items', () => {
      store.add({ name: 'Item 1', value: 1 });
      store.add({ name: 'Item 2', value: 2 });

      store.clear();

      expect(store.items()).toEqual([]);
      expect(store.count()).toBe(0);
    });
  });

  describe('loadFromApi', () => {
    const mockItems: TestItem[] = [
      {
        id: 'api_1',
        name: 'From API',
        value: 100,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: 'api_2',
        name: 'Also API',
        value: 200,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];

    it('should set loading to true during load', async () => {
      jest.useFakeTimers();
      const source$ = of(mockItems).pipe(delay(100));
      const promise = store.load(source$);

      expect(store.loading()).toBe(true);

      jest.advanceTimersByTime(100);
      await promise;
      jest.useRealTimers();
    });

    it('should set items from API response', async () => {
      await store.load(of(mockItems));

      expect(store.items()).toEqual(mockItems);
      expect(store.count()).toBe(2);
    });

    it('should set loading to false after success', async () => {
      await store.load(of(mockItems));

      expect(store.loading()).toBe(false);
    });

    it('should clear previous error on new load', async () => {
      // First trigger an error
      await store.load(throwError(() => new Error('fail')));
      expect(store.error()).toBe('fail');

      // Then load successfully
      await store.load(of(mockItems));
      expect(store.error()).toBeNull();
    });

    it('should set error message on failure', async () => {
      await store.load(throwError(() => new Error('Network error')));

      expect(store.error()).toBe('Network error');
    });

    it('should set loading to false after failure', async () => {
      await store.load(throwError(() => new Error('fail')));

      expect(store.loading()).toBe(false);
    });

    it('should not modify items on failure', async () => {
      store.add({ name: 'Existing', value: 1 });
      const existingItems = store.items();

      await store.load(throwError(() => new Error('fail')));

      expect(store.items()).toEqual(existingItems);
    });

    it('should handle non-Error thrown values', async () => {
      await store.load(throwError(() => 'string error'));

      expect(store.error()).toBe('Failed to load data');
    });
  });

  describe('signal reactivity', () => {
    it('should update items signal on add', () => {
      const itemsBefore = store.items();
      expect(itemsBefore).toHaveLength(0);

      store.add({ name: 'New', value: 1 });

      const itemsAfter = store.items();
      expect(itemsAfter).toHaveLength(1);
    });

    it('should update count signal on delete', () => {
      const id1 = store.add({ name: 'Item 1', value: 1 });
      store.add({ name: 'Item 2', value: 2 });

      expect(store.count()).toBe(2);

      store.delete(id1);

      expect(store.count()).toBe(1);
    });
  });
});
