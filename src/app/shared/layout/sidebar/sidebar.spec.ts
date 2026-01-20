import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { SidebarComponent, SidebarEnvironment, SidebarNavItem, SidebarUser } from './sidebar';

@Component({
  selector: 'app-sidebar-host',
  template: `
    <app-sidebar
      [navItems]="navItems"
      [environments]="environments"
      [currentUser]="currentUser"
    />
  `,
  imports: [SidebarComponent],
})
class SidebarHostComponent {
  navItems: SidebarNavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'home', active: true },
  ];
  environments: SidebarEnvironment[] = [
    { name: 'Production', color: '#f85149', route: '/env/production' },
  ];
  currentUser: SidebarUser = { name: 'John Doe', email: 'john@example.com' };
}

describe('Sidebar', () => {
  let fixture: ComponentFixture<SidebarHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarHostComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarHostComponent);
    fixture.detectChanges();
  });

  it('should render the sidebar container', () => {
    const sidebar = fixture.debugElement.query(By.css('.sidebar'));
    expect(sidebar).toBeTruthy();
  });

  it('should render nav items', () => {
    const items = fixture.debugElement.queryAll(By.css('app-nav-item'));
    expect(items.length).toBe(2);
  });

  it('should render the user menu', () => {
    const menu = fixture.debugElement.query(By.css('app-user-menu'));
    expect(menu).toBeTruthy();
  });
});
