import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { provideRouter } from '@angular/router';
import { EnvironmentStore } from '../../../flags/store/environment.store';
import { FlagStore } from '../../../flags/store/flag.store';
import { DashboardComponent } from './dashboard';

describe('Dashboard', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let environmentStore: EnvironmentStore;
  let flagStore: FlagStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    environmentStore = TestBed.inject(EnvironmentStore);
    flagStore = TestBed.inject(FlagStore);
    fixture.detectChanges();
  });

  it('should render the welcome heading', () => {
    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading).toBeTruthy();
    expect(heading.nativeElement.textContent).toContain('Feature Flags');
  });

  it('should render stat cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('app-stat-card'));
    expect(cards.length).toBe(4);
  });

  it('should show stat values from the stores', () => {
    const totalFlags = flagStore.flags().length;
    const activeFlags = flagStore.enabledFlagsInCurrentEnvironment().length;
    const inactiveFlags = totalFlags - activeFlags;
    const totalEnvironments = environmentStore.environments().length;

    const cards = fixture.debugElement.queryAll(By.css('.stat-card'));
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
    const rows = fixture.debugElement.queryAll(By.css('.recent-flags__row'));
    expect(rows.length).toBeGreaterThan(1);

    const firstRow = rows[1];
    const link = firstRow.query(By.css('.recent-flags__link'));
    expect(link).toBeTruthy();
  });

  it('should update active flags when environment changes', () => {
    environmentStore.selectEnvironment('env_staging');
    fixture.detectChanges();

    const activeFlags = flagStore.enabledFlagsInCurrentEnvironment().length;
    const activeCard = fixture.debugElement
      .queryAll(By.css('.stat-card'))
      .find(
        (card) =>
          card.query(By.css('.stat-card__label')).nativeElement.textContent.trim() === 'Active'
      );

    expect(activeCard?.query(By.css('.stat-card__value')).nativeElement.textContent.trim()).toBe(
      String(activeFlags)
    );
  });

  it('should update store when environment selector changes', () => {
    const selectSpy = jest.spyOn(environmentStore, 'selectEnvironment');

    fixture.componentInstance.onEnvironmentChange({
      target: { value: 'env_production' },
    } as unknown as Event);

    expect(selectSpy).toHaveBeenCalledWith('env_production');
  });

  it('should hide empty state when flags exist', () => {
    const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
    expect(emptyState).toBeNull();
  });
});
