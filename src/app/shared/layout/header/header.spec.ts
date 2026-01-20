import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { BreadcrumbItem } from '../../ui/breadcrumb/breadcrumb';
import { HeaderComponent } from './header';

@Component({
  selector: 'app-header-host',
  template: `
    <app-header
      [breadcrumbs]="breadcrumbs"
      (menuToggle)="handleMenuToggle()"
    />
  `,
  imports: [HeaderComponent],
})
class HeaderHostComponent {
  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Feature Flags' },
  ];
  menuToggles = 0;

  handleMenuToggle(): void {
    this.menuToggles += 1;
  }
}

describe('Header', () => {
  let fixture: ComponentFixture<HeaderHostComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderHostComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderHostComponent);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should render the header container', () => {
    const header = fixture.debugElement.query(By.css('.header'));
    expect(header).toBeTruthy();
  });

  it('should render a breadcrumb trail', () => {
    const breadcrumb = fixture.debugElement.query(By.css('app-breadcrumb'));
    expect(breadcrumb).toBeTruthy();
  });

  it('should emit when the menu button is clicked', () => {
    const menuButton = fixture.debugElement.query(By.css('.header__menu-btn'));
    menuButton.triggerEventHandler('click');
    expect(fixture.componentInstance.menuToggles).toBe(1);
  });

  it('should navigate to create flag on action click', () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const createButton = fixture.debugElement.query(By.css('.header__right app-button'));
    createButton.triggerEventHandler('click');
    expect(navigateSpy).toHaveBeenCalledWith(['/flags/new']);
  });
});
