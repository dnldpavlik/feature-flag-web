import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { ProjectStore } from '@/app/shared/store/project.store';
import { ToastService } from '@/app/shared/ui/toast/toast.service';
import { AuditStore } from '@/app/features/audit/store/audit.store';
import { UserProfileStore } from '@/app/features/settings/store/user-profile.store';
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
export class FlagStore {
  private readonly api = inject(FlagApi);
  private readonly toast = inject(ToastService);
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly projectStore = inject(ProjectStore);
  private readonly auditStore = inject(AuditStore);
  private readonly userProfileStore = inject(UserProfileStore);

  private readonly _flags = signal<Flag[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly flags = this._flags.asReadonly();
  readonly totalCount = computed(() => this._flags().length);

  readonly currentEnvironmentId = computed(() => this.environmentStore.selectedEnvironmentId());

  readonly flagsInSelectedProject = computed(() => {
    const projectId = this.projectStore.selectedProjectId();
    return this._flags().filter((flag) => flag.projectId === projectId);
  });

  readonly enabledFlagsInCurrentEnvironment = computed(() =>
    this.flagsInSelectedProject().filter((flag) =>
      isEnabledInEnvironment(flag, this.currentEnvironmentId()),
    ),
  );

  /** Load flags from API */
  async loadFlags(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const flags = await firstValueFrom(this.api.getAll());
      this._flags.set(flags);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load flags';
      this._error.set(message);
    } finally {
      this._loading.set(false);
    }
  }

  /** Add a new flag via API */
  async addFlag(
    input: CreateFlagInput,
    enabledEnvironments?: Record<string, boolean>,
  ): Promise<void> {
    try {
      const created = await firstValueFrom(this.api.create(input));
      this._flags.update((flags) => [created, ...flags]);

      // Enable flag in specified environments
      if (enabledEnvironments) {
        for (const [envId, enabled] of Object.entries(enabledEnvironments)) {
          if (enabled) {
            await this.toggleFlagInEnvironment(created.id, envId, true);
          }
        }
      }

      this.toast.success('Flag created');
      this.logAuditAction('created', created.id, created.name, `Created ${created.type} flag`);
    } catch {
      this.toast.error('Failed to create flag');
    }
  }

  /** Delete a flag via API */
  async deleteFlag(flagId: string): Promise<void> {
    if (this._flags().length <= 1) return;
    const flag = this.getFlagById(flagId);
    if (!flag) return;

    try {
      await firstValueFrom(this.api.delete(flagId));
      this._flags.update((flags) => flags.filter((f) => f.id !== flagId));
      this.toast.success('Flag deleted');
      this.logAuditAction('deleted', flagId, flag.name, `Deleted flag "${flag.key}"`);
    } catch {
      this.toast.error('Failed to delete flag');
    }
  }

  getFlagById(id: string): Flag | undefined {
    return this._flags().find((f) => f.id === id);
  }

  /** Get all flags for a specific project */
  getFlagsByProjectId(projectId: string): Flag[] {
    return this._flags().filter((f) => f.projectId === projectId);
  }

  /** Delete all flags for a specific project (for cascade delete) */
  async deleteFlagsByProjectId(projectId: string): Promise<void> {
    const flagsToDelete = this.getFlagsByProjectId(projectId);
    for (const flag of flagsToDelete) {
      try {
        await firstValueFrom(this.api.delete(flag.id));
        this._flags.update((flags) => flags.filter((f) => f.id !== flag.id));
        this.logAuditAction(
          'deleted',
          flag.id,
          flag.name,
          `Deleted flag "${flag.key}" (project deleted)`,
        );
      } catch {
        // Continue deleting other flags even if one fails
        this.toast.error(`Failed to delete flag "${flag.name}"`);
      }
    }
  }

  /** Update flag details via API */
  async updateFlagDetails(
    flagId: string,
    updates: Partial<Pick<Flag, 'name' | 'description' | 'tags' | 'defaultValue'>>,
  ): Promise<void> {
    try {
      const updated = await firstValueFrom(this.api.update(flagId, updates));
      this._flags.update((flags) => flags.map((flag) => (flag.id === flagId ? updated : flag)));
      this.toast.success('Flag updated');
      const changedFields = Object.keys(updates).join(', ');
      this.logAuditAction('updated', flagId, updated.name, `Updated flag fields: ${changedFields}`);
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
      this._flags.update((flags) =>
        flags.map((flag) => (flag.id === input.flagId ? updated : flag)),
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
      const updated = await firstValueFrom(
        this.api.updateEnvironmentValue(flagId, environmentId, { enabled }),
      );
      this._flags.update((flags) => flags.map((flag) => (flag.id === flagId ? updated : flag)));
      const env = this.environmentStore.getEnvironmentById(environmentId);
      const state = enabled ? 'Enabled' : 'Disabled';
      this.logAuditAction(
        'toggled',
        flagId,
        updated.name,
        `${state} flag in ${env?.name ?? environmentId}`,
      );
    } catch {
      this.toast.error('Failed to toggle flag');
    }
  }

  getValueInEnvironment<T extends FlagType>(
    flagId: string,
    environmentId: string,
  ): FlagTypeMap[T] | undefined {
    const flag = this.getFlagById(flagId);
    if (!flag) return undefined;
    return getEffectiveValue<T>(flag, environmentId);
  }

  private logAuditAction(
    action: 'created' | 'updated' | 'deleted' | 'toggled',
    resourceId: string,
    resourceName: string,
    details: string,
  ): void {
    const user = this.userProfileStore.userProfile();
    this.auditStore.logAction({
      action,
      resourceType: 'flag',
      resourceId,
      resourceName,
      details,
      userId: user.id,
      userName: user.name,
    });
  }
}
