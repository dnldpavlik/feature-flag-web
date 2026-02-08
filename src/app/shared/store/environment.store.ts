import { inject, Injectable, computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { EnvironmentApi } from '@/app/features/environments/api/environment.api';
import { BaseCrudStore } from '@/app/shared/store/base-crud.store';
import { ToastService } from '@/app/shared/ui/toast/toast.service';
import { AuditLogger } from '@/app/features/audit/services/audit-logger.service';
import {
  CreateEnvironmentInput,
  Environment,
  UpdateEnvironmentInput,
} from '@/app/features/flags/models/environment.model';

@Injectable({ providedIn: 'root' })
export class EnvironmentStore extends BaseCrudStore<Environment> {
  private readonly api = inject(EnvironmentApi);
  private readonly toast = inject(ToastService);
  private readonly logAudit = inject(AuditLogger).forResource('environment');
  private static readonly STORAGE_KEY = 'selected-environment-id';
  private readonly _selectedEnvironmentId = signal<string>('');

  constructor() {
    super({
      idPrefix: 'env',
      initialData: [],
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

  /** Load environments from API */
  async loadEnvironments(): Promise<void> {
    await this.loadFromApi(this.api.getAll());

    // Restore selection from localStorage, or fall back to default environment
    if (!this._selectedEnvironmentId() && this._items().length > 0) {
      const saved = localStorage.getItem(EnvironmentStore.STORAGE_KEY);
      const savedEnv = saved ? this._items().find((e) => e.id === saved) : undefined;
      const selected = savedEnv ?? this._items().find((e) => e.isDefault) ?? this._items()[0];
      this._selectedEnvironmentId.set(selected.id);
    }
  }

  /** Select an environment as the current context */
  selectEnvironment(environmentId: string): void {
    this._selectedEnvironmentId.set(environmentId);
    localStorage.setItem(EnvironmentStore.STORAGE_KEY, environmentId);
  }

  /** Set an environment as the default via API */
  async setDefaultEnvironment(environmentId: string): Promise<void> {
    try {
      await firstValueFrom(this.api.setDefault(environmentId));
      this.updateWhere(
        (env) => env.id === environmentId || env.isDefault,
        (env) => ({ isDefault: env.id === environmentId }),
      );
      this.toast.success('Default environment updated');
    } catch {
      this.toast.error('Failed to set default environment');
    }
  }

  /** Add a new environment via API */
  async addEnvironment(input: CreateEnvironmentInput): Promise<void> {
    try {
      const created = await firstValueFrom(this.api.create(input));
      this._items.update((items) => [...items, created]);
      this.toast.success('Environment created');
      this.logAudit({
        action: 'created',
        resourceId: created.id,
        resourceName: created.name,
        details: `Created environment "${created.key}"`,
      });
    } catch {
      this.toast.error('Failed to create environment');
    }
  }

  /** Update environment properties via API */
  async updateEnvironment(envId: string, updates: UpdateEnvironmentInput): Promise<void> {
    try {
      const updated = await firstValueFrom(this.api.update(envId, updates));
      this.updateItem(envId, updated);
      this.toast.success('Environment updated');
      const changedFields = Object.keys(updates).join(', ');
      this.logAudit({
        action: 'updated',
        resourceId: envId,
        resourceName: updated.name,
        details: `Updated environment fields: ${changedFields}`,
      });
    } catch {
      this.toast.error('Failed to update environment');
    }
  }

  /** Find environment by ID */
  getEnvironmentById(id: string): Environment | undefined {
    return this.getById(id);
  }
}
