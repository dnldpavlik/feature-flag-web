import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbItem } from './shared/ui/breadcrumb/breadcrumb';
import { IconName } from './shared/ui/icon/icon';
import { HeaderComponent } from './shared/layout/header/header';
import { SidebarComponent } from './shared/layout/sidebar/sidebar';
import { EnvironmentStore } from './features/flags/store/environment.store';

interface NavItem {
  label: string;
  route: string;
  icon: IconName;
}

interface Environment {
  name: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  private readonly environmentStore = inject(EnvironmentStore);

  protected readonly sidebarOpen = signal(true);

  protected readonly currentUser = signal({
    name: 'John Doe',
    email: 'john@example.com',
  });

  protected readonly breadcrumbs = signal<BreadcrumbItem[]>([
    { label: 'Default Project', route: '/projects/default' },
    { label: 'Feature Flags' },
  ]);

  protected readonly navItems = signal<NavItem[]>([
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'home',
    },
    {
      label: 'Feature Flags',
      route: '/flags',
      icon: 'flag',
    },
    {
      label: 'Environments',
      route: '/environments',
      icon: 'list',
    },
    {
      label: 'Projects',
      route: '/projects',
      icon: 'folder',
    },
    {
      label: 'Segments',
      route: '/segments',
      icon: 'users',
    },
    {
      label: 'Audit Log',
      route: '/audit',
      icon: 'list',
    },
    {
      label: 'Settings',
      route: '/settings',
      icon: 'settings',
    },
  ]);

  protected readonly environments = computed<Environment[]>(() =>
    this.environmentStore.sortedEnvironments().map((env) => ({
      name: env.name,
      color: env.color,
      route: `/environments/${env.id}`,
    }))
  );

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }
}
