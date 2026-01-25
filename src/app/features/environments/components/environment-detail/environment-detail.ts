import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ButtonComponent } from '@/app/shared/ui/button/button';
import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { getEffectiveValue, isEnabledInEnvironment } from '@/app/features/flags/utils/flag-value.utils';

@Component({
  selector: 'app-environment-detail',
  imports: [DatePipe, ButtonComponent, EmptyStateComponent, RouterLink],
  templateUrl: './environment-detail.html',
  styleUrl: './environment-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvironmentDetailComponent {
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly flagStore = inject(FlagStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly environmentId = computed(() => this.paramMap().get('envId') ?? '');
  protected readonly environment = computed(() =>
    this.environmentStore.getEnvironmentById(this.environmentId())
  );
  protected readonly selectedEnvironmentId = this.environmentStore.selectedEnvironmentId;
  protected readonly flags = computed(() => {
    const envId = this.environmentId();
    if (!envId) return [];
    return this.flagStore.flags().map((flag) => ({
      ...flag,
      currentEnabled: isEnabledInEnvironment(flag, envId),
      currentValue: getEffectiveValue(flag, envId),
    }));
  });

  protected selectEnvironment(): void {
    const env = this.environment();
    if (!env) return;
    this.environmentStore.selectEnvironment(env.id);
  }

  protected makeDefault(): void {
    const env = this.environment();
    if (!env) return;
    this.environmentStore.setDefaultEnvironment(env.id);
  }

  protected backToList(): void {
    void this.router.navigate(['/environments']);
  }

  protected formatValue(value: unknown): string {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }
}
