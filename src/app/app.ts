import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbComponent, BreadcrumbItem } from './shared/ui/breadcrumb/breadcrumb';
import { ButtonComponent } from './shared/ui/button/button';
import { EmptyStateComponent } from './shared/ui/empty-state/empty-state';
import { IconName } from './shared/ui/icon/icon';
import { SidebarComponent } from './shared/layout/sidebar/sidebar';
import { SearchInputComponent } from './shared/ui/search-input/search-input';
import { StatCardComponent } from './shared/ui/stat-card/stat-card';

interface NavItem {
  label: string;
  route: string;
  icon: IconName;
  active: boolean;
}

interface Environment {
  name: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BreadcrumbComponent, ButtonComponent, EmptyStateComponent, SearchInputComponent, SidebarComponent, StatCardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
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
      active: true,
    },
    {
      label: 'Feature Flags',
      route: '/flags',
      icon: 'flag',
      active: false,
    },
    {
      label: 'Projects',
      route: '/projects',
      icon: 'folder',
      active: false,
    },
    {
      label: 'Segments',
      route: '/segments',
      icon: 'users',
      active: false,
    },
    {
      label: 'Audit Log',
      route: '/audit',
      icon: 'list',
      active: false,
    },
    {
      label: 'Settings',
      route: '/settings',
      icon: 'settings',
      active: false,
    },
  ]);

  protected readonly environments = signal<Environment[]>([
    { name: 'Production', color: '#f85149', route: '/env/production' },
    { name: 'Staging', color: '#d29922', route: '/env/staging' },
    { name: 'Development', color: '#3fb950', route: '/env/development' },
  ]);

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }
}
