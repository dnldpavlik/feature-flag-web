import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { BadgeComponent } from '@/app/shared/ui/badge/badge';
import { ButtonComponent } from '@/app/shared/ui/button/button';
import { CardComponent } from '@/app/shared/ui/card/card';
import { DataTableComponent } from '@/app/shared/ui/data-table/data-table';
import { UiColDirective } from '@/app/shared/ui/data-table/ui-col.directive';
import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { FormFieldComponent } from '@/app/shared/ui/form-field/form-field';
import { PageHeaderComponent } from '@/app/shared/ui/page-header/page-header';
import { SearchStore } from '@/app/shared/store/search.store';
import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { hasRequiredFields, getTrimmedValues } from '@/app/shared/utils/form.utils';

@Component({
  selector: 'app-environment-list',
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    DataTableComponent,
    DatePipe,
    EmptyStateComponent,
    FormFieldComponent,
    PageHeaderComponent,
    ReactiveFormsModule,
    RouterLink,
    UiColDirective,
  ],
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

  readonly form = this.fb.group({
    name: [''],
    key: [''],
    color: ['#3b82f6'],
  });

  protected canAdd(): boolean {
    return hasRequiredFields(this.form, ['name', 'key']);
  }

  addEnvironment(): void {
    if (!this.canAdd()) return;

    const { name, key } = getTrimmedValues(this.form, ['name', 'key']);
    const { color } = this.form.getRawValue();
    const order = this.environmentStore.environments().length;

    this.environmentStore.addEnvironment({ name, key, color, order });
    this.form.reset({ name: '', key: '', color: '#3b82f6' });
  }

  selectEnvironment(envId: string): void {
    this.environmentStore.selectEnvironment(envId);
    void this.router.navigate(['/environments', envId]);
  }

  setDefaultEnvironment(envId: string): void {
    this.environmentStore.setDefaultEnvironment(envId);
  }
}
