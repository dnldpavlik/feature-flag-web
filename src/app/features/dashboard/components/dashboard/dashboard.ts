import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { StatCardComponent } from '../../../../shared/ui/stat-card/stat-card';
import { EnvironmentStore } from '../../../flags/store/environment.store';
import { FlagStore } from '../../../flags/store/flag.store';
import { isEnabledInEnvironment } from '../../../flags/utils/flag-value.utils';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonComponent, EmptyStateComponent, RouterLink, StatCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly flagStore = inject(FlagStore);

  protected readonly environments = this.environmentStore.sortedEnvironments;
  protected readonly selectedEnvironment = this.environmentStore.selectedEnvironment;

  protected readonly totalFlags = computed(() => this.flagStore.flags().length);
  protected readonly activeFlags = computed(
    () => this.flagStore.enabledFlagsInCurrentEnvironment().length
  );
  protected readonly inactiveFlags = computed(() => this.totalFlags() - this.activeFlags());
  protected readonly totalEnvironments = computed(() => this.environmentStore.environments().length);
  protected readonly recentFlags = computed(() => {
    const envId = this.environmentStore.selectedEnvironmentId();
    return [...this.flagStore.flags()]
      .map((flag) => ({
        ...flag,
        currentEnabled: isEnabledInEnvironment(flag, envId),
      }))
      .sort((a, b) => new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf())
      .slice(0, 5);
  });

  protected readonly selectedEnvironmentName = computed(
    () => this.selectedEnvironment()?.name ?? 'All Environments'
  );
}
