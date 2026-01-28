import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '@/app/shared/ui/button/button';
import { DataTableComponent } from '@/app/shared/ui/data-table/data-table';
import { UiColDirective } from '@/app/shared/ui/data-table/ui-col.directive';
import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { SearchStore } from '@/app/shared/store/search.store';
import { ProjectStore } from '@/app/shared/store/project.store';

@Component({
  selector: 'app-project-list',
  imports: [DatePipe, ReactiveFormsModule, ButtonComponent, DataTableComponent, UiColDirective, EmptyStateComponent, RouterLink],
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

  protected readonly form = this.fb.group({
    name: [''],
    key: [''],
    description: [''],
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

  get description(): string {
    return this.form.controls.description.value;
  }
  set description(value: string) {
    this.form.controls.description.setValue(value);
  }

  protected canAdd(): boolean {
    const { name, key } = this.form.getRawValue();
    return name.trim().length > 0 && key.trim().length > 0;
  }

  protected addProject(): void {
    if (!this.canAdd()) return;

    const { name, key, description } = this.form.getRawValue();
    this.projectStore.addProject({
      name: name.trim(),
      key: key.trim(),
      description: description.trim(),
    });

    this.form.reset();
  }

  protected selectProject(projectId: string): void {
    this.projectStore.selectProject(projectId);
  }

  protected setDefaultProject(projectId: string): void {
    this.projectStore.setDefaultProject(projectId);
  }

  protected deleteProject(projectId: string): void {
    this.projectStore.deleteProject(projectId);
  }
}
