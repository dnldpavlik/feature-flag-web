import { Injectable, computed, signal } from '@angular/core';

import { CreateProjectInput, Project } from '@/app/features/projects/models/project.model';
import { createId, createTimestamp } from '../utils/id.utils';

@Injectable({ providedIn: 'root' })
export class ProjectStore {
  private readonly _projects = signal<Project[]>([
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
  ]);

  private readonly _selectedProjectId = signal<string>('proj_default');

  readonly projects = this._projects.asReadonly();
  readonly selectedProjectId = this._selectedProjectId.asReadonly();

  readonly selectedProject = computed(() =>
    this._projects().find((project) => project.id === this._selectedProjectId())
  );

  addProject(input: CreateProjectInput): void {
    const stamp = createTimestamp();
    const projectId = createId('proj');

    const newProject: Project = {
      id: projectId,
      key: input.key,
      name: input.name,
      description: input.description,
      isDefault: input.isDefault ?? false,
      createdAt: stamp,
      updatedAt: stamp,
    };

    this._projects.update((projects) => [...projects, newProject]);
  }

  selectProject(projectId: string): void {
    this._selectedProjectId.set(projectId);
  }

  setDefaultProject(projectId: string): void {
    const stamp = createTimestamp();
    this._projects.update((projects) =>
      projects.map((project) => ({
        ...project,
        isDefault: project.id === projectId,
        updatedAt: project.id === projectId || project.isDefault ? stamp : project.updatedAt,
      }))
    );
  }

  deleteProject(projectId: string): void {
    const projects = this._projects();
    if (projects.length <= 1) return;

    this._projects.update((current) => current.filter((project) => project.id !== projectId));

    const selected = this._selectedProjectId();
    if (selected === projectId) {
      const fallback = this._projects().find((project) => project.isDefault) ?? this._projects()[0];
      this._selectedProjectId.set(fallback.id);
    }
  }

  getProjectById(projectId: string): Project | undefined {
    return this._projects().find((project) => project.id === projectId);
  }
}
