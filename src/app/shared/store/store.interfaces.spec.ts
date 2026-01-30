import { signal, computed } from '@angular/core';
import {
  Identifiable,
  ReadableStore,
  SelectableStore,
  CreatableStore,
  DeletableStore,
  UpdatableStore,
  CrudStore,
  DefaultableStore,
  FilterableStore,
} from './store.interfaces';

/**
 * Tests for store interfaces.
 *
 * Since interfaces are compile-time only, these tests verify that:
 * 1. Interfaces can be properly implemented
 * 2. Implementations satisfy the type contracts
 * 3. Interface methods work as expected
 */

// Test entity
interface TestItem extends Identifiable {
  id: string;
  name: string;
  isDefault?: boolean;
}

// Create input type
interface CreateTestInput {
  name: string;
}

// Update input type
interface UpdateTestInput {
  name?: string;
}

// Filter type
interface TestFilter {
  query: string;
}

describe('Store Interfaces', () => {
  describe('Identifiable', () => {
    it('should require id property', () => {
      const item: Identifiable = { id: 'test_1' };
      expect(item.id).toBe('test_1');
    });

    it('should allow additional properties', () => {
      const item: TestItem = { id: 'test_1', name: 'Test' };
      expect(item.id).toBe('test_1');
      expect(item.name).toBe('Test');
    });
  });

  describe('ReadableStore', () => {
    it('should be implementable with signals', () => {
      const _items = signal<TestItem[]>([{ id: 'test_1', name: 'Test' }]);

      const store: ReadableStore<TestItem> = {
        items: _items.asReadonly(),
        count: computed(() => _items().length),
        getById: (id: string) => _items().find((item) => item.id === id),
        exists: (id: string) => _items().some((item) => item.id === id),
      };

      expect(store.items()).toHaveLength(1);
      expect(store.count()).toBe(1);
      expect(store.getById('test_1')?.name).toBe('Test');
      expect(store.exists('test_1')).toBe(true);
      expect(store.exists('nonexistent')).toBe(false);
    });
  });

  describe('SelectableStore', () => {
    it('should extend ReadableStore with selection', () => {
      const _items = signal<TestItem[]>([
        { id: 'test_1', name: 'First' },
        { id: 'test_2', name: 'Second' },
      ]);
      const _selectedId = signal<string>('test_1');

      const store: SelectableStore<TestItem> = {
        items: _items.asReadonly(),
        count: computed(() => _items().length),
        getById: (id: string) => _items().find((item) => item.id === id),
        exists: (id: string) => _items().some((item) => item.id === id),
        selectedId: _selectedId.asReadonly(),
        selected: computed(() => _items().find((item) => item.id === _selectedId())),
        select: (id: string) => _selectedId.set(id),
      };

      expect(store.selectedId()).toBe('test_1');
      expect(store.selected()?.name).toBe('First');

      store.select('test_2');
      expect(store.selectedId()).toBe('test_2');
      expect(store.selected()?.name).toBe('Second');
    });
  });

  describe('CreatableStore', () => {
    it('should extend ReadableStore with add method', () => {
      const _items = signal<TestItem[]>([]);
      let idCounter = 0;

      const store: CreatableStore<TestItem, CreateTestInput> = {
        items: _items.asReadonly(),
        count: computed(() => _items().length),
        getById: (id: string) => _items().find((item) => item.id === id),
        exists: (id: string) => _items().some((item) => item.id === id),
        add: (input: CreateTestInput) => {
          idCounter++;
          _items.update((items) => [...items, { id: `test_${idCounter}`, name: input.name }]);
        },
      };

      expect(store.count()).toBe(0);

      store.add({ name: 'New Item' });

      expect(store.count()).toBe(1);
      expect(store.items()[0].name).toBe('New Item');
    });
  });

  describe('DeletableStore', () => {
    it('should extend ReadableStore with delete method', () => {
      const _items = signal<TestItem[]>([
        { id: 'test_1', name: 'First' },
        { id: 'test_2', name: 'Second' },
      ]);

      const store: DeletableStore<TestItem> = {
        items: _items.asReadonly(),
        count: computed(() => _items().length),
        getById: (id: string) => _items().find((item) => item.id === id),
        exists: (id: string) => _items().some((item) => item.id === id),
        delete: (id: string) => {
          _items.update((items) => items.filter((item) => item.id !== id));
        },
      };

      expect(store.count()).toBe(2);

      store.delete('test_1');

      expect(store.count()).toBe(1);
      expect(store.exists('test_1')).toBe(false);
      expect(store.exists('test_2')).toBe(true);
    });
  });

  describe('UpdatableStore', () => {
    it('should extend ReadableStore with update method', () => {
      const _items = signal<TestItem[]>([{ id: 'test_1', name: 'Original' }]);

      const store: UpdatableStore<TestItem, UpdateTestInput> = {
        items: _items.asReadonly(),
        count: computed(() => _items().length),
        getById: (id: string) => _items().find((item) => item.id === id),
        exists: (id: string) => _items().some((item) => item.id === id),
        update: (id: string, updates: UpdateTestInput) => {
          _items.update((items) =>
            items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
          );
        },
      };

      expect(store.getById('test_1')?.name).toBe('Original');

      store.update('test_1', { name: 'Updated' });

      expect(store.getById('test_1')?.name).toBe('Updated');
    });
  });

  describe('CrudStore', () => {
    it('should combine all CRUD operations', () => {
      const _items = signal<TestItem[]>([]);
      let idCounter = 0;

      const store: CrudStore<TestItem, CreateTestInput, UpdateTestInput> = {
        items: _items.asReadonly(),
        count: computed(() => _items().length),
        getById: (id: string) => _items().find((item) => item.id === id),
        exists: (id: string) => _items().some((item) => item.id === id),
        add: (input: CreateTestInput) => {
          idCounter++;
          _items.update((items) => [...items, { id: `test_${idCounter}`, name: input.name }]);
        },
        update: (id: string, updates: UpdateTestInput) => {
          _items.update((items) =>
            items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
          );
        },
        delete: (id: string) => {
          _items.update((items) => items.filter((item) => item.id !== id));
        },
      };

      // Create
      store.add({ name: 'Item 1' });
      expect(store.count()).toBe(1);

      // Read
      const item = store.getById('test_1');
      expect(item?.name).toBe('Item 1');

      // Update
      store.update('test_1', { name: 'Updated Item' });
      expect(store.getById('test_1')?.name).toBe('Updated Item');

      // Delete
      store.delete('test_1');
      expect(store.count()).toBe(0);
    });
  });

  describe('DefaultableStore', () => {
    it('should support default item pattern', () => {
      const _items = signal<TestItem[]>([
        { id: 'test_1', name: 'First', isDefault: true },
        { id: 'test_2', name: 'Second', isDefault: false },
      ]);

      const store: DefaultableStore<TestItem> = {
        items: _items.asReadonly(),
        count: computed(() => _items().length),
        getById: (id: string) => _items().find((item) => item.id === id),
        exists: (id: string) => _items().some((item) => item.id === id),
        default: computed(() => _items().find((item) => item.isDefault)),
        setDefault: (id: string) => {
          _items.update((items) =>
            items.map((item) => ({
              ...item,
              isDefault: item.id === id,
            })),
          );
        },
      };

      expect(store.default()?.id).toBe('test_1');

      store.setDefault('test_2');

      expect(store.default()?.id).toBe('test_2');
      expect(store.getById('test_1')?.isDefault).toBe(false);
      expect(store.getById('test_2')?.isDefault).toBe(true);
    });
  });

  describe('FilterableStore', () => {
    it('should support filtering', () => {
      const _items = signal<TestItem[]>([
        { id: 'test_1', name: 'Apple' },
        { id: 'test_2', name: 'Banana' },
        { id: 'test_3', name: 'Apricot' },
      ]);
      const _filter = signal<TestFilter>({ query: '' });

      const store: FilterableStore<TestItem, TestFilter> = {
        items: _items.asReadonly(),
        count: computed(() => _items().length),
        getById: (id: string) => _items().find((item) => item.id === id),
        exists: (id: string) => _items().some((item) => item.id === id),
        filter: _filter.asReadonly(),
        filteredItems: computed(() => {
          const query = _filter().query.toLowerCase();
          if (!query) return _items();
          return _items().filter((item) => item.name.toLowerCase().includes(query));
        }),
        setFilter: (filter: TestFilter) => _filter.set(filter),
      };

      expect(store.filteredItems()).toHaveLength(3);

      store.setFilter({ query: 'ap' });

      expect(store.filteredItems()).toHaveLength(2);
      expect(store.filteredItems().map((i) => i.name)).toEqual(['Apple', 'Apricot']);

      // Original items unchanged
      expect(store.items()).toHaveLength(3);
    });
  });

  describe('Interface Composition', () => {
    it('should allow combining multiple interfaces', () => {
      interface SelectableDefaultableStore<T extends Identifiable>
        extends SelectableStore<T>, DefaultableStore<T> {}

      const _items = signal<TestItem[]>([
        { id: 'test_1', name: 'First', isDefault: true },
        { id: 'test_2', name: 'Second', isDefault: false },
      ]);
      const _selectedId = signal<string>('test_2');

      const store: SelectableDefaultableStore<TestItem> = {
        items: _items.asReadonly(),
        count: computed(() => _items().length),
        getById: (id: string) => _items().find((item) => item.id === id),
        exists: (id: string) => _items().some((item) => item.id === id),
        selectedId: _selectedId.asReadonly(),
        selected: computed(() => _items().find((item) => item.id === _selectedId())),
        select: (id: string) => _selectedId.set(id),
        default: computed(() => _items().find((item) => item.isDefault)),
        setDefault: (id: string) => {
          _items.update((items) =>
            items.map((item) => ({
              ...item,
              isDefault: item.id === id,
            })),
          );
        },
      };

      // Selection
      expect(store.selected()?.name).toBe('Second');

      // Default
      expect(store.default()?.name).toBe('First');

      // Both work independently
      store.select('test_1');
      expect(store.selected()?.name).toBe('First');
      expect(store.default()?.name).toBe('First');

      store.setDefault('test_2');
      expect(store.default()?.name).toBe('Second');
      expect(store.selected()?.name).toBe('First');
    });
  });
});
