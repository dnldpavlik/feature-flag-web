import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  DataTableComponent,
  EmptyStateComponent,
  LabeledSelectComponent,
  PageHeaderComponent,
  SelectOption,
  ToggleComponent,
  ToolbarComponent,
  UiColDirective,
} from '@watt/ui';
import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { SearchStore } from '@/app/shared/store/search.store';
import { matchesSearch } from '@/app/shared/utils/search.utils';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { FLAG_STATUS_OPTIONS, FLAG_TYPE_OPTIONS } from '@/app/features/flags/models/flag.model';
import {
  getEffectiveValue,
  isEnabledInEnvironment,
} from '@/app/features/flags/utils/flag-value.utils';
import { formatFlagValue } from '@/app/features/flags/utils/flag-format.utils';
import { FlagWithFormattedValue, StatusFilter, TypeFilter } from './flag-list.types';

@Component({
  selector: 'app-flag-list',
  imports: [
    BadgeComponent,
    CardComponent,
    DatePipe,
    ButtonComponent,
    DataTableComponent,
    UiColDirective,
    EmptyStateComponent,
    LabeledSelectComponent,
    PageHeaderComponent,
    RouterLink,
    ToggleComponent,
    ToolbarComponent,
  ],
  templateUrl: './flag-list.html',
  styleUrl: './flag-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagListComponent {
  private readonly flagStore = inject(FlagStore);
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly searchStore = inject(SearchStore);

  protected readonly statusOptions = FLAG_STATUS_OPTIONS;
  protected readonly typeOptions = FLAG_TYPE_OPTIONS;

  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly typeFilter = signal<TypeFilter>('all');

  protected readonly environments = this.environmentStore.sortedEnvironments;
  protected readonly selectedEnvironment = this.environmentStore.selectedEnvironment;
  protected readonly searchQuery = this.searchStore.normalizedQuery;

  protected readonly environmentOptions = computed<SelectOption[]>(() =>
    this.environments().map((env) => ({ value: env.id, label: env.name })),
  );

  private readonly flagsWithStatus = computed(() => {
    const envId = this.environmentStore.selectedEnvironmentId();
    return this.flagStore.flagsInSelectedProject().map((flag) => ({
      ...flag,
      currentEnabled: isEnabledInEnvironment(flag, envId),
      currentValue: getEffectiveValue(flag, envId),
    }));
  });

  protected readonly filteredFlags = computed<FlagWithFormattedValue[]>(() => {
    const status = this.statusFilter();
    const type = this.typeFilter();
    const query = this.searchQuery();

    return this.flagsWithStatus()
      .filter((flag) => {
        const matchesStatus =
          status === 'all' ||
          (status === 'enabled' && flag.currentEnabled) ||
          (status === 'disabled' && !flag.currentEnabled);
        const matchesType = type === 'all' || flag.type === type;
        return matchesStatus && matchesType && matchesSearch(flag, query);
      })
      .map((flag) => ({
        ...flag,
        formattedValue: formatFlagValue(flag.type, flag.currentValue),
      }));
  });

  protected readonly filteredCount = computed(() => this.filteredFlags().length);
  protected readonly totalCount = computed(() => this.flagStore.flagsInSelectedProject().length);

  onStatusChange(value: string): void {
    this.statusFilter.set(value as StatusFilter);
  }

  onTypeChange(value: string): void {
    this.typeFilter.set(value as TypeFilter);
  }

  onEnvironmentChange(value: string): void {
    this.environmentStore.selectEnvironment(value);
  }

  onToggleFlag(flagId: string, checked: boolean): void {
    const envId = this.environmentStore.selectedEnvironmentId();
    this.flagStore.toggleFlagInEnvironment(flagId, envId, checked);
  }

  // Delete confirmation state
  protected readonly flagToDelete = signal<string | null>(null);

  requestDeleteFlag(flagId: string): void {
    this.flagToDelete.set(flagId);
  }

  cancelDelete(): void {
    this.flagToDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const flagId = this.flagToDelete();
    if (!flagId) {
      return;
    }
    await this.flagStore.deleteFlag(flagId);
    this.cancelDelete();
  }
}
