import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { BadgeComponent } from '@/app/shared/ui/badge/badge';
import { ButtonComponent } from '@/app/shared/ui/button/button';
import { CardComponent } from '@/app/shared/ui/card/card';
import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { UpdateEnvironmentInput } from '@/app/features/flags/models/environment.model';
import {
  getEffectiveValue,
  isEnabledInEnvironment,
} from '@/app/features/flags/utils/flag-value.utils';
import { formatDisplayValue } from '@/app/features/flags/utils/flag-format.utils';

@Component({
  selector: 'app-environment-detail',
  imports: [BadgeComponent, CardComponent, DatePipe, ButtonComponent, EmptyStateComponent, RouterLink],
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
    this.environmentStore.getEnvironmentById(this.environmentId()),
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

  // Edit state signals
  protected readonly isEditing = signal(false);
  protected readonly editName = signal('');
  protected readonly editKey = signal('');
  protected readonly editColor = signal('');

  protected enterEditMode(): void {
    const env = this.environment();
    if (!env) return;

    this.editName.set(env.name);
    this.editKey.set(env.key);
    this.editColor.set(env.color);
    this.isEditing.set(true);
  }

  protected cancelEdit(): void {
    this.isEditing.set(false);
  }

  protected saveEdit(): void {
    const env = this.environment();
    if (!env) return;

    const updates: UpdateEnvironmentInput = {
      name: this.editName().trim() || env.name,
      key: this.editKey().trim() || env.key,
      color: this.editColor().trim() || env.color,
    };

    this.environmentStore.updateEnvironment(env.id, updates);
    this.isEditing.set(false);
  }

  protected onNameInput(event: Event): void {
    this.editName.set((event.target as HTMLInputElement).value);
  }

  protected onKeyInput(event: Event): void {
    this.editKey.set((event.target as HTMLInputElement).value);
  }

  protected onColorInput(event: Event): void {
    this.editColor.set((event.target as HTMLInputElement).value);
  }

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
    return formatDisplayValue(value);
  }
}
