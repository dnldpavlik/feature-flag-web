import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import {
  BadgeComponent,
  DataTableComponent,
  UiColDirective,
  EmptyStateComponent,
  ErrorBannerComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
  ToolbarComponent,
  LabeledSelectComponent,
} from '@watt/ui';
import { AuditBadgeComponent } from '../audit-badge/audit-badge';
import { SearchStore } from '@/app/shared/store/search.store';
import { AuditStore } from '@/app/features/audit/store/audit.store';
import { AUDIT_ACTION_OPTIONS, AUDIT_RESOURCE_OPTIONS } from '../../models/audit.model';
import { ActionFilter, AuditEntryFormatted, ResourceFilter } from './audit-list.types';
import { textFilter, propertyEquals, matchesAll } from '@/app/shared/utils/filter.utils';
import { capitalize } from '@/app/shared/utils/string.utils';

@Component({
  selector: 'app-audit-list',
  imports: [
    AuditBadgeComponent,
    BadgeComponent,
    DatePipe,
    DataTableComponent,
    UiColDirective,
    EmptyStateComponent,
    ErrorBannerComponent,
    LabeledSelectComponent,
    LoadingSpinnerComponent,
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

  protected readonly loading = this.auditStore.loading;
  protected readonly error = this.auditStore.error;
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

  retry(): void {
    void this.auditStore.loadEntries();
  }
}
