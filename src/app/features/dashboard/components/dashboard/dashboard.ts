import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { StatCardComponent } from '../../../../shared/ui/stat-card/stat-card';
import { Flag } from '../../../flags/models/flag.model';
import { EnvironmentStore } from '../../../../shared/store/environment.store';
import { FlagStore } from '../../../flags/store/flag.store';
import { isEnabledInEnvironment } from '../../../flags/utils/flag-value.utils';
import { ProjectStore } from '../../../../shared/store/project.store';
import { SearchStore } from '../../../../shared/store/search.store';
import { RouterLink } from '@angular/router';

type RecentFlag = Flag & { currentEnabled: boolean };

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, ButtonComponent, EmptyStateComponent, RouterLink, StatCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly flagStore = inject(FlagStore);
  private readonly projectStore = inject(ProjectStore);
  private readonly searchStore = inject(SearchStore);

  protected readonly environments = this.environmentStore.sortedEnvironments;
  protected readonly selectedEnvironment = this.environmentStore.selectedEnvironment;

  protected readonly totalFlags = computed(() => this.flagStore.flags().length);
  protected readonly activeFlags = computed(
    () => this.flagStore.enabledFlagsInCurrentEnvironment().length
  );
  protected readonly inactiveFlags = computed(() => this.totalFlags() - this.activeFlags());
  protected readonly totalEnvironments = computed(() => this.environmentStore.environments().length);
  protected readonly searchQuery = computed(() => this.searchStore.query().trim().toLowerCase());
  protected readonly recentFlags = computed<RecentFlag[]>(() => {
    const envId = this.environmentStore.selectedEnvironmentId();
    return [...this.flagStore.flags()]
      .map((flag) => ({
        ...flag,
        currentEnabled: isEnabledInEnvironment(flag, envId),
      }))
      .sort((a, b) => new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf())
      .slice(0, 5);
  });
  protected readonly filteredRecentFlags = computed(() => {
    const query = this.searchQuery();
    if (!query) return this.recentFlags();

    return this.recentFlags().filter((flag) => this.matchesSearch(flag, query));
  });

  protected readonly selectedEnvironmentName = computed(
    () => this.selectedEnvironment()?.name ?? 'All Environments'
  );
  protected readonly selectedProjectName = computed(
    () => this.projectStore.selectedProject()?.name ?? 'All Projects'
  );

  protected highlightParts(text: string): { text: string; match: boolean }[] {
    const query = this.searchQuery();
    if (!text) {
      return [];
    }
    if (!query) {
      return [{ text, match: false }];
    }

    const parts: { text: string; match: boolean }[] = [];
    const lowerText = text.toLowerCase();
    let start = 0;
    let index = lowerText.indexOf(query, start);

    while (index !== -1) {
      if (index > start) {
        parts.push({ text: text.slice(start, index), match: false });
      }
      parts.push({ text: text.slice(index, index + query.length), match: true });
      start = index + query.length;
      index = lowerText.indexOf(query, start);
    }

    if (start < text.length) {
      parts.push({ text: text.slice(start), match: false });
    }

    return parts;
  }

  private matchesSearch(flag: RecentFlag, query: string): boolean {
    const haystack = [flag.name, flag.key, flag.description, flag.type, ...flag.tags]
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  }
}
