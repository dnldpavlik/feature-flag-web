import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { BreadcrumbItem } from './shared/ui/breadcrumb/breadcrumb';
import { IconName } from './shared/ui/icon/icon';
import { HeaderComponent } from './shared/layout/header/header';
import { SidebarComponent } from './shared/layout/sidebar/sidebar';
import { SearchStore } from './shared/store/search.store';
import { EnvironmentStore } from './shared/store/environment.store';
import { ProjectStore } from './shared/store/project.store';

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
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly projectStore = inject(ProjectStore);
  private readonly searchStore = inject(SearchStore);
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  protected readonly sidebarOpen = signal(true);

  protected readonly currentUser = signal({
    name: 'John Doe',
    email: 'john@example.com',
  });

  protected readonly breadcrumbs = computed<BreadcrumbItem[]>(() => [
    {
      label: 'Project',
      key: 'project',
      route: '/projects',
      selectOptions: this.projectStore.projects().map((project) => ({
        id: project.id,
        label: project.name,
      })),
      selectedId: this.projectStore.selectedProjectId(),
    },
    { label: this.getSectionLabel(this.currentUrl()) },
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

  constructor() {
    effect(() => {
      this.currentUrl();
      this.searchStore.clear();
    });
  }

  private getSectionLabel(url: string): string {
    const segment =
      url
        .split('?')[0]
        .split('#')[0]
        .split('/')
        .filter(Boolean)[0] ?? 'dashboard';

    switch (segment) {
      case 'dashboard':
        return 'Dashboard';
      case 'flags':
        return 'Feature Flags';
      case 'environments':
        return 'Environments';
      case 'projects':
        return 'Projects';
      case 'segments':
        return 'Segments';
      case 'audit':
        return 'Audit Log';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }
}
