import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { BaseCrudStore } from '@/app/shared/store/base-crud.store';
import { CreateProjectInput, Project } from '@/app/features/projects/models/project.model';
import { ProjectApi } from '@/app/features/projects/api/project.api';
import { ToastService } from '@watt/ui';
import { AuditLogger } from '@/app/features/audit/services/audit-logger.service';

@Injectable({ providedIn: 'root' })
export class ProjectStore extends BaseCrudStore<Project> {
  private readonly api = inject(ProjectApi);
  private readonly toast = inject(ToastService);
  private readonly logAudit = inject(AuditLogger).forResource('project');

  private static readonly STORAGE_KEY = 'selected-project-id';
  private readonly _selectedProjectId = signal<string>('');

  constructor() {
    super({
      idPrefix: 'proj',
      initialData: [],
      allowDeleteLast: false,
    });
  }

  /** Alias for items to maintain backward compatibility */
  readonly projects = this.items;

  readonly selectedProjectId = this._selectedProjectId.asReadonly();

  readonly selectedProject = computed(() =>
    this._items().find((project) => project.id === this._selectedProjectId()),
  );

  /** Load projects from the API */
  async loadProjects(): Promise<void> {
    await this.loadFromApi(this.api.getAll());

    // Restore selection from localStorage, or fall back to default project
    if (!this._selectedProjectId() && this._items().length > 0) {
      const saved = localStorage.getItem(ProjectStore.STORAGE_KEY);
      const savedProject = saved ? this._items().find((p) => p.id === saved) : undefined;
      const selected = savedProject ?? this._items().find((p) => p.isDefault) ?? this._items()[0];
      this._selectedProjectId.set(selected.id);
    }
  }

  /** Add a new project via API */
  async addProject(input: CreateProjectInput): Promise<void> {
    try {
      const project = await firstValueFrom(this.api.create(input));
      this._items.update((items) => [...items, project]);
      this.toast.success(`Project "${project.name}" created`);
      this.logAudit({
        action: 'created',
        resourceId: project.id,
        resourceName: project.name,
        details: `Created project "${project.key}"`,
      });
    } catch {
      // Error toast handled by error interceptor
    }
  }

  /** Select a project as the current context */
  selectProject(projectId: string): void {
    this._selectedProjectId.set(projectId);
    localStorage.setItem(ProjectStore.STORAGE_KEY, projectId);
  }

  /** Set a project as the default via API */
  async setDefaultProject(projectId: string): Promise<void> {
    const project = this.getById(projectId);
    if (!project) {
      return;
    }

    try {
      await firstValueFrom(this.api.setDefault(projectId));
      this.updateWhere(
        (p) => p.id === projectId || p.isDefault,
        (p) => ({ isDefault: p.id === projectId }),
      );
      this.logAudit({
        action: 'updated',
        resourceId: projectId,
        resourceName: project.name,
        details: `Set as default project`,
      });
    } catch {
      // Error toast handled by error interceptor
    }
  }

  /** Delete a project via API */
  async deleteProject(projectId: string): Promise<void> {
    if (this._items().length <= 1) {
      return;
    }

    const project = this.getById(projectId);
    if (!project) {
      return;
    }

    try {
      await firstValueFrom(this.api.delete(projectId));
      this.deleteItem(projectId);

      // If we deleted the selected project, fall back to default or first
      if (this._selectedProjectId() === projectId) {
        const fallback = this._items().find((p) => p.isDefault) ?? this._items()[0];
        this._selectedProjectId.set(fallback.id);
      }

      this.toast.success('Project deleted');
      this.logAudit({
        action: 'deleted',
        resourceId: projectId,
        resourceName: project.name,
        details: `Deleted project "${project.key}"`,
      });
    } catch {
      // Error toast handled by error interceptor
    }
  }

  /** Find project by ID */
  getProjectById(projectId: string): Project | undefined {
    return this.getById(projectId);
  }
}
