import { Injectable, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { BaseCrudStore } from '@/app/shared/store/base-crud.store';
import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { ProjectStore } from '@/app/shared/store/project.store';
import { ToastService } from '@/app/shared/ui/toast/toast.service';
import { AuditLogger } from '@/app/features/audit/services/audit-logger.service';
import {
  CreateFlagInput,
  Flag,
  FlagType,
  UpdateEnvironmentValueInput,
} from '@/app/features/flags/models/flag.model';
import { FlagTypeMap } from '@/app/features/flags/models/flag-value.model';
import { FlagApi } from '@/app/features/flags/api/flag.api';
import {
  getEffectiveValue,
  isEnabledInEnvironment,
} from '@/app/features/flags/utils/flag-value.utils';

@Injectable({ providedIn: 'root' })
export class FlagStore extends BaseCrudStore<Flag> {
  private readonly api = inject(FlagApi);
  private readonly toast = inject(ToastService);
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly projectStore = inject(ProjectStore);
  private readonly logAudit = inject(AuditLogger).forResource('flag');

  constructor() {
    super({ idPrefix: 'flag', initialData: [], allowDeleteLast: false });
  }

  /** Alias for items to maintain backward compatibility */
  readonly flags = this.items;
  readonly totalCount = this.count;

  readonly currentEnvironmentId = computed(() => this.environmentStore.selectedEnvironmentId());

  readonly flagsInSelectedProject = computed(() => {
    const projectId = this.projectStore.selectedProjectId();
    return this._items().filter((flag) => flag.projectId === projectId);
  });

  readonly enabledFlagsInCurrentEnvironment = computed(() =>
    this.flagsInSelectedProject().filter((flag) =>
      isEnabledInEnvironment(flag, this.currentEnvironmentId()),
    ),
  );

  /** Load flags from API */
  async loadFlags(): Promise<void> {
    await this.loadFromApi(this.api.getAll());
  }

  /** Add a new flag via API */
  async addFlag(
    input: CreateFlagInput,
    enabledEnvironments?: Record<string, boolean>,
  ): Promise<void> {
    try {
      const created = await firstValueFrom(this.api.create(input));
      this._items.update((flags) => [created, ...flags]);

      // Enable flag in specified environments
      const hasToggles = enabledEnvironments && Object.values(enabledEnvironments).some(Boolean);
      if (hasToggles) {
        for (const [envId, enabled] of Object.entries(enabledEnvironments)) {
          if (enabled) {
            await this.toggleFlagInEnvironment(created.id, envId, true);
          }
        }
      }

      // Reload flags after toggles to get complete data from backend
      if (hasToggles) {
        await this.loadFlags();
      }

      this.toast.success('Flag created');
      this.logAudit({
        action: 'created',
        resourceId: created.id,
        resourceName: created.name || input.name,
        details: `Created ${created.type} flag`,
      });
    } catch {
      this.toast.error('Failed to create flag');
    }
  }

  /** Delete a flag via API */
  async deleteFlag(flagId: string): Promise<void> {
    if (this._items().length <= 1) return;
    const flag = this.getFlagById(flagId);
    if (!flag) return;

    try {
      await firstValueFrom(this.api.delete(flagId));
      this.deleteItem(flagId);
      this.toast.success('Flag deleted');
      this.logAudit({
        action: 'deleted',
        resourceId: flagId,
        resourceName: flag.name,
        details: `Deleted flag "${flag.key}"`,
      });
    } catch {
      this.toast.error('Failed to delete flag');
    }
  }

  getFlagById(id: string): Flag | undefined {
    return this.getById(id);
  }

  /** Get all flags for a specific project */
  getFlagsByProjectId(projectId: string): Flag[] {
    return this._items().filter((f) => f.projectId === projectId);
  }

  /** Delete all flags for a specific project (for cascade delete) */
  async deleteFlagsByProjectId(projectId: string): Promise<void> {
    const flagsToDelete = this.getFlagsByProjectId(projectId);
    for (const flag of flagsToDelete) {
      try {
        await firstValueFrom(this.api.delete(flag.id));
        this._items.update((flags) => flags.filter((f) => f.id !== flag.id));
        this.logAudit({
          action: 'deleted',
          resourceId: flag.id,
          resourceName: flag.name,
          details: `Deleted flag "${flag.key}" (project deleted)`,
        });
      } catch {
        // Continue deleting other flags even if one fails
        this.toast.error(`Failed to delete flag "${flag.name}"`);
      }
    }
  }

  /** Remove all flags for a project from the local store (no API calls) */
  removeFlagsByProjectId(projectId: string): void {
    this._items.update((flags) => flags.filter((f) => f.projectId !== projectId));
  }

  /** Update flag details via API */
  async updateFlagDetails(
    flagId: string,
    updates: Partial<Pick<Flag, 'name' | 'description' | 'tags' | 'defaultValue'>>,
  ): Promise<void> {
    try {
      const existing = this.getFlagById(flagId);
      const updated = await firstValueFrom(this.api.update(flagId, updates));
      this._items.update((flags) => flags.map((flag) => (flag.id === flagId ? updated : flag)));
      this.toast.success('Flag updated');
      const changedFields = Object.keys(updates).join(', ');
      this.logAudit({
        action: 'updated',
        resourceId: flagId,
        resourceName: updated.name || existing?.name || flagId,
        details: `Updated flag fields: ${changedFields}`,
      });
    } catch {
      this.toast.error('Failed to update flag');
    }
  }

  /** Update environment value via API */
  async updateEnvironmentValue(input: UpdateEnvironmentValueInput): Promise<void> {
    try {
      const updated = await firstValueFrom(
        this.api.updateEnvironmentValue(input.flagId, input.environmentId, {
          value: input.value,
          enabled: input.enabled,
        }),
      );
      this._items.update((flags) =>
        flags.map((flag) => {
          if (flag.id !== input.flagId) return flag;
          const merged = this.mergeFlag(flag, updated);
          return {
            ...merged,
            environmentValues: {
              ...merged.environmentValues,
              [input.environmentId]: {
                ...(merged.environmentValues[input.environmentId] ?? {}),
                ...(input.value !== undefined ? { value: input.value } : {}),
                ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
              },
            },
          };
        }),
      );
    } catch {
      this.toast.error('Failed to update environment value');
    }
  }

  /** Toggle flag enabled state in environment via API */
  async toggleFlagInEnvironment(
    flagId: string,
    environmentId: string,
    enabled: boolean,
  ): Promise<void> {
    try {
      const existing = this.getFlagById(flagId);
      const updated = await firstValueFrom(
        this.api.updateEnvironmentValue(flagId, environmentId, { enabled }),
      );
      this._items.update((flags) =>
        flags.map((flag) => {
          if (flag.id !== flagId) return flag;
          const merged = this.mergeFlag(flag, updated);
          return {
            ...merged,
            environmentValues: {
              ...merged.environmentValues,
              [environmentId]: {
                ...(merged.environmentValues[environmentId] ?? {}),
                enabled,
              },
            },
          };
        }),
      );
      const env = this.environmentStore.getEnvironmentById(environmentId);
      const state = enabled ? 'Enabled' : 'Disabled';
      this.logAudit({
        action: 'toggled',
        resourceId: flagId,
        resourceName: updated.name || existing?.name || flagId,
        details: `${state} flag in ${env?.name ?? environmentId}`,
      });
    } catch {
      this.toast.error('Failed to toggle flag');
    }
  }

  /** Merge API response into existing flag, preserving fields the response may omit */
  private mergeFlag(existing: Flag, updated: Flag): Flag {
    return {
      ...existing,
      ...updated,
      name: updated.name || existing.name,
      environmentValues: {
        ...existing.environmentValues,
        ...(updated.environmentValues ?? {}),
      },
    };
  }

  /** Remove environment values for a deleted environment from all flags */
  removeEnvironmentValues(environmentId: string): void {
    this._items.update((flags) =>
      flags.map((flag) => ({
        ...flag,
        environmentValues: Object.fromEntries(
          Object.entries(flag.environmentValues).filter(([key]) => key !== environmentId),
        ),
      })),
    );
  }

  /** Count flags that have values in a specific environment */
  getFlagCountByEnvironmentId(environmentId: string): number {
    return this._items().filter((f) => f.environmentValues[environmentId]).length;
  }

  getValueInEnvironment<T extends FlagType>(
    flagId: string,
    environmentId: string,
  ): FlagTypeMap[T] | undefined {
    const flag = this.getFlagById(flagId);
    if (!flag) return undefined;
    return getEffectiveValue<T>(flag, environmentId);
  }
}
