import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '@/app/shared/ui/button/button';
import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { SearchStore } from '@/app/shared/store/search.store';
import { matchesSearch } from '@/app/shared/utils/search.utils';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import {
  getEffectiveValue,
  isEnabledInEnvironment,
} from '@/app/features/flags/utils/flag-value.utils';
import { formatFlagValue } from '@/app/features/flags/utils/flag-format.utils';
import { FlagWithEnvironmentStatus, StatusFilter, TypeFilter } from './flag-list.types';

@Component({
  selector: 'app-flag-list',
  imports: [DatePipe, ButtonComponent, EmptyStateComponent, RouterLink],
  templateUrl: './flag-list.html',
  styleUrl: './flag-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagListComponent {
  private readonly flagStore = inject(FlagStore);
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly searchStore = inject(SearchStore);

  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly typeFilter = signal<TypeFilter>('all');

  protected readonly environments = this.environmentStore.sortedEnvironments;
  protected readonly selectedEnvironment = this.environmentStore.selectedEnvironment;
  protected readonly searchQuery = computed(() => this.searchStore.query().trim().toLowerCase());

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
    const query = this.searchQuery();

    return this.flagsWithStatus().filter((flag) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'enabled' && flag.currentEnabled) ||
        (status === 'disabled' && !flag.currentEnabled);
      const matchesType = type === 'all' || flag.type === type;
      return matchesStatus && matchesType && matchesSearch(flag, query);
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
    return formatFlagValue(flag.type, flag.currentValue);
  }
}
