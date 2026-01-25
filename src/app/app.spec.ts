import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { ProjectStore } from '@/app/shared/store/project.store';
import { SearchStore } from '@/app/shared/store/search.store';
import { AppComponent } from './app';

@Component({ template: '' })
class DummyComponent {}

type AppComponentInternals = AppComponent & {
  sidebarOpen: { (): boolean; update: (fn: (v: boolean) => boolean) => void };
  currentUser: { name: string; email: string };
  navItems: readonly { label: string; route: string; icon: string }[];
  breadcrumbs: () => { label: string; key?: string; route?: string }[];
  environments: () => { name: string; color: string; route: string }[];
};

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let router: Router;
  let searchStore: SearchStore;
  let projectStore: ProjectStore;
  let environmentStore: EnvironmentStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: DummyComponent },
          { path: 'flags', component: DummyComponent },
          { path: 'flags/new', component: DummyComponent },
          { path: 'environments', component: DummyComponent },
          { path: 'environments/:id', component: DummyComponent },
          { path: 'projects', component: DummyComponent },
          { path: 'segments', component: DummyComponent },
          { path: 'audit', component: DummyComponent },
          { path: 'settings', component: DummyComponent },
        ]),
        EnvironmentStore,
        ProjectStore,
        SearchStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    searchStore = TestBed.inject(SearchStore);
    projectStore = TestBed.inject(ProjectStore);
    environmentStore = TestBed.inject(EnvironmentStore);
    fixture.detectChanges();
  });

  describe('component initialization', () => {
    it('should create the app component', () => {
      expect(component).toBeTruthy();
    });

    it('should have sidebar open by default', () => {
      expect((component as AppComponentInternals).sidebarOpen()).toBe(true);
    });

    it('should have current user with name and email', () => {
      const user = (component as AppComponentInternals).currentUser;
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
    });
  });

  describe('layout rendering', () => {
    it('should render the app shell container', () => {
      const shell = fixture.debugElement.query(By.css('.app-shell'));
      expect(shell).toBeTruthy();
    });

    it('should render the sidebar component', () => {
      const sidebar = fixture.debugElement.query(By.css('app-sidebar'));
      expect(sidebar).toBeTruthy();
    });

    it('should render the header component', () => {
      const header = fixture.debugElement.query(By.css('app-header'));
      expect(header).toBeTruthy();
    });

    it('should render the main content area', () => {
      const main = fixture.debugElement.query(By.css('.main-content'));
      expect(main).toBeTruthy();
    });

    it('should render the router outlet', () => {
      const outlet = fixture.debugElement.query(By.css('router-outlet'));
      expect(outlet).toBeTruthy();
    });
  });

  describe('navigation items', () => {
    it('should provide navigation items to sidebar', () => {
      const navItems = (component as AppComponentInternals).navItems;
      expect(navItems.length).toBeGreaterThan(0);
    });

    it('should include Dashboard nav item', () => {
      const navItems = (component as AppComponentInternals).navItems;
      const dashboard = navItems.find((item) => item.label === 'Dashboard');
      expect(dashboard).toBeDefined();
      expect(dashboard?.route).toBe('/dashboard');
      expect(dashboard?.icon).toBe('home');
    });

    it('should include Feature Flags nav item', () => {
      const navItems = (component as AppComponentInternals).navItems;
      const flags = navItems.find((item) => item.label === 'Feature Flags');
      expect(flags).toBeDefined();
      expect(flags?.route).toBe('/flags');
      expect(flags?.icon).toBe('flag');
    });

    it('should include Environments nav item', () => {
      const navItems = (component as AppComponentInternals).navItems;
      const environments = navItems.find((item) => item.label === 'Environments');
      expect(environments).toBeDefined();
      expect(environments?.route).toBe('/environments');
    });

    it('should include Projects nav item', () => {
      const navItems = (component as AppComponentInternals).navItems;
      const projects = navItems.find((item) => item.label === 'Projects');
      expect(projects).toBeDefined();
      expect(projects?.route).toBe('/projects');
    });

    it('should include Segments nav item', () => {
      const navItems = (component as AppComponentInternals).navItems;
      const segments = navItems.find((item) => item.label === 'Segments');
      expect(segments).toBeDefined();
      expect(segments?.route).toBe('/segments');
    });

    it('should include Audit Log nav item', () => {
      const navItems = (component as AppComponentInternals).navItems;
      const audit = navItems.find((item) => item.label === 'Audit Log');
      expect(audit).toBeDefined();
      expect(audit?.route).toBe('/audit');
    });

    it('should include Settings nav item', () => {
      const navItems = (component as AppComponentInternals).navItems;
      const settings = navItems.find((item) => item.label === 'Settings');
      expect(settings).toBeDefined();
      expect(settings?.route).toBe('/settings');
    });
  });

  describe('environments computed signal', () => {
    it('should compute environments from environment store', () => {
      const environments = (component as AppComponentInternals).environments();
      expect(environments.length).toBe(environmentStore.environments().length);
    });

    it('should map environment data with route', () => {
      const environments = (component as AppComponentInternals).environments();
      const firstEnv = environments[0];
      expect(firstEnv.name).toBeDefined();
      expect(firstEnv.color).toBeDefined();
      expect(firstEnv.route).toMatch(/^\/environments\//);
    });
  });

  describe('breadcrumbs computed signal', () => {
    it('should include project breadcrumb with select options', () => {
      const breadcrumbs = (component as AppComponentInternals).breadcrumbs();
      const projectCrumb = breadcrumbs.find((b) => b.key === 'project');
      expect(projectCrumb).toBeDefined();
      expect(projectCrumb?.label).toBe('Project');
    });

    it('should include section label breadcrumb', () => {
      const breadcrumbs = (component as AppComponentInternals).breadcrumbs();
      expect(breadcrumbs.length).toBe(2);
    });

    it('should update section label when navigating to flags', fakeAsync(() => {
      router.navigate(['/flags']);
      tick();
      fixture.detectChanges();

      const breadcrumbs = (component as AppComponentInternals).breadcrumbs();
      const sectionCrumb = breadcrumbs[1];
      expect(sectionCrumb.label).toBe('Feature Flags');
    }));

    it('should update section label when navigating to environments', fakeAsync(() => {
      router.navigate(['/environments']);
      tick();
      fixture.detectChanges();

      const breadcrumbs = (component as AppComponentInternals).breadcrumbs();
      const sectionCrumb = breadcrumbs[1];
      expect(sectionCrumb.label).toBe('Environments');
    }));

    it('should update section label when navigating to projects', fakeAsync(() => {
      router.navigate(['/projects']);
      tick();
      fixture.detectChanges();

      const breadcrumbs = (component as AppComponentInternals).breadcrumbs();
      const sectionCrumb = breadcrumbs[1];
      expect(sectionCrumb.label).toBe('Projects');
    }));

    it('should update section label when navigating to segments', fakeAsync(() => {
      router.navigate(['/segments']);
      tick();
      fixture.detectChanges();

      const breadcrumbs = (component as AppComponentInternals).breadcrumbs();
      const sectionCrumb = breadcrumbs[1];
      expect(sectionCrumb.label).toBe('Segments');
    }));

    it('should update section label when navigating to audit', fakeAsync(() => {
      router.navigate(['/audit']);
      tick();
      fixture.detectChanges();

      const breadcrumbs = (component as AppComponentInternals).breadcrumbs();
      const sectionCrumb = breadcrumbs[1];
      expect(sectionCrumb.label).toBe('Audit Log');
    }));

    it('should update section label when navigating to settings', fakeAsync(() => {
      router.navigate(['/settings']);
      tick();
      fixture.detectChanges();

      const breadcrumbs = (component as AppComponentInternals).breadcrumbs();
      const sectionCrumb = breadcrumbs[1];
      expect(sectionCrumb.label).toBe('Settings');
    }));
  });

  describe('toggleSidebar', () => {
    it('should toggle sidebar from open to closed', () => {
      expect((component as AppComponentInternals).sidebarOpen()).toBe(true);
      component.toggleSidebar();
      expect((component as AppComponentInternals).sidebarOpen()).toBe(false);
    });

    it('should toggle sidebar from closed to open', () => {
      component.toggleSidebar(); // close
      component.toggleSidebar(); // open
      expect((component as AppComponentInternals).sidebarOpen()).toBe(true);
    });

    it('should be callable from header menu toggle event', () => {
      const header = fixture.debugElement.query(By.css('app-header'));
      header.triggerEventHandler('menuToggle');
      fixture.detectChanges();
      expect((component as AppComponentInternals).sidebarOpen()).toBe(false);
    });
  });

  describe('search store clearing on navigation', () => {
    it('should clear search store when URL changes', fakeAsync(() => {
      searchStore.setQuery('test search');
      expect(searchStore.query()).toBe('test search');

      router.navigate(['/flags']);
      tick();
      fixture.detectChanges();

      expect(searchStore.query()).toBe('');
    }));

    it('should clear search store on each navigation', fakeAsync(() => {
      router.navigate(['/flags']);
      tick();
      fixture.detectChanges();

      searchStore.setQuery('flags search');

      router.navigate(['/environments']);
      tick();
      fixture.detectChanges();

      expect(searchStore.query()).toBe('');
    }));
  });

  describe('project store integration', () => {
    it('should include project options in breadcrumbs from store', () => {
      const breadcrumbs = (component as AppComponentInternals).breadcrumbs();
      const projectCrumb = breadcrumbs.find((b) => b.key === 'project') as {
        selectOptions?: { id: string; label: string }[];
      };
      expect(projectCrumb?.selectOptions?.length).toBe(projectStore.projects().length);
    });

    it('should include selected project id in breadcrumbs', () => {
      const breadcrumbs = (component as AppComponentInternals).breadcrumbs();
      const projectCrumb = breadcrumbs.find((b) => b.key === 'project') as {
        selectedId?: string;
      };
      expect(projectCrumb?.selectedId).toBe(projectStore.selectedProjectId());
    });

    it('should update breadcrumbs when project selection changes', () => {
      projectStore.selectProject('proj_growth');
      fixture.detectChanges();

      const breadcrumbs = (component as AppComponentInternals).breadcrumbs();
      const projectCrumb = breadcrumbs.find((b) => b.key === 'project') as {
        selectedId?: string;
      };
      expect(projectCrumb?.selectedId).toBe('proj_growth');
    });
  });
});
