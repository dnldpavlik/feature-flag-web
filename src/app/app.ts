import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { ThemeService } from './core/theme/theme.service';
import { BreadcrumbItem } from './shared/ui/breadcrumb/breadcrumb';
import { ToastComponent } from './shared/ui/toast/toast';
import { HeaderComponent } from './layout/header/header';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { NAV_ITEMS } from './layout/nav.config';
import { SearchStore } from './shared/store/search.store';
import { EnvironmentStore } from './shared/store/environment.store';
import { ProjectStore } from './shared/store/project.store';
import { FlagStore } from './features/flags/store/flag.store';
import { SegmentStore } from './features/segments/store/segment.store';
import { AuditStore } from './features/audit/store/audit.store';
import { getSectionLabel } from './shared/utils/url.utils';

interface SidebarEnvironment {
  name: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly environmentStore = inject(EnvironmentStore);
  private readonly projectStore = inject(ProjectStore);
  private readonly flagStore = inject(FlagStore);
  private readonly segmentStore = inject(SegmentStore);
  private readonly auditStore = inject(AuditStore);
  private readonly searchStore = inject(SearchStore);
  private readonly router = inject(Router);

  // Inject ThemeService to ensure it initializes and applies theme on startup
  private readonly _themeService = inject(ThemeService);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly sidebarOpen = signal(true);

  protected readonly currentUser = {
    name: 'John Doe',
    email: 'john@example.com',
  };

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
    { label: getSectionLabel(this.currentUrl()) },
  ]);

  protected readonly navItems = NAV_ITEMS;

  protected readonly environments = computed<SidebarEnvironment[]>(() =>
    this.environmentStore.sortedEnvironments().map((env) => ({
      name: env.name,
      color: env.color,
      route: `/environments/${env.id}`,
    })),
  );

  constructor() {
    // Load initial data from API
    void this.initializeStores();

    // Clear search when navigating
    effect(() => {
      this.currentUrl();
      this.searchStore.clear();
    });
  }

  private async initializeStores(): Promise<void> {
    await Promise.all([this.projectStore.loadProjects(), this.environmentStore.loadEnvironments()]);
    // Load flags, segments, and audit after projects/environments
    await Promise.all([
      this.flagStore.loadFlags(),
      this.segmentStore.loadSegments(),
      this.auditStore.loadEntries(),
    ]);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }
}
