import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { FlagType } from '../../models/flag.model';
import { FlagStore } from '../../store/flag.store';

type StatusFilter = 'all' | 'enabled' | 'disabled';
type TypeFilter = 'all' | FlagType;

@Component({
  selector: 'app-flag-list',
  standalone: true,
  imports: [ButtonComponent, EmptyStateComponent],
  templateUrl: './flag-list.html',
  styleUrl: './flag-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagListComponent {
  private readonly store = inject(FlagStore);

  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly typeFilter = signal<TypeFilter>('all');

  protected readonly filteredFlags = computed(() => {
    const status = this.statusFilter();
    const type = this.typeFilter();

    return this.store.flags().filter((flag) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'enabled' && flag.enabled) ||
        (status === 'disabled' && !flag.enabled);
      const matchesType = type === 'all' || flag.type === type;
      return matchesStatus && matchesType;
    });
  });

  protected readonly filteredCount = computed(() => this.filteredFlags().length);
  protected readonly totalCount = computed(() => this.store.flags().length);

  protected onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as StatusFilter;
    this.statusFilter.set(value);
  }

  protected onTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as TypeFilter;
    this.typeFilter.set(value);
  }
}
