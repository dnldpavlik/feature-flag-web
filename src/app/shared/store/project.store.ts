import { Injectable, computed, signal } from '@angular/core';

import { BaseCrudStore } from '@/app/shared/store/base-crud.store';
import { createTimestamp } from '@/app/shared/utils/id.utils';
import { CreateProjectInput, Project } from '@/app/features/projects/models/project.model';

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_default',
    key: 'default',
    name: 'Default Project',
    description: 'Primary feature flag workspace.',
    isDefault: true,
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  },
  {
    id: 'proj_growth',
    key: 'growth',
    name: 'Growth Experiments',
    description: 'Revenue, onboarding, and conversion tests.',
    isDefault: false,
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  },
];

@Injectable({ providedIn: 'root' })
export class ProjectStore extends BaseCrudStore<Project> {
  private readonly _selectedProjectId = signal<string>('proj_default');

  constructor() {
    super({
      idPrefix: 'proj',
      initialData: INITIAL_PROJECTS,
      allowDeleteLast: false,
    });
  }

  /** Alias for items to maintain backward compatibility */
  readonly projects = this.items;

  readonly selectedProjectId = this._selectedProjectId.asReadonly();

  readonly selectedProject = computed(() =>
    this._items().find((project) => project.id === this._selectedProjectId()),
  );

  /** Add a new project */
  addProject(input: CreateProjectInput): void {
    this.addItem({
      key: input.key,
      name: input.name,
      description: input.description,
      isDefault: input.isDefault ?? false,
    });
  }

  /** Select a project as the current context */
  selectProject(projectId: string): void {
    this._selectedProjectId.set(projectId);
  }

  /** Set a project as the default */
  setDefaultProject(projectId: string): void {
    this.updateWhere(
      (project) => project.id === projectId || project.isDefault,
      (project) => ({ isDefault: project.id === projectId }),
    );
  }

  /** Delete a project */
  deleteProject(projectId: string): void {
    if (this._items().length <= 1) return;

    this.deleteItem(projectId);

    // If we deleted the selected project, fall back to default or first
    if (this._selectedProjectId() === projectId) {
      const fallback = this._items().find((project) => project.isDefault) ?? this._items()[0];
      this._selectedProjectId.set(fallback.id);
    }
  }

  /** Find project by ID */
  getProjectById(projectId: string): Project | undefined {
    return this.getById(projectId);
  }
}
