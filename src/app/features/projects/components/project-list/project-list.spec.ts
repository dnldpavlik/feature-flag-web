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
  MOCK_API_PROVIDERS,
} from '@/app/testing';

describe('ProjectList', () => {
  let fixture: ComponentFixture<ProjectListComponent>;
  let component: ProjectListComponent;
  let store: ProjectStore;
  let searchStore: SearchStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectListComponent],
      providers: [ProjectStore, SearchStore, provideRouter([]), ...MOCK_API_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
    component = getComponent(fixture);
    store = injectService(ProjectStore);
    searchStore = injectService(SearchStore);
    await store.loadProjects();
    fixture.detectChanges();
  });

  it('should render the project heading', () => {
    expectHeading(fixture, 'Projects');
  });

  it('should render project rows', () => {
    fixture.detectChanges();
    const rows = getTableRows(fixture);
    expect(rows.length).toBe(store.projects().length);
  });

  it('should call addProject on the store', () => {
    const addSpy = jest.spyOn(store, 'addProject').mockResolvedValue();
    setFormFields(component, {
      name: 'Pricing App',
      key: 'pricing',
      description: 'Pricing tests',
    });
    component.addProject();

    expect(addSpy).toHaveBeenCalledWith({
      name: 'Pricing App',
      key: 'pricing',
      description: 'Pricing tests',
    });
  });

  it('should not add a project when required fields are missing', () => {
    const addSpy = jest.spyOn(store, 'addProject').mockResolvedValue();
    setFormFields(component, { name: '', key: '' });
    component.addProject();
    expect(addSpy).not.toHaveBeenCalled();
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
