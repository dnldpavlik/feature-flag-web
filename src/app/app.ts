import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { IconComponent, IconName } from './shared/ui/icon/icon';
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
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, StatCardComponent, IconComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  protected readonly sidebarOpen = signal(true);

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
    { name: 'Production', color: '#f85149' },
    { name: 'Staging', color: '#d29922' },
    { name: 'Development', color: '#3fb950' },
  ]);

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }
}
