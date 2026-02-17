import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { BadgeComponent, ButtonComponent, CardComponent, EmptyStateComponent } from '@watt/ui';
import { ProjectStore } from '@/app/shared/store/project.store';
import { FlagStore } from '@/app/features/flags/store/flag.store';

@Component({
  selector: 'app-project-detail',
  imports: [BadgeComponent, CardComponent, DatePipe, ButtonComponent, EmptyStateComponent],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailComponent {
  private readonly projectStore = inject(ProjectStore);
  private readonly flagStore = inject(FlagStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly projectId = computed(() => this.paramMap().get('projectId') ?? '');
  protected readonly project = computed(() => this.projectStore.getProjectById(this.projectId()));
  protected readonly selectedProjectId = this.projectStore.selectedProjectId;

  protected readonly canDelete = computed(() => {
    const project = this.project();
    return project?.id && project.id !== 'proj_default' && project.id !== this.selectedProjectId();
  });

  protected selectProject(): void {
    const project = this.project();
    if (!project) {
      return;
    }
    this.projectStore.selectProject(project.id);
  }

  protected makeDefault(): void {
    const project = this.project();
    if (!project) {
      return;
    }
    void this.projectStore.setDefaultProject(project.id);
  }

  protected async deleteProject(): Promise<void> {
    const project = this.project();
    if (!project) {
      return;
    }
    await this.projectStore.deleteProject(project.id);
    this.flagStore.removeFlagsByProjectId(project.id);
    void this.router.navigate(['/projects']);
  }

  protected backToList(): void {
    void this.router.navigate(['/projects']);
  }
}
