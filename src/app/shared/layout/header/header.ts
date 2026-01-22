import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { Router } from '@angular/router';

import { BreadcrumbComponent, BreadcrumbItem } from '../../ui/breadcrumb/breadcrumb';
import { ButtonComponent } from '../../ui/button/button';
import { SearchInputComponent } from '../../ui/search-input/search-input';
import { ProjectStore } from '../../../features/projects/store/project.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [BreadcrumbComponent, ButtonComponent, SearchInputComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly projectStore = inject(ProjectStore);

  /** Breadcrumb items for the current page */
  readonly breadcrumbs = input.required<readonly BreadcrumbItem[]>();

  /** Emits when the menu toggle button is pressed */
  readonly menuToggle = output<void>();

  protected createFlag(): void {
    void this.router.navigate(['/flags/new']);
  }

  protected handleBreadcrumbSelection(payload: { key: string; value: string }): void {
    if (payload.key === 'project') {
      this.projectStore.selectProject(payload.value);
    }
  }
}
