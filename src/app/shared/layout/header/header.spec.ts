import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { BreadcrumbItem } from '../../ui/breadcrumb/breadcrumb';
import { SearchInputComponent } from '../../ui/search-input/search-input';
import { ProjectStore } from '../../../features/projects/store/project.store';
import { SearchStore } from '../../store/search.store';
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
      providers: [provideRouter([]), ProjectStore],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderHostComponent);
    router = TestBed.inject(Router);
    projectStore = TestBed.inject(ProjectStore);
    searchStore = TestBed.inject(SearchStore);
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

  it('should select a project from the breadcrumb dropdown', () => {
    const selectSpy = jest.spyOn(projectStore, 'selectProject');
    const select = fixture.debugElement.query(By.css('.breadcrumb__select'));
    select.triggerEventHandler('change', { target: { value: 'proj_growth' } });
    expect(selectSpy).toHaveBeenCalledWith('proj_growth');
  });

  it('should update the search store when the input changes', () => {
    const input = fixture.debugElement.query(By.directive(SearchInputComponent));
    const searchInput = input.componentInstance as SearchInputComponent;

    searchInput.valueChange.emit('flags');

    expect(searchStore.query()).toBe('flags');
  });

  it('should ignore non-project breadcrumb selections', () => {
    const selectSpy = jest.spyOn(projectStore, 'selectProject');
    const header = fixture.debugElement.query(By.directive(HeaderComponent));
    const instance = header.componentInstance as HeaderComponent & {
      handleBreadcrumbSelection: (payload: { key: string; value: string }) => void;
    };
    instance.handleBreadcrumbSelection({ key: 'section', value: 'flags' });
    expect(selectSpy).not.toHaveBeenCalled();
  });
});
