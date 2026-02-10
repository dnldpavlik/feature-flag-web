import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { SidebarComponent } from './sidebar';
import { SidebarEnvironment, SidebarNavItem, SidebarUser } from './sidebar.types';
import { expectExists, expectTextContains, query, queryAll } from '@/app/testing';

@Component({
  selector: 'app-sidebar-host',
  template: `
    <app-sidebar
      [navItems]="navItems"
      [environments]="environments"
      [currentUser]="currentUser"
      (logout)="logoutCalled = true"
    />
  `,
  imports: [SidebarComponent],
})
class SidebarHostComponent {
  navItems: SidebarNavItem[] = [{ label: 'Dashboard', route: '/dashboard', icon: 'home' }];
  environments: SidebarEnvironment[] = [
    { name: 'Production', color: '#f85149', route: '/env/production' },
  ];
  currentUser: SidebarUser = { name: 'John Doe', email: 'john@example.com' };
  logoutCalled = false;
}

@Component({
  selector: 'app-sidebar-multi-host',
  template: `
    <app-sidebar [navItems]="navItems" [environments]="environments" [currentUser]="currentUser" />
  `,
  imports: [SidebarComponent],
})
class SidebarMultiNavHostComponent {
  navItems: SidebarNavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Flags', route: '/flags', icon: 'flag' },
    { label: 'Settings', route: '/settings', icon: 'settings' },
  ];
  environments: SidebarEnvironment[] = [
    { name: 'Development', color: '#22c55e', route: '/env/development' },
    { name: 'Staging', color: '#eab308', route: '/env/staging' },
    { name: 'Production', color: '#f85149', route: '/env/production' },
  ];
  currentUser: SidebarUser = { name: 'Jane Smith', email: 'jane@example.com' };
}

describe('Sidebar', () => {
  describe('basic rendering', () => {
    let fixture: ComponentFixture<SidebarHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SidebarHostComponent],
        providers: [provideRouter([])],
      }).compileComponents();

      fixture = TestBed.createComponent(SidebarHostComponent);
      fixture.detectChanges();
    });

    it('should render the sidebar container element', () => {
      expectExists(fixture, '.sidebar');
    });

    it('should render the application logo', () => {
      expectExists(fixture, '.sidebar__logo');
    });

    it('should render the application title', () => {
      expectTextContains(fixture, '.sidebar__title', 'Feature Flags');
    });

    it('should render the navigation section', () => {
      expectExists(fixture, '.sidebar__nav');
    });

    it('should render the footer section', () => {
      expectExists(fixture, '.sidebar__footer');
    });
  });

  describe('navigation items', () => {
    let fixture: ComponentFixture<SidebarHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SidebarHostComponent],
        providers: [provideRouter([])],
      }).compileComponents();

      fixture = TestBed.createComponent(SidebarHostComponent);
      fixture.detectChanges();
    });

    it('should render nav items for each provided item', () => {
      const items = queryAll(fixture, '.nav-list app-nav-item');
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it('should render environment items in the environments section', () => {
      expectExists(fixture, 'app-nav-section');
    });
  });

  describe('with multiple navigation items', () => {
    let fixture: ComponentFixture<SidebarMultiNavHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SidebarMultiNavHostComponent],
        providers: [provideRouter([])],
      }).compileComponents();

      fixture = TestBed.createComponent(SidebarMultiNavHostComponent);
      fixture.detectChanges();
    });

    it('should render all provided nav items', () => {
      const items = queryAll(fixture, 'app-nav-item');
      // 3 nav items + 3 environment items = 6 total
      expect(items.length).toBe(6);
    });

    it('should render all environment items', () => {
      const envSection = query(fixture, 'app-nav-section');
      const envItems = envSection?.queryAll(By.css('app-nav-item')) ?? [];
      expect(envItems.length).toBe(3);
    });
  });

  describe('user menu', () => {
    let fixture: ComponentFixture<SidebarHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SidebarHostComponent],
        providers: [provideRouter([])],
      }).compileComponents();

      fixture = TestBed.createComponent(SidebarHostComponent);
      fixture.detectChanges();
    });

    it('should render the user menu component', () => {
      expectExists(fixture, 'app-user-menu');
    });

    it('should display user name in the user menu', () => {
      expectTextContains(fixture, '.user-menu', 'John Doe');
    });

    it('should display user email in the user menu', () => {
      expectTextContains(fixture, '.user-menu', 'john@example.com');
    });
  });

  describe('logout', () => {
    let fixture: ComponentFixture<SidebarHostComponent>;
    let hostComponent: SidebarHostComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SidebarHostComponent],
        providers: [provideRouter([])],
      }).compileComponents();

      fixture = TestBed.createComponent(SidebarHostComponent);
      hostComponent = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should emit logout when user menu logout is clicked', () => {
      const logoutBtn = fixture.debugElement.query(By.css('.user-menu__logout'));
      logoutBtn.nativeElement.click();
      fixture.detectChanges();

      expect(hostComponent.logoutCalled).toBe(true);
    });
  });

  describe('environments section', () => {
    let fixture: ComponentFixture<SidebarMultiNavHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SidebarMultiNavHostComponent],
        providers: [provideRouter([])],
      }).compileComponents();

      fixture = TestBed.createComponent(SidebarMultiNavHostComponent);
      fixture.detectChanges();
    });

    it('should display environments section with title', () => {
      const section = query(fixture, 'app-nav-section');
      expect(section?.properties['title']).toBe('Environments');
    });
  });
});
