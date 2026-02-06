import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProjectStore } from '@/app/shared/store/project.store';
import { SearchStore } from '@/app/shared/store/search.store';
import { FlagStore } from '@/app/features/flags/store/flag.store';
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
  let flagStore: FlagStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectListComponent],
      providers: [ProjectStore, SearchStore, FlagStore, provideRouter([]), ...MOCK_API_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectListComponent);
    component = getComponent(fixture);
    store = injectService(ProjectStore);
    searchStore = injectService(SearchStore);
    flagStore = injectService(FlagStore);
    await store.loadProjects();
    await flagStore.loadFlags();
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

  describe('deleteProject', () => {
    it('should show confirmation when project has flags', () => {
      // proj_default has flags
      component.requestDeleteProject('proj_default');

      expect(component.projectToDelete()).toBe('proj_default');
      expect(component.deleteConfirmationFlagCount()).toBeGreaterThan(0);
    });

    it('should show confirmation even when project has no flags', () => {
      // Create a project with no flags
      const emptyProjectId = 'proj_empty';
      jest.spyOn(flagStore, 'getFlagsByProjectId').mockReturnValue([]);

      component.requestDeleteProject(emptyProjectId);

      expect(component.projectToDelete()).toBe(emptyProjectId);
      expect(component.deleteConfirmationFlagCount()).toBe(0);
    });

    it('should cancel delete when cancelDelete is called', () => {
      component.requestDeleteProject('proj_default');
      expect(component.projectToDelete()).toBe('proj_default');

      component.cancelDelete();

      expect(component.projectToDelete()).toBeNull();
    });

    it('should delete flags first then project when confirmed', async () => {
      const deleteFlagsSpy = jest.spyOn(flagStore, 'deleteFlagsByProjectId').mockResolvedValue();
      const deleteProjectSpy = jest.spyOn(store, 'deleteProject').mockResolvedValue();

      component.requestDeleteProject('proj_default');
      await component.confirmDelete();

      expect(deleteFlagsSpy).toHaveBeenCalledWith('proj_default');
      expect(deleteProjectSpy).toHaveBeenCalledWith('proj_default');
    });

    it('should clear confirmation state after delete', async () => {
      jest.spyOn(flagStore, 'deleteFlagsByProjectId').mockResolvedValue();
      jest.spyOn(store, 'deleteProject').mockResolvedValue();

      component.requestDeleteProject('proj_default');
      await component.confirmDelete();

      expect(component.projectToDelete()).toBeNull();
    });

    it('should call requestDeleteProject from deprecated deleteProject method', () => {
      const requestSpy = jest.spyOn(component, 'requestDeleteProject');
      component.deleteProject('proj_default');
      expect(requestSpy).toHaveBeenCalledWith('proj_default');
    });

    it('should do nothing when confirmDelete is called without projectToDelete', async () => {
      const deleteFlagsSpy = jest.spyOn(flagStore, 'deleteFlagsByProjectId');
      const deleteProjectSpy = jest.spyOn(store, 'deleteProject');

      // Ensure no project is selected for deletion
      expect(component.projectToDelete()).toBeNull();

      await component.confirmDelete();

      expect(deleteFlagsSpy).not.toHaveBeenCalled();
      expect(deleteProjectSpy).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should call loadProjects on retry', () => {
      const loadSpy = jest.spyOn(store, 'loadProjects').mockResolvedValue();
      component['retry']();
      expect(loadSpy).toHaveBeenCalled();
    });
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
