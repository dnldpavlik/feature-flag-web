import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  DataTableComponent,
  EmptyStateComponent,
  FormFieldComponent,
  PageHeaderComponent,
  UiColDirective,
} from '@watt/ui';
import { SearchStore } from '@/app/shared/store/search.store';
import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { getTrimmedValues } from '@/app/shared/utils/form.utils';
import { textFilter } from '@/app/shared/utils/filter.utils';

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
  private readonly flagStore = inject(FlagStore);
  private readonly router = inject(Router);
  private readonly searchStore = inject(SearchStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly environments = this.environmentStore.sortedEnvironments;
  protected readonly selectedEnvironmentId = this.environmentStore.selectedEnvironmentId;
  protected readonly searchQuery = this.searchStore.normalizedQuery;
  protected readonly filteredEnvironments = computed(() => {
    const query = this.searchQuery();
    return this.environments().filter(textFilter(['name', 'key'], query));
  });

  // Delete confirmation state
  readonly envToDelete = signal<string | null>(null);
  readonly deleteConfirmationFlagCount = signal(0);

  readonly form = this.fb.group({
    name: [''],
    key: [''],
    color: ['#3b82f6'],
  });

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  protected readonly canAdd = computed(() => {
    const val = this.formValue();
    return String(val.name).trim().length > 0 && String(val.key).trim().length > 0;
  });

  async addEnvironment(): Promise<void> {
    if (!this.canAdd()) {
      return;
    }

    const { name, key } = getTrimmedValues(this.form, ['name', 'key']);
    const { color } = this.form.getRawValue();
    const order = this.environmentStore.environments().length;

    await this.environmentStore.addEnvironment({ name, key, color, order });
    this.form.reset({ name: '', key: '', color: '#3b82f6' });
  }

  selectEnvironment(envId: string): void {
    this.environmentStore.selectEnvironment(envId);
    void this.router.navigate(['/environments', envId]);
  }

  setDefaultEnvironment(envId: string): void {
    void this.environmentStore.setDefaultEnvironment(envId);
  }

  /** Request to delete an environment - shows confirmation dialog */
  requestDeleteEnvironment(envId: string): void {
    const flagCount = this.flagStore.getFlagCountByEnvironmentId(envId);
    this.envToDelete.set(envId);
    this.deleteConfirmationFlagCount.set(flagCount);
  }

  /** Cancel the delete confirmation */
  cancelDelete(): void {
    this.envToDelete.set(null);
    this.deleteConfirmationFlagCount.set(0);
  }

  /** Confirm and execute the delete */
  async confirmDelete(): Promise<void> {
    const envId = this.envToDelete();
    if (!envId) {
      return;
    }

    const deleted = await this.environmentStore.deleteEnvironment(envId);
    if (deleted) {
      this.flagStore.removeEnvironmentValues(envId);
    }
    this.cancelDelete();
  }
}
