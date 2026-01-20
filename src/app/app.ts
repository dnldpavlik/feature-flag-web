import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbItem } from './shared/ui/breadcrumb/breadcrumb';
import { IconName } from './shared/ui/icon/icon';
import { HeaderComponent } from './shared/layout/header/header';
import { SidebarComponent } from './shared/layout/sidebar/sidebar';

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

  protected readonly environments = signal<Environment[]>([
    { name: 'Production', color: '#f85149', route: '/env/production' },
    { name: 'Staging', color: '#d29922', route: '/env/staging' },
    { name: 'Development', color: '#3fb950', route: '/env/development' },
  ]);

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }
}
