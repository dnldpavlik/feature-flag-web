import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { StatCardComponent } from '../../../../shared/ui/stat-card/stat-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ButtonComponent, EmptyStateComponent, StatCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
