import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { ProjectStore } from '@/app/shared/store/project.store';
import { SearchStore } from '@/app/shared/store/search.store';
import { DashboardComponent } from './dashboard';
import {
  setupComponentTest,
  expectHeading,
  expectEmptyState,
  expectNoEmptyState,
  expectRowCount,
  getTableRows,
  queryAll,
  injectService,
  getComponent,
} from '@/app/testing';

describe('Dashboard', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let environmentStore: EnvironmentStore;
  let flagStore: FlagStore;
  let projectStore: ProjectStore;
  let searchStore: SearchStore;

  beforeEach(async () => {
    fixture = await setupComponentTest({
      component: DashboardComponent,
    });

    component = getComponent(fixture);
    environmentStore = injectService(EnvironmentStore);
    flagStore = injectService(FlagStore);
    projectStore = injectService(ProjectStore);
    searchStore = injectService(SearchStore);
  });

  it('should render the welcome heading', () => {
    expectHeading(fixture, 'Feature Flags');
  });

  it('should render stat cards', () => {
    const cards = queryAll(fixture, 'app-stat-card');
    expect(cards.length).toBe(4);
  });

  it('should show stat values from the stores', () => {
    const totalFlags = flagStore.flags().length;
    const activeFlags = flagStore.enabledFlagsInCurrentEnvironment().length;
    const inactiveFlags = totalFlags - activeFlags;
    const totalEnvironments = environmentStore.environments().length;

    const cards = queryAll(fixture, '.stat-card');
    const stats = cards.map((card) => ({
      value: card.query(By.css('.stat-card__value')).nativeElement.textContent.trim(),
      label: card.query(By.css('.stat-card__label')).nativeElement.textContent.trim(),
    }));

    expect(stats).toContainEqual({ value: String(totalFlags), label: 'Total Flags' });
    expect(stats).toContainEqual({ value: String(activeFlags), label: 'Active' });
    expect(stats).toContainEqual({ value: String(inactiveFlags), label: 'Inactive' });
    expect(stats).toContainEqual({ value: String(totalEnvironments), label: 'Environments' });
  });

  it('should render recently updated flags', () => {
    const rows = getTableRows(fixture);
    expect(rows.length).toBeGreaterThan(0);

    const firstRow = rows[0];
    const link = firstRow.query(By.css('.recent-flags__link'));
    expect(link).toBeTruthy();
    const description = firstRow.query(By.css('.recent-flags__description'));
    expect(description).toBeTruthy();
  });

  it('should filter recent flags by search query', () => {
    searchStore.setQuery('zzzz-no-match');
    fixture.detectChanges();

    expectEmptyState(fixture);
    expectRowCount(fixture, 0);
  });

  it('should highlight matching text in recent flags', () => {
    searchStore.setQuery('pri');
    fixture.detectChanges();

    const highlights = queryAll(fixture, '.recent-flags__highlight');
    expect(highlights.length).toBeGreaterThan(0);
  });

  it('should return no parts when highlight text is empty', () => {
    const parts = component.highlightParts('');
    expect(parts).toEqual([]);
  });

  it('should update active flags when environment changes', () => {
    environmentStore.selectEnvironment('env_staging');
    fixture.detectChanges();

    const activeFlags = flagStore.enabledFlagsInCurrentEnvironment().length;
    const activeCard = queryAll(fixture, '.stat-card').find(
      (card) =>
        card.query(By.css('.stat-card__label')).nativeElement.textContent.trim() === 'Active',
    );

    expect(activeCard?.query(By.css('.stat-card__value')).nativeElement.textContent.trim()).toBe(
      String(activeFlags),
    );
  });

  it('should hide empty state when flags exist', () => {
    expectNoEmptyState(fixture);
  });

  it('should render selected environment name in the header', () => {
    environmentStore.selectEnvironment('env_production');
    fixture.detectChanges();

    const envText = queryAll(fixture, '.dashboard-env');
    expect(envText[1].nativeElement.textContent).toContain('Production');
  });

  it('should fall back to all environments when selection is missing', () => {
    environmentStore.selectEnvironment('env_missing');
    fixture.detectChanges();

    const envText = queryAll(fixture, '.dashboard-env');
    expect(envText[1].nativeElement.textContent).toContain('All Environments');
  });

  it('should render selected project name in the header', () => {
    projectStore.selectProject('proj_growth');
    fixture.detectChanges();

    const envText = queryAll(fixture, '.dashboard-env');
    expect(envText[0].nativeElement.textContent).toContain('Growth Experiments');
  });

  it('should fall back to all projects when selection is missing', () => {
    projectStore.selectProject('proj_missing');
    fixture.detectChanges();

    const envText = queryAll(fixture, '.dashboard-env');
    expect(envText[0].nativeElement.textContent).toContain('All Projects');
  });
});
