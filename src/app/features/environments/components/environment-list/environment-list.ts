import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ButtonComponent } from '@/app/shared/ui/button/button';
import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { SearchStore } from '@/app/shared/store/search.store';
import { EnvironmentStore } from '@/app/shared/store/environment.store';

@Component({
  selector: 'app-environment-list',
  imports: [DatePipe, ReactiveFormsModule, ButtonComponent, EmptyStateComponent, RouterLink],
  templateUrl: './environment-list.html',
  styleUrl: './environment-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnvironmentListComponent {
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly router = inject(Router);
  private readonly searchStore = inject(SearchStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly environments = this.environmentStore.sortedEnvironments;
  protected readonly selectedEnvironmentId = this.environmentStore.selectedEnvironmentId;
  protected readonly searchQuery = computed(() => this.searchStore.query().trim().toLowerCase());
  protected readonly filteredEnvironments = computed(() => {
    const query = this.searchQuery();
    if (!query) return this.environments();

    return this.environments().filter((env) =>
      `${env.name} ${env.key}`.toLowerCase().includes(query),
    );
  });

  protected readonly form = this.fb.group({
    name: [''],
    key: [''],
    color: ['#3b82f6'],
  });

  // Backward compatibility getters/setters for tests
  get name(): string {
    return this.form.controls.name.value;
  }
  set name(value: string) {
    this.form.controls.name.setValue(value);
  }

  get key(): string {
    return this.form.controls.key.value;
  }
  set key(value: string) {
    this.form.controls.key.setValue(value);
  }

  get color(): string {
    return this.form.controls.color.value;
  }
  set color(value: string) {
    this.form.controls.color.setValue(value);
  }

  protected canAdd(): boolean {
    const { name, key } = this.form.getRawValue();
    return name.trim().length > 0 && key.trim().length > 0;
  }

  protected addEnvironment(): void {
    if (!this.canAdd()) return;

    const { name, key, color } = this.form.getRawValue();
    const order = this.environmentStore.environments().length;
    this.environmentStore.addEnvironment({
      name: name.trim(),
      key: key.trim(),
      color,
      order,
    });

    this.form.reset({ name: '', key: '', color: '#3b82f6' });
  }

  protected selectEnvironment(envId: string): void {
    this.environmentStore.selectEnvironment(envId);
    void this.router.navigate(['/environments', envId]);
  }

  protected setDefaultEnvironment(envId: string): void {
    this.environmentStore.setDefaultEnvironment(envId);
  }
}
