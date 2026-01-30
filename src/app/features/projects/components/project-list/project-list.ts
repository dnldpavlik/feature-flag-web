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
import {
  hasRequiredFields,
  getTrimmedValues,
  createFormFieldAccessors,
} from '@/app/shared/utils/form.utils';

interface ProjectFormFields {
  name: string;
  key: string;
  description: string;
}

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
    if (!query) return this.projects();

    return this.projects().filter((project) =>
      `${project.name} ${project.key} ${project.description}`.toLowerCase().includes(query),
    );
  });

  readonly form = this.fb.group({
    name: [''],
    key: [''],
    description: [''],
  });

  // Form field accessors for backward compatibility with tests
  private readonly fields = createFormFieldAccessors<ProjectFormFields>(this.form);

  get name(): string {
    return this.fields.name;
  }
  set name(value: string) {
    this.fields.name = value;
  }

  get key(): string {
    return this.fields.key;
  }
  set key(value: string) {
    this.fields.key = value;
  }

  get description(): string {
    return this.fields.description;
  }
  set description(value: string) {
    this.fields.description = value;
  }

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
