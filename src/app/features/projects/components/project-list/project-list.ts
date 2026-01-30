import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { BadgeComponent } from '@/app/shared/ui/badge/badge';
import { ButtonComponent } from '@/app/shared/ui/button/button';
import { CardComponent } from '@/app/shared/ui/card/card';
import { DataTableComponent } from '@/app/shared/ui/data-table/data-table';
import { UiColDirective } from '@/app/shared/ui/data-table/ui-col.directive';
import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { FormFieldComponent } from '@/app/shared/ui/form-field/form-field';
import { PageHeaderComponent } from '@/app/shared/ui/page-header/page-header';
import { SearchStore } from '@/app/shared/store/search.store';
import { ProjectStore } from '@/app/shared/store/project.store';
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
    FormFieldComponent,
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
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly projects = this.projectStore.projects;
  protected readonly selectedProjectId = this.projectStore.selectedProjectId;
  protected readonly searchQuery = computed(() => this.searchStore.query().trim().toLowerCase());
  protected readonly filteredProjects = computed(() => {
    const query = this.searchQuery();
    return this.projects().filter(textFilter(['name', 'key', 'description'], query));
  });

  readonly form = this.fb.group({
    name: [''],
    key: [''],
    description: [''],
  });

  protected canAdd(): boolean {
    return hasRequiredFields(this.form, ['name', 'key']);
  }

  addProject(): void {
    if (!this.canAdd()) return;

    const { name, key, description } = getTrimmedValues(this.form, ['name', 'key', 'description']);
    this.projectStore.addProject({ name, key, description });
    this.form.reset();
  }

  selectProject(projectId: string): void {
    this.projectStore.selectProject(projectId);
  }

  setDefaultProject(projectId: string): void {
    this.projectStore.setDefaultProject(projectId);
  }

  deleteProject(projectId: string): void {
    this.projectStore.deleteProject(projectId);
  }
}
