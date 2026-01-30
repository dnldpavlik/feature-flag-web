import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProjectStore } from '@/app/shared/store/project.store';
import { SearchStore } from '@/app/shared/store/search.store';
import { ProjectListComponent } from './project-list';
import {
  expectHeading,
  expectEmptyState,
  getTableRows,
  getRowCount,
  injectService,
  getComponent,
  setFormFields,
} from '@/app/testing';

describe('ProjectList', () => {
  let fixture: ComponentFixture<ProjectListComponent>;
  let component: ProjectListComponent;
  let store: ProjectStore;
  let searchStore: SearchStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectListComponent],
      providers: [ProjectStore, SearchStore, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
    component = getComponent(fixture);
    store = injectService(ProjectStore);
    searchStore = injectService(SearchStore);
    fixture.detectChanges();
  });

  it('should render the project heading', () => {
    expectHeading(fixture, 'Projects');
  });

  it('should render project rows', () => {
    const rows = getTableRows(fixture);
    expect(rows.length).toBe(store.projects().length);
  });

  it('should add a project', () => {
    setFormFields(component, {
      name: 'Pricing App',
      key: 'pricing',
      description: 'Pricing tests',
    });
    component.addProject();
    fixture.detectChanges();

    const rows = getTableRows(fixture);
    expect(rows.length).toBe(store.projects().length);
  });

  it('should not add a project when required fields are missing', () => {
    const initialCount = store.projects().length;
    setFormFields(component, { name: '', key: '' });
    component.addProject();
    expect(store.projects().length).toBe(initialCount);
  });

  it('should select a project', () => {
    const selectSpy = jest.spyOn(store, 'selectProject');
    component.selectProject('proj_growth');
    expect(selectSpy).toHaveBeenCalledWith('proj_growth');
  });

  it('should set the default project', () => {
    const defaultSpy = jest.spyOn(store, 'setDefaultProject');
    component.setDefaultProject('proj_growth');
    expect(defaultSpy).toHaveBeenCalledWith('proj_growth');
  });

  it('should delete a project', () => {
    const deleteSpy = jest.spyOn(store, 'deleteProject');
    component.deleteProject('proj_growth');
    expect(deleteSpy).toHaveBeenCalledWith('proj_growth');
  });

  it('should filter projects by the search query', () => {
    searchStore.setQuery('zzzz-no-match');
    fixture.detectChanges();

    expect(getRowCount(fixture)).toBe(0);
    expectEmptyState(fixture);
  });

  describe('form fields', () => {
    it('should set and get form values via helpers', () => {
      setFormFields(component, {
        name: 'Test Project',
        key: 'test-key',
        description: 'Test description',
      });

      expect(component.form.get('name')?.value).toBe('Test Project');
      expect(component.form.get('key')?.value).toBe('test-key');
      expect(component.form.get('description')?.value).toBe('Test description');
    });
  });
});
