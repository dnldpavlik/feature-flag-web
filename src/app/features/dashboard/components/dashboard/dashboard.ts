import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '@/app/shared/ui/button/button';
import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { StatCardComponent } from '@/app/shared/ui/stat-card/stat-card';
import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { ProjectStore } from '@/app/shared/store/project.store';
import { SearchStore } from '@/app/shared/store/search.store';
import { highlightParts, HighlightPart, matchesSearch } from '@/app/shared/utils/search.utils';
import { Flag } from '@/app/features/flags/models/flag.model';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { isEnabledInEnvironment } from '@/app/features/flags/utils/flag-value.utils';

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

    return this.recentFlags().filter((flag) => matchesSearch(flag, query));
  });

  protected readonly selectedEnvironmentName = computed(
    () => this.selectedEnvironment()?.name ?? 'All Environments'
  );
  protected readonly selectedProjectName = computed(
    () => this.projectStore.selectedProject()?.name ?? 'All Projects'
  );

  protected highlightParts(text: string): HighlightPart[] {
    return highlightParts(text, this.searchQuery());
  }
}
