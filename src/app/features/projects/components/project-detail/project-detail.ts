import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { BadgeComponent } from '@/app/shared/ui/badge/badge';
import { ButtonComponent } from '@/app/shared/ui/button/button';
import { CardComponent } from '@/app/shared/ui/card/card';
import { EmptyStateComponent } from '@/app/shared/ui/empty-state/empty-state';
import { ProjectStore } from '@/app/shared/store/project.store';

@Component({
  selector: 'app-project-detail',
  imports: [BadgeComponent, CardComponent, DatePipe, ButtonComponent, EmptyStateComponent],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailComponent {
  private readonly projectStore = inject(ProjectStore);
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
    if (!project) return;
    this.projectStore.selectProject(project.id);
  }

  protected makeDefault(): void {
    const project = this.project();
    if (!project) return;
    this.projectStore.setDefaultProject(project.id);
  }

  protected deleteProject(): void {
    const project = this.project();
    if (!project) return;
    this.projectStore.deleteProject(project.id);
    void this.router.navigate(['/projects']);
  }

  protected backToList(): void {
    void this.router.navigate(['/projects']);
  }
}
