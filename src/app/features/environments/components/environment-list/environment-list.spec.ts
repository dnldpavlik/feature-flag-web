import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { SearchStore } from '@/app/shared/store/search.store';
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
} from '@/app/testing';

describe('EnvironmentList', () => {
  let fixture: ComponentFixture<EnvironmentListComponent>;
  let component: EnvironmentListComponent;
  let store: EnvironmentStore;
  let router: Router;
  let searchStore: SearchStore;

  const build = async () => {
    await TestBed.configureTestingModule({
      imports: [EnvironmentListComponent],
      providers: [EnvironmentStore, SearchStore, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EnvironmentListComponent);
    component = getComponent(fixture);
    store = injectService(EnvironmentStore);
    router = injectService(Router);
    searchStore = injectService(SearchStore);
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
    component.addEnvironment();
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
