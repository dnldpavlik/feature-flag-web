import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { DataTableComponent } from '@/app/shared/ui/data-table/data-table';
import { UiColDirective } from '@/app/shared/ui/data-table/ui-col.directive';
import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { PageHeaderComponent } from '@/app/shared/ui/page-header/page-header';
import {
  LabeledSelectComponent,
} from '@/app/shared/ui/labeled-select/labeled-select';
import { SelectOption } from '@/app/shared/ui/labeled-select/labeled-select.types';
import { SearchStore } from '@/app/shared/store/search.store';
import { AuditStore } from '@/app/features/audit/store/audit.store';
import { AuditAction, AuditEntry, AuditResourceType } from '../../models/audit.model';
import { ActionFilter, ResourceFilter } from './audit-list.types';

const ACTION_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Actions' },
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'deleted', label: 'Deleted' },
  { value: 'toggled', label: 'Toggled' },
];

const RESOURCE_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Resources' },
  { value: 'flag', label: 'Flag' },
  { value: 'segment', label: 'Segment' },
  { value: 'environment', label: 'Environment' },
  { value: 'project', label: 'Project' },
];

@Component({
  selector: 'app-audit-list',
  imports: [DatePipe, DataTableComponent, UiColDirective, EmptyStateComponent, LabeledSelectComponent, PageHeaderComponent],
  templateUrl: './audit-list.html',
  styleUrl: './audit-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditListComponent {
  private readonly auditStore = inject(AuditStore);
  private readonly searchStore = inject(SearchStore);

  protected readonly actionOptions = ACTION_OPTIONS;
  protected readonly resourceOptions = RESOURCE_OPTIONS;

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

  onActionChange(value: string): void {
    this.actionFilter.set(value as ActionFilter);
  }

  onResourceChange(value: string): void {
    this.resourceFilter.set(value as ResourceFilter);
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
