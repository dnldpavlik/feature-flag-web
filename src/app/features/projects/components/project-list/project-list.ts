import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  DataTableComponent,
  EmptyStateComponent,
  ErrorBannerComponent,
  FormFieldComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
  UiColDirective,
} from '@watt/ui';
import { SearchStore } from '@/app/shared/store/search.store';
import { ProjectStore } from '@/app/shared/store/project.store';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { hasRequiredFields, getTrimmedValues } from '@/app/shared/utils/form.utils';
import { textFilter } from '@/app/shared/utils/filter.utils';

@Component({
  selector: 'app-project-list',
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    DataTableComponent,
    DatePipe,
    EmptyStateComponent,
    ErrorBannerComponent,
    FormFieldComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    ReactiveFormsModule,
    RouterLink,
    UiColDirective,
  ],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent {
  private readonly projectStore = inject(ProjectStore);
  private readonly searchStore = inject(SearchStore);
  private readonly flagStore = inject(FlagStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly projects = this.projectStore.projects;
  protected readonly loading = this.projectStore.loading;
  protected readonly error = this.projectStore.error;
  protected readonly selectedProjectId = this.projectStore.selectedProjectId;
  protected readonly searchQuery = this.searchStore.normalizedQuery;
  protected readonly filteredProjects = computed(() => {
    const query = this.searchQuery();
    return this.projects().filter(textFilter(['name', 'key', 'description'], query));
  });

  // Delete confirmation state
  protected readonly projectToDelete = signal<string | null>(null);
  protected readonly deleteConfirmationFlagCount = signal(0);

  protected readonly form = this.fb.group({
    name: [''],
    key: [''],
    description: [''],
  });

  protected canAdd(): boolean {
    return hasRequiredFields(this.form, ['name', 'key']);
  }

  protected addProject(): void {
    if (!this.canAdd()) {
      return;
    }

    const { name, key, description } = getTrimmedValues(this.form, ['name', 'key', 'description']);
    void this.projectStore.addProject({ name, key, description });
    this.form.reset();
  }

  protected selectProject(projectId: string): void {
    this.projectStore.selectProject(projectId);
  }

  protected setDefaultProject(projectId: string): void {
    void this.projectStore.setDefaultProject(projectId);
  }

  /** @deprecated Use requestDeleteProject instead */
  protected deleteProject(projectId: string): void {
    this.requestDeleteProject(projectId);
  }

  /** Request to delete a project - shows confirmation dialog */
  protected requestDeleteProject(projectId: string): void {
    const flags = this.flagStore.getFlagsByProjectId(projectId);
    this.projectToDelete.set(projectId);
    this.deleteConfirmationFlagCount.set(flags.length);
  }

  /** Cancel the delete confirmation */
  protected cancelDelete(): void {
    this.projectToDelete.set(null);
    this.deleteConfirmationFlagCount.set(0);
  }

  /** Confirm and execute the delete */
  protected async confirmDelete(): Promise<void> {
    const projectId = this.projectToDelete();
    if (!projectId) {
      return;
    }

    try {
      await this.projectStore.deleteProject(projectId);
      this.flagStore.removeFlagsByProjectId(projectId);
    } catch {
      // Error handling delegated to the store
    } finally {
      this.cancelDelete();
    }
  }

  protected retry(): void {
    void this.projectStore.loadProjects();
  }
}
