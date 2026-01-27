import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { SearchStore } from '@/app/shared/store/search.store';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { FlagListComponent } from './flag-list';

describe('FlagList', () => {
  let fixture: ComponentFixture<FlagListComponent>;
  let component: FlagListComponent;
  let flagStore: FlagStore;
  let searchStore: SearchStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlagListComponent],
      providers: [FlagStore, EnvironmentStore, SearchStore, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FlagListComponent);
    component = fixture.componentInstance;
    flagStore = TestBed.inject(FlagStore);
    searchStore = TestBed.inject(SearchStore);
    fixture.detectChanges();
  });

  it('should render the feature flags heading', () => {
    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading).toBeTruthy();
    expect(heading.nativeElement.textContent).toContain('Feature Flags');
  });

  it('should render flag rows', () => {
    const rows = fixture.debugElement.queryAll(By.css('.flags-table__row'));
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should render environment selector', () => {
    const envSelect = fixture.debugElement.query(By.css('app-labeled-select'));
    expect(envSelect).toBeTruthy();
  });

  it('should show all environments in selector', () => {
    const selects = fixture.debugElement.queryAll(By.css('app-labeled-select'));
    // First select is Environment
    const envSelect = selects[0];
    const options = envSelect.queryAll(By.css('option'));
    expect(options.length).toBe(3);
  });

  describe('status filtering', () => {
    it('should filter flags by enabled status in current environment', () => {
      // Count enabled flags in development environment
      const enabledCount = flagStore
        .flags()
        .filter((f) => f.environmentValues['env_development']?.enabled).length;

      component.onStatusChange('enabled');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.flags-table__row'));
      expect(rows.length).toBe(enabledCount);
    });

    it('should filter flags by disabled status in current environment', () => {
      // Count disabled flags in development environment
      const disabledCount = flagStore
        .flags()
        .filter((f) => !f.environmentValues['env_development']?.enabled).length;

      component.onStatusChange('disabled');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.flags-table__row'));
      expect(rows.length).toBe(disabledCount);
    });

    it('should update filter when environment changes', () => {
      // Get counts for staging environment
      const enabledInStaging = flagStore
        .flags()
        .filter((f) => f.environmentValues['env_staging']?.enabled).length;

      // Filter by enabled
      component.onStatusChange('enabled');

      // Switch to staging
      component.onEnvironmentChange('env_staging');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.flags-table__row'));
      expect(rows.length).toBe(enabledInStaging);
    });
  });

  describe('type filtering', () => {
    it('should filter flags by type', () => {
      component.onTypeChange('string');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.flags-table__row'));
      expect(rows.length).toBe(1);
    });

    it('should filter boolean flags', () => {
      const booleanCount = flagStore.flags().filter((f) => f.type === 'boolean').length;

      component.onTypeChange('boolean');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.flags-table__row'));
      expect(rows.length).toBe(booleanCount);
    });
  });

  describe('search filtering', () => {
    it('should filter flags by the search query', () => {
      searchStore.setQuery('zzzz-no-match');
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('.flags-table__row'));
      expect(rows.length).toBe(0);
      const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
      expect(emptyState).toBeTruthy();
    });
  });

  describe('flag toggling', () => {
    it('should toggle flag enabled state in current environment', () => {
      const flag = flagStore.flags()[0];
      const initialEnabled = flag.environmentValues['env_development']?.enabled ?? false;

      component.onToggleFlag(flag.id, { target: { checked: !initialEnabled } } as unknown as Event);

      const updated = flagStore.getFlagById(flag.id);
      expect(updated?.environmentValues['env_development'].enabled).toBe(!initialEnabled);
    });

    it('should only affect current environment when toggling', () => {
      const flag = flagStore.flags()[0];
      const stagingEnabled = flag.environmentValues['env_staging']?.enabled;

      component.onToggleFlag(flag.id, { target: { checked: true } } as unknown as Event);

      const updated = flagStore.getFlagById(flag.id);
      expect(updated?.environmentValues['env_staging'].enabled).toBe(stagingEnabled);
    });
  });

  describe('flag deletion', () => {
    it('should show delete button per row when more than one flag exists', () => {
      expect(flagStore.flags().length).toBeGreaterThan(1);

      const deleteButtons = fixture.debugElement.queryAll(By.css('.flag-delete-btn'));
      expect(deleteButtons.length).toBe(flagStore.flags().length);
    });

    it('should hide delete buttons when only one flag exists', () => {
      // Delete all but one flag
      const flags = flagStore.flags();
      for (let i = 0; i < flags.length - 1; i++) {
        flagStore.deleteFlag(flags[i].id);
      }
      fixture.detectChanges();

      const deleteButtons = fixture.debugElement.queryAll(By.css('.flag-delete-btn'));
      expect(deleteButtons.length).toBe(0);
    });

    it('should remove the flag when delete is clicked', () => {
      const beforeCount = flagStore.flags().length;
      const flagToDelete = flagStore.flags()[0];

      component.onDeleteFlag(flagToDelete.id);
      fixture.detectChanges();

      expect(flagStore.flags().length).toBe(beforeCount - 1);
      expect(flagStore.getFlagById(flagToDelete.id)).toBeUndefined();
    });
  });

  describe('value display', () => {
    it('should display current environment value', () => {
      fixture.detectChanges();

      const valueCells = fixture.debugElement.queryAll(By.css('.flag-value'));
      expect(valueCells.length).toBeGreaterThan(0);
    });

    it('should format boolean values', () => {
      const booleanFlag = flagStore.flags().find((f) => f.type === 'boolean');
      expect(booleanFlag).toBeDefined();

      const formattedValue = component.formatValue({
        ...booleanFlag!,
        currentEnabled: true,
        currentValue: true,
      });

      expect(formattedValue).toBe('true');
    });

    it('should format false boolean values', () => {
      const booleanFlag = flagStore.flags().find((f) => f.type === 'boolean');
      expect(booleanFlag).toBeDefined();

      const formattedValue = component.formatValue({
        ...booleanFlag!,
        currentEnabled: false,
        currentValue: false,
      });

      expect(formattedValue).toBe('false');
    });

    it('should format json values', () => {
      const jsonFlag = flagStore.flags().find((f) => f.type === 'json');
      expect(jsonFlag).toBeDefined();

      const formattedValue = component.formatValue({
        ...jsonFlag!,
        currentEnabled: true,
        currentValue: { key: 'value' },
      });

      expect(formattedValue).toBe('{"key":"value"}');
    });

    it('should format string values', () => {
      const stringFlag = flagStore.flags().find((f) => f.type === 'string');
      expect(stringFlag).toBeDefined();

      const formattedValue = component.formatValue({
        ...stringFlag!,
        currentEnabled: true,
        currentValue: 'hello',
      });

      expect(formattedValue).toBe('hello');
    });

    it('should format number values', () => {
      const numberFlag = flagStore.flags().find((f) => f.type === 'number');
      expect(numberFlag).toBeDefined();

      const formattedValue = component.formatValue({
        ...numberFlag!,
        currentEnabled: true,
        currentValue: 42,
      });

      expect(formattedValue).toBe('42');
    });
  });
});
