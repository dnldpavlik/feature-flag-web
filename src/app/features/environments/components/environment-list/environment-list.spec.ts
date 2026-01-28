import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { SearchStore } from '@/app/shared/store/search.store';
import { EnvironmentListComponent } from './environment-list';

describe('EnvironmentList', () => {
  let fixture: ComponentFixture<EnvironmentListComponent>;
  let store: EnvironmentStore;
  let router: Router;
  let searchStore: SearchStore;

  const build = async () => {
    await TestBed.configureTestingModule({
      imports: [EnvironmentListComponent],
      providers: [EnvironmentStore, SearchStore, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EnvironmentListComponent);
    store = TestBed.inject(EnvironmentStore);
    router = TestBed.inject(Router);
    searchStore = TestBed.inject(SearchStore);
    fixture.detectChanges();
  };

  it('should render the environments heading', async () => {
    await build();

    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading.nativeElement.textContent).toContain('Environments');
  });

  it('should render environment rows', async () => {
    await build();

    const rows = fixture.debugElement.queryAll(By.css('.data-table__body-wrap tbody tr'));
    expect(rows.length).toBe(store.environments().length);
  });

  it('should mark the selected environment', async () => {
    await build();
    store.selectEnvironment('env_staging');
    fixture.detectChanges();

    const selectedBadge = fixture.debugElement.query(
      By.css('.data-table__body-wrap tbody tr .badge--success'),
    );
    expect(selectedBadge.nativeElement.textContent).toContain('Selected');
  });

  it('should add a new environment', async () => {
    await build();

    fixture.componentInstance.name = 'QA';
    fixture.componentInstance.key = 'qa';
    fixture.componentInstance.color = '#22c55e';
    fixture.componentInstance.addEnvironment();
    fixture.detectChanges();

    expect(store.environments().length).toBe(4);
    const names = fixture.debugElement
      .queryAll(By.css('.env-link'))
      .map((link) => link.nativeElement.textContent.trim());
    expect(names).toContain('QA');
  });

  it('should select an environment from the list', async () => {
    await build();
    const selectSpy = jest.spyOn(store, 'selectEnvironment');
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.selectEnvironment('env_staging');

    expect(selectSpy).toHaveBeenCalledWith('env_staging');
    expect(navSpy).toHaveBeenCalledWith(['/environments', 'env_staging']);
  });

  it('should set the default environment', async () => {
    await build();
    const defaultSpy = jest.spyOn(store, 'setDefaultEnvironment');

    fixture.componentInstance.setDefaultEnvironment('env_staging');

    expect(defaultSpy).toHaveBeenCalledWith('env_staging');
  });

  it('should not add when required fields are missing', async () => {
    await build();

    fixture.componentInstance.name = '';
    fixture.componentInstance.key = '';
    fixture.componentInstance.addEnvironment();

    expect(store.environments().length).toBe(3);
  });

  it('should filter environments by the search query', async () => {
    await build();
    searchStore.setQuery('zzzz-no-match');
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.data-table__body-wrap tbody tr'));
    expect(rows.length).toBe(0);
    const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
    expect(emptyState).toBeTruthy();
  });

  describe('form field accessors', () => {
    it('should get and set name field', async () => {
      await build();
      fixture.componentInstance.name = 'Test Environment';
      expect(fixture.componentInstance.name).toBe('Test Environment');
    });

    it('should get and set key field', async () => {
      await build();
      fixture.componentInstance.key = 'test-key';
      expect(fixture.componentInstance.key).toBe('test-key');
    });

    it('should get and set color field', async () => {
      await build();
      fixture.componentInstance.color = '#ff0000';
      expect(fixture.componentInstance.color).toBe('#ff0000');
    });
  });
});
