import { Injectable, computed, signal } from '@angular/core';

import { BaseCrudStore } from '@/app/shared/store/base-crud.store';
import {
  CreateEnvironmentInput,
  Environment,
  UpdateEnvironmentInput,
} from '@/app/features/flags/models/environment.model';

/** Fixed timestamp for seed data */
const SEED_TIMESTAMP = '2025-01-01T00:00:00.000Z';

const INITIAL_ENVIRONMENTS: Environment[] = [
  {
    id: 'env_development',
    key: 'development',
    name: 'Development',
    color: '#10B981',
    order: 0,
    isDefault: true,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: 'env_staging',
    key: 'staging',
    name: 'Staging',
    color: '#F59E0B',
    order: 1,
    isDefault: false,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: 'env_production',
    key: 'production',
    name: 'Production',
    color: '#EF4444',
    order: 2,
    isDefault: false,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
];

@Injectable({ providedIn: 'root' })
export class EnvironmentStore extends BaseCrudStore<Environment> {
  private readonly _selectedEnvironmentId = signal<string>('env_development');

  constructor() {
    super({
      idPrefix: 'env',
      initialData: INITIAL_ENVIRONMENTS,
      allowDeleteLast: false,
    });
  }

  /** Alias for items to maintain backward compatibility */
  readonly environments = this.items;

  readonly selectedEnvironmentId = this._selectedEnvironmentId.asReadonly();

  readonly sortedEnvironments = computed(() =>
    [...this._items()].sort((a, b) => a.order - b.order),
  );

  readonly selectedEnvironment = computed(() =>
    this._items().find((e) => e.id === this._selectedEnvironmentId()),
  );

  readonly defaultEnvironment = computed(() => this._items().find((e) => e.isDefault));

  /** Select an environment as the current context */
  selectEnvironment(environmentId: string): void {
    this._selectedEnvironmentId.set(environmentId);
  }

  /** Set an environment as the default */
  setDefaultEnvironment(environmentId: string): void {
    this.updateWhere(
      (env) => env.id === environmentId || env.isDefault,
      (env) => ({ isDefault: env.id === environmentId }),
    );
  }

  /** Add a new environment */
  addEnvironment(input: CreateEnvironmentInput): void {
    this.addItem({
      key: input.key,
      name: input.name,
      color: input.color,
      order: input.order,
      isDefault: input.isDefault ?? false,
    });
  }

  /** Update environment properties */
  updateEnvironment(envId: string, updates: UpdateEnvironmentInput): void {
    this.updateItem(envId, updates);
  }

  /** Find environment by ID */
  getEnvironmentById(id: string): Environment | undefined {
    return this.getById(id);
  }
}
