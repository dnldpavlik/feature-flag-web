import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { ProjectStore } from '../../../../shared/store/project.store';
import { SearchStore } from '../../../../shared/store/search.store';
import { ProjectListComponent } from './project-list';

describe('ProjectList', () => {
  let fixture: ComponentFixture<ProjectListComponent>;
  let store: ProjectStore;
  let searchStore: SearchStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectListComponent],
      providers: [ProjectStore, SearchStore, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
    store = TestBed.inject(ProjectStore);
    searchStore = TestBed.inject(SearchStore);
    fixture.detectChanges();
  });

  it('should render the project heading', () => {
    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading.nativeElement.textContent).toContain('Projects');
  });

  it('should render project rows', () => {
    const rows = fixture.debugElement.queryAll(By.css('.projects-table__row'));
    expect(rows.length).toBe(store.projects().length + 1);
  });

  it('should add a project', () => {
    fixture.componentInstance.name = 'Pricing App';
    fixture.componentInstance.key = 'pricing';
    fixture.componentInstance.description = 'Pricing tests';
    fixture.componentInstance.addProject();
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.projects-table__row'));
    expect(rows.length).toBe(store.projects().length + 1);
  });

  it('should not add a project when required fields are missing', () => {
    const initialCount = store.projects().length;
    fixture.componentInstance.name = '';
    fixture.componentInstance.key = '';
    fixture.componentInstance.addProject();
    expect(store.projects().length).toBe(initialCount);
  });

  it('should select a project', () => {
    const selectSpy = jest.spyOn(store, 'selectProject');
    fixture.componentInstance.selectProject('proj_growth');
    expect(selectSpy).toHaveBeenCalledWith('proj_growth');
  });

  it('should set the default project', () => {
    const defaultSpy = jest.spyOn(store, 'setDefaultProject');
    fixture.componentInstance.setDefaultProject('proj_growth');
    expect(defaultSpy).toHaveBeenCalledWith('proj_growth');
  });

  it('should delete a project', () => {
    const deleteSpy = jest.spyOn(store, 'deleteProject');
    fixture.componentInstance.deleteProject('proj_growth');
    expect(deleteSpy).toHaveBeenCalledWith('proj_growth');
  });

  it('should filter projects by the search query', () => {
    searchStore.setQuery('zzzz-no-match');
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.projects-table__row'));
    expect(rows.length).toBe(0);
    const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
    expect(emptyState).toBeTruthy();
  });
});
