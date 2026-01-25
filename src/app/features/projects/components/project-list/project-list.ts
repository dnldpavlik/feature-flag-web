import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { SearchStore } from '../../../../shared/store/search.store';
import { ProjectStore } from '../../../../shared/store/project.store';

@Component({
  selector: 'app-project-list',
  imports: [DatePipe, FormsModule, ButtonComponent, EmptyStateComponent, RouterLink],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent {
  private readonly projectStore = inject(ProjectStore);
  private readonly searchStore = inject(SearchStore);

  protected readonly projects = this.projectStore.projects;
  protected readonly selectedProjectId = this.projectStore.selectedProjectId;
  protected readonly searchQuery = computed(() => this.searchStore.query().trim().toLowerCase());
  protected readonly filteredProjects = computed(() => {
    const query = this.searchQuery();
    if (!query) return this.projects();

    return this.projects().filter((project) =>
      `${project.name} ${project.key} ${project.description}`.toLowerCase().includes(query)
    );
  });

  protected name = '';
  protected key = '';
  protected description = '';

  protected canAdd(): boolean {
    return this.name.trim().length > 0 && this.key.trim().length > 0;
  }

  protected addProject(): void {
    if (!this.canAdd()) return;

    this.projectStore.addProject({
      name: this.name.trim(),
      key: this.key.trim(),
      description: this.description.trim(),
    });

    this.name = '';
    this.key = '';
    this.description = '';
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
