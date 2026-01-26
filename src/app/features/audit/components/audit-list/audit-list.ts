import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { SearchStore } from '@/app/shared/store/search.store';
import { AuditStore } from '@/app/features/audit/store/audit.store';
import { AuditAction, AuditEntry, AuditResourceType } from '../../models/audit.model';
import { ActionFilter, ResourceFilter } from './audit-list.types';

@Component({
  selector: 'app-audit-list',
  imports: [DatePipe, EmptyStateComponent],
  templateUrl: './audit-list.html',
  styleUrl: './audit-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditListComponent {
  private readonly auditStore = inject(AuditStore);
  private readonly searchStore = inject(SearchStore);

  protected readonly actionFilter = signal<ActionFilter>('all');
  protected readonly resourceFilter = signal<ResourceFilter>('all');

  protected readonly searchQuery = computed(() => this.searchStore.query().trim().toLowerCase());

  protected readonly filteredEntries = computed(() => {
    const action = this.actionFilter();
    const resource = this.resourceFilter();
    const query = this.searchQuery();

    return this.auditStore.entries().filter((entry) => {
      const matchesAction = action === 'all' || entry.action === action;
      const matchesResource = resource === 'all' || entry.resourceType === resource;
      const matchesSearch = this.matchesSearchQuery(entry, query);
      return matchesAction && matchesResource && matchesSearch;
    });
  });

  protected readonly filteredCount = computed(() => this.filteredEntries().length);
  protected readonly totalCount = computed(() => this.auditStore.entries().length);

  onActionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ActionFilter;
    this.actionFilter.set(value);
  }

  onResourceChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ResourceFilter;
    this.resourceFilter.set(value);
  }

  formatAction(action: AuditAction): string {
    return action.charAt(0).toUpperCase() + action.slice(1);
  }

  formatResourceType(resourceType: AuditResourceType): string {
    return resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
  }

  private matchesSearchQuery(entry: AuditEntry, query: string): boolean {
    if (!query) return true;
    const searchable = [
      entry.resourceName,
      entry.userName,
      entry.details,
      entry.action,
      entry.resourceType,
    ]
      .join(' ')
      .toLowerCase();
    return searchable.includes(query);
  }
}
