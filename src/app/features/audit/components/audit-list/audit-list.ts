import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { BadgeComponent } from '@/app/shared/ui/badge/badge';
import { DataTableComponent } from '@/app/shared/ui/data-table/data-table';
import { UiColDirective } from '@/app/shared/ui/data-table/ui-col.directive';
import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { PageHeaderComponent } from '@/app/shared/ui/page-header/page-header';
import { ToolbarComponent } from '@/app/shared/ui/toolbar/toolbar';
import { LabeledSelectComponent } from '@/app/shared/ui/labeled-select/labeled-select';
import { SearchStore } from '@/app/shared/store/search.store';
import { AuditStore } from '@/app/features/audit/store/audit.store';
import { AUDIT_ACTION_OPTIONS, AUDIT_RESOURCE_OPTIONS } from '../../models/audit.model';
import { ActionFilter, AuditEntryFormatted, ResourceFilter } from './audit-list.types';
import { textFilter, propertyEquals, matchesAll } from '@/app/shared/utils/filter.utils';

const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

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

  protected readonly actionOptions = AUDIT_ACTION_OPTIONS;
  protected readonly resourceOptions = AUDIT_RESOURCE_OPTIONS;

  protected readonly actionFilter = signal<ActionFilter>('all');
  protected readonly resourceFilter = signal<ResourceFilter>('all');

  protected readonly searchQuery = this.searchStore.normalizedQuery;

  protected readonly filteredEntries = computed<AuditEntryFormatted[]>(() => {
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
      )
      .map((entry) => ({
        ...entry,
        formattedAction: capitalize(entry.action),
        formattedResourceType: capitalize(entry.resourceType),
      }));
  });

  protected readonly filteredCount = computed(() => this.filteredEntries().length);
  protected readonly totalCount = computed(() => this.auditStore.entries().length);

  protected onActionChange(value: string): void {
    this.actionFilter.set(value as ActionFilter);
  }

  protected onResourceChange(value: string): void {
    this.resourceFilter.set(value as ResourceFilter);
  }
}
