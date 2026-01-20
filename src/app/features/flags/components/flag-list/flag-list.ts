import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { Flag, FlagType } from '../../models/flag.model';
import { FlagTypeMap } from '../../models/flag-value.model';
import { EnvironmentStore } from '../../store/environment.store';
import { FlagStore } from '../../store/flag.store';
import { getEffectiveValue, isEnabledInEnvironment } from '../../utils/flag-value.utils';

type StatusFilter = 'all' | 'enabled' | 'disabled';
type TypeFilter = 'all' | FlagType;

/**
 * Extended flag with computed environment-specific properties for display
 */
interface FlagWithEnvironmentStatus extends Flag {
  currentEnabled: boolean;
  currentValue: FlagTypeMap[FlagType];
}

@Component({
  selector: 'app-flag-list',
  imports: [CommonModule, ButtonComponent, EmptyStateComponent, RouterLink],
  templateUrl: './flag-list.html',
  styleUrl: './flag-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagListComponent {
  private readonly flagStore = inject(FlagStore);
  private readonly environmentStore = inject(EnvironmentStore);

  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly typeFilter = signal<TypeFilter>('all');

  protected readonly environments = this.environmentStore.sortedEnvironments;
  protected readonly selectedEnvironment = this.environmentStore.selectedEnvironment;

  protected readonly flagsWithStatus = computed<FlagWithEnvironmentStatus[]>(() => {
    const envId = this.environmentStore.selectedEnvironmentId();
    return this.flagStore.flags().map((flag) => ({
      ...flag,
      currentEnabled: isEnabledInEnvironment(flag, envId),
      currentValue: getEffectiveValue(flag, envId),
    }));
  });

  protected readonly filteredFlags = computed(() => {
    const status = this.statusFilter();
    const type = this.typeFilter();

    return this.flagsWithStatus().filter((flag) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'enabled' && flag.currentEnabled) ||
        (status === 'disabled' && !flag.currentEnabled);
      const matchesType = type === 'all' || flag.type === type;
      return matchesStatus && matchesType;
    });
  });

  protected readonly filteredCount = computed(() => this.filteredFlags().length);
  protected readonly totalCount = computed(() => this.flagStore.flags().length);

  protected onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as StatusFilter;
    this.statusFilter.set(value);
  }

  protected onTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as TypeFilter;
    this.typeFilter.set(value);
  }

  protected onEnvironmentChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.environmentStore.selectEnvironment(value);
  }

  protected onToggleFlag(flagId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const envId = this.environmentStore.selectedEnvironmentId();
    this.flagStore.toggleFlagInEnvironment(flagId, envId, checked);
  }

  protected formatValue(flag: FlagWithEnvironmentStatus): string {
    if (flag.type === 'boolean') {
      return flag.currentValue ? 'true' : 'false';
    }
    if (flag.type === 'json') {
      return JSON.stringify(flag.currentValue);
    }
    return String(flag.currentValue);
  }
}
