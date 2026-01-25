import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { SidebarComponent } from './sidebar';
import { SidebarEnvironment, SidebarNavItem, SidebarUser } from './sidebar.types';

@Component({
  selector: 'app-sidebar-host',
  template: `
    <app-sidebar [navItems]="navItems" [environments]="environments" [currentUser]="currentUser" />
  `,
  imports: [SidebarComponent],
})
class SidebarHostComponent {
  navItems: SidebarNavItem[] = [{ label: 'Dashboard', route: '/dashboard', icon: 'home' }];
  environments: SidebarEnvironment[] = [
    { name: 'Production', color: '#f85149', route: '/env/production' },
  ];
  currentUser: SidebarUser = { name: 'John Doe', email: 'john@example.com' };
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
      const sidebar = fixture.debugElement.query(By.css('.sidebar'));
      expect(sidebar).toBeTruthy();
    });

    it('should render the application logo', () => {
      const logo = fixture.debugElement.query(By.css('.sidebar__logo'));
      expect(logo).toBeTruthy();
    });

    it('should render the application title', () => {
      const title = fixture.debugElement.query(By.css('.sidebar__title'));
      expect(title.nativeElement.textContent).toContain('Feature Flags');
    });

    it('should render the navigation section', () => {
      const nav = fixture.debugElement.query(By.css('.sidebar__nav'));
      expect(nav).toBeTruthy();
    });

    it('should render the footer section', () => {
      const footer = fixture.debugElement.query(By.css('.sidebar__footer'));
      expect(footer).toBeTruthy();
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
      const items = fixture.debugElement.queryAll(By.css('.nav-list app-nav-item'));
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it('should render environment items in the environments section', () => {
      const envSection = fixture.debugElement.query(By.css('app-nav-section'));
      expect(envSection).toBeTruthy();
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
      const items = fixture.debugElement.queryAll(By.css('app-nav-item'));
      // 3 nav items + 3 environment items = 6 total
      expect(items.length).toBe(6);
    });

    it('should render all environment items', () => {
      const envSection = fixture.debugElement.query(By.css('app-nav-section'));
      const envItems = envSection.queryAll(By.css('app-nav-item'));
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
      const menu = fixture.debugElement.query(By.css('app-user-menu'));
      expect(menu).toBeTruthy();
    });

    it('should display user name in the user menu', () => {
      const userMenuText = fixture.debugElement.query(By.css('.user-menu'));
      expect(userMenuText.nativeElement.textContent).toContain('John Doe');
    });

    it('should display user email in the user menu', () => {
      const userMenuText = fixture.debugElement.query(By.css('.user-menu'));
      expect(userMenuText.nativeElement.textContent).toContain('john@example.com');
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
      const section = fixture.debugElement.query(By.css('app-nav-section'));
      expect(section.properties['title']).toBe('Environments');
    });
  });
});
