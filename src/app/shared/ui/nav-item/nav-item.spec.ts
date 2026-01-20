import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, Routes, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { NavItemComponent } from './nav-item';

@Component({
  selector: 'app-nav-item-host',
  template: `
    <app-nav-item
      [label]="label"
      [route]="route"
      [icon]="icon"
      [indicatorColor]="indicatorColor"
    />
  `,
  imports: [NavItemComponent],
})
class NavItemHostComponent {
  label = 'Dashboard';
  route = '/dashboard';
  icon: 'home' | undefined = 'home';
  indicatorColor: string | undefined;
}

@Component({
  selector: 'app-nav-item-route-dummy',
  template: '',
  standalone: true,
})
class NavItemRouteDummyComponent {}

describe('NavItem', () => {
  let fixture: ComponentFixture<NavItemHostComponent>;
  let router: Router;
  const routes: Routes = [
    { path: 'dashboard', component: NavItemRouteDummyComponent },
    { path: 'settings', component: NavItemRouteDummyComponent },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavItemHostComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(NavItemHostComponent);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render as a list item', () => {
      fixture.detectChanges();

      const li = fixture.debugElement.query(By.css('li'));
      expect(li).toBeTruthy();
    });

    it('should render a link element', () => {
      fixture.detectChanges();

      const link = fixture.debugElement.query(By.css('a.nav-item__link'));
      expect(link).toBeTruthy();
    });

    it('should render the label', () => {
      fixture.componentInstance.label = 'Feature Flags';
      fixture.componentInstance.route = '/flags';
      fixture.detectChanges();

      const label = fixture.debugElement.query(By.css('.nav-item__label'));
      expect(label).toBeTruthy();
      expect(label.nativeElement.textContent).toContain('Feature Flags');
    });
  });

  describe('icon', () => {
    it('should render icon when provided', () => {
      fixture.componentInstance.icon = 'home';
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon).toBeTruthy();
    });

    it('should not render icon when not provided', () => {
      fixture.componentInstance.icon = undefined;
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon).toBeFalsy();
    });
  });

  describe('indicator', () => {
    it('should render indicator when indicatorColor is provided', () => {
      fixture.componentInstance.label = 'Production';
      fixture.componentInstance.route = '/env/prod';
      fixture.componentInstance.indicatorColor = '#f85149';
      fixture.detectChanges();

      const indicator = fixture.debugElement.query(By.css('.nav-item__indicator'));
      expect(indicator).toBeTruthy();
    });

    it('should apply indicator color as background', () => {
      fixture.componentInstance.label = 'Production';
      fixture.componentInstance.route = '/env/prod';
      fixture.componentInstance.indicatorColor = '#f85149';
      fixture.detectChanges();

      const indicator = fixture.debugElement.query(By.css('.nav-item__indicator'));
      expect(indicator.nativeElement.style.backgroundColor).toBe('rgb(248, 81, 73)');
    });

    it('should not render indicator when not provided', () => {
      fixture.componentInstance.indicatorColor = undefined;
      fixture.detectChanges();

      const indicator = fixture.debugElement.query(By.css('.nav-item__indicator'));
      expect(indicator).toBeFalsy();
    });

    it('should not render icon when indicator is shown', () => {
      fixture.componentInstance.label = 'Production';
      fixture.componentInstance.route = '/env/prod';
      fixture.componentInstance.icon = 'flag';
      fixture.componentInstance.indicatorColor = '#f85149';
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon).toBeFalsy();
    });
  });

  describe('active state', () => {
    it('should not be active when route does not match', async () => {
      fixture.componentInstance.route = '/settings';
      await router.navigateByUrl('/dashboard');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const li = fixture.debugElement.query(By.css('li'));
      expect(li.nativeElement.classList.contains('nav-item--active')).toBe(false);
    });

    it('should apply active class when route matches', async () => {
      fixture.componentInstance.route = '/dashboard';
      await router.navigateByUrl('/dashboard');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const li = fixture.debugElement.query(By.css('li'));
      expect(li.nativeElement.classList.contains('nav-item--active')).toBe(true);
    });
  });

  describe('routing', () => {
    it('should have routerLink directive on link', () => {
      fixture.componentInstance.label = 'Settings';
      fixture.componentInstance.route = '/settings';
      fixture.detectChanges();

      const link = fixture.debugElement.query(By.css('a'));
      expect(link).toBeTruthy();
      // Verify the link has href attribute (set by routerLink)
      expect(link.nativeElement.hasAttribute('href')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have aria-current when active', async () => {
      fixture.componentInstance.route = '/dashboard';
      await router.navigateByUrl('/dashboard');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const link = fixture.debugElement.query(By.css('a'));
      expect(link.nativeElement.getAttribute('aria-current')).toBe('page');
    });

    it('should not have aria-current when not active', async () => {
      fixture.componentInstance.route = '/settings';
      await router.navigateByUrl('/dashboard');
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const link = fixture.debugElement.query(By.css('a'));
      expect(link.nativeElement.getAttribute('aria-current')).toBeNull();
    });
  });
});
