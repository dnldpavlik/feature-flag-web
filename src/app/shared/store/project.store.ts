import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { BaseCrudStore } from '@/app/shared/store/base-crud.store';
import { CreateProjectInput, Project } from '@/app/features/projects/models/project.model';
import { ProjectApi } from '@/app/features/projects/api/project.api';
import { ToastService } from '@/app/shared/ui/toast/toast.service';
import { AuditStore } from '@/app/features/audit/store/audit.store';
import { UserProfileStore } from '@/app/features/settings/store/user-profile.store';

@Injectable({ providedIn: 'root' })
export class ProjectStore extends BaseCrudStore<Project> {
  private readonly api = inject(ProjectApi);
  private readonly toast = inject(ToastService);
  private readonly auditStore = inject(AuditStore);
  private readonly userProfileStore = inject(UserProfileStore);

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

    // Auto-select the default project if nothing is selected
    if (!this._selectedProjectId() && this._items().length > 0) {
      const defaultProject = this._items().find((p) => p.isDefault) ?? this._items()[0];
      this._selectedProjectId.set(defaultProject.id);
    }
  }

  /** Add a new project via API */
  async addProject(input: CreateProjectInput): Promise<void> {
    try {
      const project = await firstValueFrom(this.api.create(input));
      this._items.update((items) => [...items, project]);
      this.toast.success(`Project "${project.name}" created`);
      this.logAuditAction('created', project.id, project.name, `Created project "${project.key}"`);
    } catch {
      // Error toast handled by error interceptor
    }
  }

  /** Select a project as the current context */
  selectProject(projectId: string): void {
    this._selectedProjectId.set(projectId);
  }

  /** Set a project as the default via API */
  async setDefaultProject(projectId: string): Promise<void> {
    try {
      await firstValueFrom(this.api.setDefault(projectId));
      this.updateWhere(
        (project) => project.id === projectId || project.isDefault,
        (project) => ({ isDefault: project.id === projectId }),
      );
    } catch {
      // Error toast handled by error interceptor
    }
  }

  /** Delete a project via API */
  async deleteProject(projectId: string): Promise<void> {
    if (this._items().length <= 1) return;

    const project = this.getById(projectId);
    if (!project) return;

    try {
      await firstValueFrom(this.api.delete(projectId));
      this.deleteItem(projectId);

      // If we deleted the selected project, fall back to default or first
      if (this._selectedProjectId() === projectId) {
        const fallback = this._items().find((p) => p.isDefault) ?? this._items()[0];
        this._selectedProjectId.set(fallback.id);
      }

      this.toast.success('Project deleted');
      this.logAuditAction('deleted', projectId, project.name, `Deleted project "${project.key}"`);
    } catch {
      // Error toast handled by error interceptor
    }
  }

  /** Find project by ID */
  getProjectById(projectId: string): Project | undefined {
    return this.getById(projectId);
  }

  private logAuditAction(
    action: 'created' | 'updated' | 'deleted',
    resourceId: string,
    resourceName: string,
    details: string,
  ): void {
    const user = this.userProfileStore.userProfile();
    this.auditStore.logAction({
      action,
      resourceType: 'project',
      resourceId,
      resourceName,
      details,
      userId: user.id,
      userName: user.name,
    });
  }
}
