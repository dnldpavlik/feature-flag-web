import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { SearchStore } from '../../../../shared/store/search.store';
import { EnvironmentStore } from '../../../flags/store/environment.store';

@Component({
  selector: 'app-environment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, EmptyStateComponent, RouterLink],
  templateUrl: './environment-list.html',
  styleUrl: './environment-list.scss',
})
export class EnvironmentListComponent {
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly router = inject(Router);
  private readonly searchStore = inject(SearchStore);

  protected readonly environments = this.environmentStore.sortedEnvironments;
  protected readonly selectedEnvironmentId = this.environmentStore.selectedEnvironmentId;
  protected readonly searchQuery = computed(() => this.searchStore.query().trim().toLowerCase());
  protected readonly filteredEnvironments = computed(() => {
    const query = this.searchQuery();
    if (!query) return this.environments();

    return this.environments().filter((env) =>
      `${env.name} ${env.key}`.toLowerCase().includes(query)
    );
  });

  protected name = '';
  protected key = '';
  protected color = '#3b82f6';

  protected canAdd(): boolean {
    return this.name.trim().length > 0 && this.key.trim().length > 0;
  }

  protected addEnvironment(): void {
    if (!this.canAdd()) return;

    const order = this.environmentStore.environments().length;
    this.environmentStore.addEnvironment({
      name: this.name.trim(),
      key: this.key.trim(),
      color: this.color,
      order,
    });

    this.name = '';
    this.key = '';
    this.color = '#3b82f6';
  }

  protected selectEnvironment(envId: string): void {
    this.environmentStore.selectEnvironment(envId);
    void this.router.navigate(['/environments', envId]);
  }

  protected setDefaultEnvironment(envId: string): void {
    this.environmentStore.setDefaultEnvironment(envId);
  }
}
