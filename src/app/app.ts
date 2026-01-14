import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { StatCard } from './shared/ui/stat-card/stat-card';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  active: boolean;
}

interface Environment {
  name: string;
  color: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, StatCard],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly sidebarOpen = signal(true);

  protected readonly navItems = signal<NavItem[]>([
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
      </svg>`,
      active: true
    },
    {
      label: 'Feature Flags',
      route: '/flags',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd"/>
      </svg>`,
      active: false
    },
    {
      label: 'Projects',
      route: '/projects',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
      </svg>`,
      active: false
    },
    {
      label: 'Segments',
      route: '/segments',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
      </svg>`,
      active: false
    },
    {
      label: 'Audit Log',
      route: '/audit',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
      </svg>`,
      active: false
    },
    {
      label: 'Settings',
      route: '/settings',
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
      </svg>`,
      active: false
    }
  ]);

  protected readonly environments = signal<Environment[]>([
    { name: 'Production', color: '#f85149' },
    { name: 'Staging', color: '#d29922' },
    { name: 'Development', color: '#3fb950' }
  ]);

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }
}
