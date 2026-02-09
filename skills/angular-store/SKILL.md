# Skill: Angular Signal Store Generator

## Purpose
Generate signal-based stores following the BaseCrudStore<T> pattern used in this project.

## When to Use
- Adding a new feature that needs state management
- Creating CRUD stores for new entities
- Adding computed selectors or actions to existing stores

## Store Types

### 1. CRUD Store (extends BaseCrudStore<T>)

For entities with standard CRUD operations. Used by: ProjectStore, EnvironmentStore, SegmentStore.

```typescript
import { Injectable, inject } from '@angular/core';
import { BaseCrudStore } from '@/app/shared/store/base-crud.store';
import { ToastService } from '@/app/shared/ui/toast/toast.service';
import { AuditLogger } from '@/app/features/audit/services/audit-logger.service';
import { {Entity}Api } from '../api/{entity}.api';
import { {Entity}, Create{Entity}Input, Update{Entity}Input } from '../models/{entity}.model';

@Injectable({ providedIn: 'root' })
export class {Entity}Store extends BaseCrudStore<{Entity}> {
  private readonly api = inject({Entity}Api);
  private readonly toast = inject(ToastService);
  private readonly logAudit = inject(AuditLogger).forResource('{entity}');

  // Override abstract methods from BaseCrudStore
  // ... (see base-crud.store.ts for required overrides)
}
```

### 2. Specialized Store (standalone)

For entities with complex operations beyond CRUD (e.g., FlagStore, AuditStore).

```typescript
@Injectable({ providedIn: 'root' })
export class {Entity}Store {
  // Private writable signals
  private readonly _items = signal<{Entity}[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly selectors
  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed selectors
  readonly activeItems = computed(() => this._items().filter(i => i.active));

  // Actions
  async loadAll(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const items = await firstValueFrom(this.api.getAll());
      this._items.set(items);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load';
      this._error.set(msg);
      this.toast.error(msg);
    } finally {
      this._loading.set(false);
    }
  }

  async create(input: Create{Entity}Input): Promise<{Entity} | undefined> {
    try {
      const created = await firstValueFrom(this.api.create(input));
      this._items.update(items => [created, ...items]);
      this.toast.success('{Entity} created');
      this.logAudit({ action: 'created', resourceId: created.id, resourceName: created.name });
      return created;
    } catch (e) {
      this.toast.error('Failed to create {entity}');
      return undefined;
    }
  }

  async delete(id: string): Promise<boolean> {
    const existing = this._items().find(i => i.id === id);
    try {
      await firstValueFrom(this.api.delete(id));
      this._items.update(items => items.filter(i => i.id !== id));
      this.toast.success('{Entity} deleted');
      if (existing) {
        this.logAudit({ action: 'deleted', resourceId: id, resourceName: existing.name });
      }
      return true;
    } catch (e) {
      this.toast.error('Failed to delete {entity}');
      return false;
    }
  }
}
```

## Immutable Update Patterns

```typescript
// Add item
this._items.update(items => [newItem, ...items]);

// Update item
this._items.update(items => items.map(i => i.id === updated.id ? updated : i));

// Remove item
this._items.update(items => items.filter(i => i.id !== id));

// Deep merge (for PATCH responses)
this._items.update(items => items.map(i => i.id === id ? mergeEntity(i, partial) : i));
```

## Test Template (Write First)

```typescript
import { TestBed } from '@angular/core/testing';
import { {Entity}Store } from './{entity}.store';
import { mockApiProviders, SEED } from '@/app/testing/mock-api.providers';
import { getCountBefore, expectItemAdded, expectItemRemoved } from '@/app/testing';

describe('{Entity}Store', () => {
  let store: {Entity}Store;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...mockApiProviders] });
    store = TestBed.inject({Entity}Store);
  });

  describe('loadAll', () => {
    it('should load items', async () => {
      await store.loadAll();
      expect(store.items().length).toBeGreaterThan(0);
      expect(store.loading()).toBe(false);
    });
  });

  describe('create', () => {
    it('should add item to store', async () => {
      await store.loadAll();
      const before = getCountBefore(store);
      const result = await store.create({ name: 'Test', key: 'test' });
      expectItemAdded(store, before);
    });
  });

  describe('delete', () => {
    it('should remove item from store', async () => {
      await store.loadAll();
      const before = getCountBefore(store);
      const id = store.items()[0].id;
      await store.delete(id);
      expectItemRemoved(store, before);
    });
  });
});
```

## API Companion

Every store needs a corresponding API service:

```typescript
@Injectable({ providedIn: 'root' })
export class {Entity}Api extends CrudApi<{Entity}, Create{Entity}Input, Update{Entity}Input> {
  protected override resourcePath = '{entities}';

  // Add custom endpoints beyond CRUD
  setDefault(id: string): Observable<{Entity}> {
    return this.http.post<{Entity}>(`${this.resourceUrl}/${id}/default`, null);
  }
}
```

## Key Rules
1. Always use `firstValueFrom()` to convert Observable → Promise in stores
2. Toast on success and error
3. Audit log on successful mutations (create, update, delete)
4. Never throw from store actions — catch errors and set error state
5. Use immutable updates only (`.update()` with spread/map/filter)
6. Keep stores in `features/{feature}/store/` or `shared/store/`
