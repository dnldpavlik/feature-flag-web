import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { BadgeComponent } from '@/app/shared/ui/badge/badge';
import { DataTableComponent } from '@/app/shared/ui/data-table/data-table';
import { UiColDirective } from '@/app/shared/ui/data-table/ui-col.directive';
import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { PageHeaderComponent } from '@/app/shared/ui/page-header/page-header';
import { ToolbarComponent } from '@/app/shared/ui/toolbar/toolbar';
import {
  LabeledSelectComponent,
  SelectOption,
} from '@/app/shared/ui/labeled-select/labeled-select';
import { SearchStore } from '@/app/shared/store/search.store';
import { AuditStore } from '@/app/features/audit/store/audit.store';
import { AuditAction, AuditResourceType } from '../../models/audit.model';
import { ActionFilter, ResourceFilter } from './audit-list.types';
import { textFilter, propertyEquals, matchesAll } from '@/app/shared/utils/filter.utils';

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
  imports: [
    BadgeComponent,
    DatePipe,
    DataTableComponent,
    UiColDirective,
    EmptyStateComponent,
    LabeledSelectComponent,
    PageHeaderComponent,
    ToolbarComponent,
  ],
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

    return this.auditStore
      .entries()
      .filter(
        matchesAll([
          propertyEquals('action', action),
          propertyEquals('resourceType', resource),
          textFilter(['resourceName', 'userName', 'details', 'action', 'resourceType'], query),
        ]),
      );
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
}
