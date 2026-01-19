import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { NavItemComponent } from './nav-item';

describe('NavItem', () => {
  let component: NavItemComponent;
  let fixture: ComponentFixture<NavItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavItemComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NavItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('label', 'Dashboard');
    fixture.componentRef.setInput('route', '/dashboard');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render as a list item', () => {
      fixture.componentRef.setInput('label', 'Dashboard');
      fixture.componentRef.setInput('route', '/dashboard');
      fixture.detectChanges();

      const li = fixture.debugElement.query(By.css('li'));
      expect(li).toBeTruthy();
    });

    it('should render a link element', () => {
      fixture.componentRef.setInput('label', 'Dashboard');
      fixture.componentRef.setInput('route', '/dashboard');
      fixture.detectChanges();

      const link = fixture.debugElement.query(By.css('a.nav-item__link'));
      expect(link).toBeTruthy();
    });

    it('should render the label', () => {
      fixture.componentRef.setInput('label', 'Feature Flags');
      fixture.componentRef.setInput('route', '/flags');
      fixture.detectChanges();

      const label = fixture.debugElement.query(By.css('.nav-item__label'));
      expect(label).toBeTruthy();
      expect(label.nativeElement.textContent).toContain('Feature Flags');
    });
  });

  describe('icon', () => {
    it('should render icon when provided', () => {
      fixture.componentRef.setInput('label', 'Dashboard');
      fixture.componentRef.setInput('route', '/dashboard');
      fixture.componentRef.setInput('icon', 'home');
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon).toBeTruthy();
    });

    it('should not render icon when not provided', () => {
      fixture.componentRef.setInput('label', 'Dashboard');
      fixture.componentRef.setInput('route', '/dashboard');
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon).toBeFalsy();
    });
  });

  describe('indicator', () => {
    it('should render indicator when indicatorColor is provided', () => {
      fixture.componentRef.setInput('label', 'Production');
      fixture.componentRef.setInput('route', '/env/prod');
      fixture.componentRef.setInput('indicatorColor', '#f85149');
      fixture.detectChanges();

      const indicator = fixture.debugElement.query(By.css('.nav-item__indicator'));
      expect(indicator).toBeTruthy();
    });

    it('should apply indicator color as background', () => {
      fixture.componentRef.setInput('label', 'Production');
      fixture.componentRef.setInput('route', '/env/prod');
      fixture.componentRef.setInput('indicatorColor', '#f85149');
      fixture.detectChanges();

      const indicator = fixture.debugElement.query(By.css('.nav-item__indicator'));
      expect(indicator.nativeElement.style.backgroundColor).toBe('rgb(248, 81, 73)');
    });

    it('should not render indicator when not provided', () => {
      fixture.componentRef.setInput('label', 'Dashboard');
      fixture.componentRef.setInput('route', '/dashboard');
      fixture.detectChanges();

      const indicator = fixture.debugElement.query(By.css('.nav-item__indicator'));
      expect(indicator).toBeFalsy();
    });

    it('should not render icon when indicator is shown', () => {
      fixture.componentRef.setInput('label', 'Production');
      fixture.componentRef.setInput('route', '/env/prod');
      fixture.componentRef.setInput('icon', 'flag');
      fixture.componentRef.setInput('indicatorColor', '#f85149');
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon).toBeFalsy();
    });
  });

  describe('active state', () => {
    it('should not be active by default', () => {
      fixture.componentRef.setInput('label', 'Dashboard');
      fixture.componentRef.setInput('route', '/dashboard');
      fixture.detectChanges();

      const li = fixture.debugElement.query(By.css('li'));
      expect(li.nativeElement.classList.contains('nav-item--active')).toBe(false);
    });

    it('should apply active class when active is true', () => {
      fixture.componentRef.setInput('label', 'Dashboard');
      fixture.componentRef.setInput('route', '/dashboard');
      fixture.componentRef.setInput('active', true);
      fixture.detectChanges();

      const li = fixture.debugElement.query(By.css('li'));
      expect(li.nativeElement.classList.contains('nav-item--active')).toBe(true);
    });
  });

  describe('routing', () => {
    it('should have routerLink directive on link', () => {
      fixture.componentRef.setInput('label', 'Settings');
      fixture.componentRef.setInput('route', '/settings');
      fixture.detectChanges();

      const link = fixture.debugElement.query(By.css('a'));
      expect(link).toBeTruthy();
      // Verify the link has href attribute (set by routerLink)
      expect(link.nativeElement.hasAttribute('href')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have aria-current when active', () => {
      fixture.componentRef.setInput('label', 'Dashboard');
      fixture.componentRef.setInput('route', '/dashboard');
      fixture.componentRef.setInput('active', true);
      fixture.detectChanges();

      const link = fixture.debugElement.query(By.css('a'));
      expect(link.nativeElement.getAttribute('aria-current')).toBe('page');
    });

    it('should not have aria-current when not active', () => {
      fixture.componentRef.setInput('label', 'Dashboard');
      fixture.componentRef.setInput('route', '/dashboard');
      fixture.componentRef.setInput('active', false);
      fixture.detectChanges();

      const link = fixture.debugElement.query(By.css('a'));
      expect(link.nativeElement.getAttribute('aria-current')).toBeNull();
    });
  });
});
