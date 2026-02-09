import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { SearchStore } from '@/app/shared/store/search.store';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { ProjectStore } from '@/app/shared/store/project.store';
import { EnvironmentListComponent } from './environment-list';
import {
  expectHeading,
  expectEmptyState,
  getTableRows,
  getRowCount,
  query,
  queryAll,
  injectService,
  getComponent,
  setFormFields,
  MOCK_API_PROVIDERS,
} from '@/app/testing';

describe('EnvironmentList', () => {
  let fixture: ComponentFixture<EnvironmentListComponent>;
  let component: EnvironmentListComponent;
  let store: EnvironmentStore;
  let flagStore: FlagStore;
  let router: Router;
  let searchStore: SearchStore;

  const build = async () => {
    await TestBed.configureTestingModule({
      imports: [EnvironmentListComponent],
      providers: [
        EnvironmentStore,
        ProjectStore,
        FlagStore,
        SearchStore,
        provideRouter([]),
        ...MOCK_API_PROVIDERS,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EnvironmentListComponent);
    component = getComponent(fixture);
    store = injectService(EnvironmentStore);
    flagStore = injectService(FlagStore);
    router = injectService(Router);
    searchStore = injectService(SearchStore);
    const projectStore = injectService(ProjectStore);
    await projectStore.loadProjects();
    await store.loadEnvironments();
    await flagStore.loadFlags();
    fixture.detectChanges();
  };

  it('should render the environments heading', async () => {
    await build();
    expectHeading(fixture, 'Environments');
  });

  it('should render environment rows', async () => {
    await build();
    const rows = getTableRows(fixture);
    expect(rows.length).toBe(store.environments().length);
  });

  it('should mark the selected environment', async () => {
    await build();
    store.selectEnvironment('env_staging');
    fixture.detectChanges();

    const selectedBadge = query(fixture, '.data-table__body-wrap tbody tr .badge--success');
    expect(selectedBadge?.nativeElement.textContent).toContain('Selected');
  });

  it('should add a new environment', async () => {
    await build();

    setFormFields(component, { name: 'QA', key: 'qa', color: '#22c55e' });
    await component.addEnvironment();
    fixture.detectChanges();

    expect(store.environments().length).toBe(4);
    const names = queryAll(fixture, '.env-link').map((link) =>
      link.nativeElement.textContent.trim(),
    );
    expect(names).toContain('QA');
  });

  it('should select an environment from the list', async () => {
    await build();
    const selectSpy = jest.spyOn(store, 'selectEnvironment');
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.selectEnvironment('env_staging');

    expect(selectSpy).toHaveBeenCalledWith('env_staging');
    expect(navSpy).toHaveBeenCalledWith(['/environments', 'env_staging']);
  });

  it('should set the default environment', async () => {
    await build();
    const defaultSpy = jest.spyOn(store, 'setDefaultEnvironment');

    component.setDefaultEnvironment('env_staging');

    expect(defaultSpy).toHaveBeenCalledWith('env_staging');
  });

  it('should not add when required fields are missing', async () => {
    await build();

    setFormFields(component, { name: '', key: '' });
    component.addEnvironment();

    expect(store.environments().length).toBe(3);
  });

  it('should filter environments by the search query', async () => {
    await build();
    searchStore.setQuery('zzzz-no-match');
    fixture.detectChanges();

    expect(getRowCount(fixture)).toBe(0);
    expectEmptyState(fixture);
  });

  describe('deleteEnvironment', () => {
    it('should show Delete button when more than one environment exists', async () => {
      await build();
      const deleteButtons = queryAll(fixture, 'app-button[variant="ghost"]').filter(
        (btn) => btn.nativeElement.textContent.trim() === 'Delete',
      );
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('should show confirmation dialog when requesting delete', async () => {
      await build();
      component.requestDeleteEnvironment('env_staging');
      fixture.detectChanges();

      expect(component.envToDelete()).toBe('env_staging');
      const overlay = query(fixture, '.delete-confirmation-overlay');
      expect(overlay).toBeTruthy();
    });

    it('should show flag count in confirmation dialog', async () => {
      await build();
      component.requestDeleteEnvironment('env_staging');
      fixture.detectChanges();

      expect(component.deleteConfirmationFlagCount()).toBeGreaterThanOrEqual(0);
    });

    it('should cancel delete and hide dialog', async () => {
      await build();
      component.requestDeleteEnvironment('env_staging');
      expect(component.envToDelete()).toBe('env_staging');

      component.cancelDelete();

      expect(component.envToDelete()).toBeNull();
    });

    it('should confirm delete and remove the environment', async () => {
      await build();
      const removeEnvValuesSpy = jest.spyOn(flagStore, 'removeEnvironmentValues');
      const deleteEnvSpy = jest.spyOn(store, 'deleteEnvironment');

      component.requestDeleteEnvironment('env_staging');
      await component.confirmDelete();

      expect(deleteEnvSpy).toHaveBeenCalledWith('env_staging');
      expect(removeEnvValuesSpy).toHaveBeenCalledWith('env_staging');
      expect(component.envToDelete()).toBeNull();
    });

    it('should not remove environment values when API delete fails', async () => {
      await build();
      const removeEnvValuesSpy = jest.spyOn(flagStore, 'removeEnvironmentValues');
      jest.spyOn(store, 'deleteEnvironment').mockResolvedValue(false);

      component.requestDeleteEnvironment('env_staging');
      await component.confirmDelete();

      expect(removeEnvValuesSpy).not.toHaveBeenCalled();
      expect(component.envToDelete()).toBeNull();
    });

    it('should do nothing when confirmDelete is called without envToDelete', async () => {
      await build();
      const removeEnvValuesSpy = jest.spyOn(flagStore, 'removeEnvironmentValues');
      const deleteEnvSpy = jest.spyOn(store, 'deleteEnvironment');

      expect(component.envToDelete()).toBeNull();

      await component.confirmDelete();

      expect(removeEnvValuesSpy).not.toHaveBeenCalled();
      expect(deleteEnvSpy).not.toHaveBeenCalled();
    });
  });

  describe('form fields', () => {
    it('should set and get form values via helpers', async () => {
      await build();
      setFormFields(component, {
        name: 'Test Environment',
        key: 'test-key',
        color: '#ff0000',
      });

      expect(component.form.get('name')?.value).toBe('Test Environment');
      expect(component.form.get('key')?.value).toBe('test-key');
      expect(component.form.get('color')?.value).toBe('#ff0000');
    });
  });
});
