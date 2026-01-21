import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { StatCardComponent } from '../../../../shared/ui/stat-card/stat-card';
import { EnvironmentStore } from '../../../flags/store/environment.store';
import { FlagStore } from '../../../flags/store/flag.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ButtonComponent, EmptyStateComponent, StatCardComponent],
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

  protected onEnvironmentChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.environmentStore.selectEnvironment(value);
  }
}
