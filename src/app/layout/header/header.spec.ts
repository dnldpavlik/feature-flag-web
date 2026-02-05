import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { BreadcrumbItem } from '@/app/shared/ui/breadcrumb/breadcrumb.types';
import { SearchInputComponent } from '@/app/shared/ui/search-input/search-input';
import { ProjectStore } from '@/app/shared/store/project.store';
import { SearchStore } from '@/app/shared/store/search.store';
import { HeaderComponent } from './header';
import { expectExists, query, injectService, MOCK_API_PROVIDERS } from '@/app/testing';

@Component({
  selector: 'app-header-host',
  template: ` <app-header [breadcrumbs]="breadcrumbs" (menuToggle)="handleMenuToggle()" /> `,
  imports: [HeaderComponent],
})
class HeaderHostComponent {
  breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Project',
      key: 'project',
      selectOptions: [
        { id: 'proj_default', label: 'Default Project' },
        { id: 'proj_growth', label: 'Growth Experiments' },
      ],
      selectedId: 'proj_default',
    },
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
  let projectStore: ProjectStore;
  let searchStore: SearchStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderHostComponent],
      providers: [provideRouter([]), ProjectStore, ...MOCK_API_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderHostComponent);
    router = injectService(Router);
    projectStore = injectService(ProjectStore);
    searchStore = injectService(SearchStore);
    fixture.detectChanges();
  });

  describe('rendering', () => {
    it('should render the header container element', () => {
      expectExists(fixture, '.header');
    });

    it('should render the breadcrumb navigation trail', () => {
      expectExists(fixture, 'app-breadcrumb');
    });

    it('should render the search input component', () => {
      const searchInput = fixture.debugElement.query(By.directive(SearchInputComponent));
      expect(searchInput).toBeTruthy();
    });

    it('should render the create flag action button', () => {
      expectExists(fixture, '.header__right app-button');
    });

    it('should render the mobile menu toggle button', () => {
      expectExists(fixture, '.header__menu-btn');
    });
  });

  describe('mobile menu interaction', () => {
    it('should emit menuToggle event when menu button is clicked', () => {
      const menuButton = query(fixture, '.header__menu-btn');
      menuButton?.triggerEventHandler('click');
      expect(fixture.componentInstance.menuToggles).toBe(1);
    });

    it('should emit multiple times on multiple clicks', () => {
      const menuButton = query(fixture, '.header__menu-btn');
      menuButton?.triggerEventHandler('click');
      menuButton?.triggerEventHandler('click');
      menuButton?.triggerEventHandler('click');
      expect(fixture.componentInstance.menuToggles).toBe(3);
    });
  });

  describe('create flag navigation', () => {
    it('should navigate to /flags/new when create button is clicked', () => {
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      const createButton = query(fixture, '.header__right app-button');
      createButton?.triggerEventHandler('click');
      expect(navigateSpy).toHaveBeenCalledWith(['/flags/new']);
    });
  });

  describe('project selection via breadcrumb', () => {
    it('should select project when breadcrumb dropdown value changes', () => {
      const selectSpy = jest.spyOn(projectStore, 'selectProject');
      const select = query(fixture, '.breadcrumb__select');
      select?.triggerEventHandler('change', { target: { value: 'proj_growth' } });
      expect(selectSpy).toHaveBeenCalledWith('proj_growth');
    });

    it('should not call selectProject for non-project breadcrumb keys', () => {
      const selectSpy = jest.spyOn(projectStore, 'selectProject');
      const header = fixture.debugElement.query(By.directive(HeaderComponent));
      const instance = header.componentInstance as HeaderComponent & {
        handleBreadcrumbSelection: (payload: { key: string; value: string }) => void;
      };
      instance.handleBreadcrumbSelection({ key: 'section', value: 'flags' });
      expect(selectSpy).not.toHaveBeenCalled();
    });

    it('should only respond to project key selections', () => {
      const selectSpy = jest.spyOn(projectStore, 'selectProject');
      const header = fixture.debugElement.query(By.directive(HeaderComponent));
      const instance = header.componentInstance as HeaderComponent & {
        handleBreadcrumbSelection: (payload: { key: string; value: string }) => void;
      };
      instance.handleBreadcrumbSelection({ key: 'environment', value: 'env_staging' });
      expect(selectSpy).not.toHaveBeenCalled();
    });
  });

  describe('search functionality', () => {
    it('should update search store when search input value changes', () => {
      const input = fixture.debugElement.query(By.directive(SearchInputComponent));
      const searchInput = input.componentInstance as SearchInputComponent;

      searchInput.valueChange.emit('flags');

      expect(searchStore.query()).toBe('flags');
    });

    it('should clear search store when empty value is emitted', () => {
      const input = fixture.debugElement.query(By.directive(SearchInputComponent));
      const searchInput = input.componentInstance as SearchInputComponent;

      searchInput.valueChange.emit('initial');
      searchInput.valueChange.emit('');

      expect(searchStore.query()).toBe('');
    });
  });
});
