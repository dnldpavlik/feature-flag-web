import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { Flag } from '@/app/features/flags/models/flag.model';
import { EnvironmentFlagValue } from '@/app/features/flags/models/flag-value.model';
import { FlagDetailComponent } from './flag-detail';

type FlagDetailInternals = FlagDetailComponent & {
  setDefaultValueFields(flag: Flag): void;
  environmentRows(): { id: string; enabled: boolean; value: Flag['defaultValue'] }[];
  flagId(): string;
};

type FlagStoreInternals = FlagStore & {
  _flags: { update: (updater: (flags: Flag[]) => Flag[]) => void };
};

describe('FlagDetail', () => {
  let fixture: ComponentFixture<FlagDetailComponent>;
  let store: FlagStore;
  let router: Router;
  let location: Location;

  const build = async (flagId?: string) => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [FlagDetailComponent],
      providers: [
        FlagStore,
        EnvironmentStore,
        provideRouter([]),
        {
          provide: Location,
          useValue: { back: jest.fn() },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(flagId ? { flagId } : {}),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FlagDetailComponent);
    store = TestBed.inject(FlagStore);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture.detectChanges();
  };

  it('should render flag details when flag exists', async () => {
    await build('flag_new_checkout');

    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading.nativeElement.textContent).toContain('New Checkout Experience');

    const envRows = fixture.debugElement.queryAll(By.css('.flag-detail__env-row'));
    expect(envRows.length).toBeGreaterThan(0);
  });

  it('should update flag metadata on save', async () => {
    await build('flag_new_checkout');

    fixture.componentInstance.name = 'Updated Flag';
    fixture.componentInstance.description = 'Updated description';
    fixture.componentInstance.tags = 'alpha, beta';

    fixture.componentInstance.saveDetails();

    const updated = store.getFlagById('flag_new_checkout');
    expect(updated?.name).toBe('Updated Flag');
    expect(updated?.description).toBe('Updated description');
    expect(updated?.tags).toEqual(['alpha', 'beta']);
  });

  it('should keep original name when blank input is saved', async () => {
    await build('flag_new_checkout');

    const original = store.getFlagById('flag_new_checkout');
    fixture.componentInstance.name = '  ';
    fixture.componentInstance.saveDetails();

    const updated = store.getFlagById('flag_new_checkout');
    expect(updated?.name).toBe(original?.name);
  });

  it('should update json default value when valid', async () => {
    await build('flag_checkout_guardrails');

    fixture.componentInstance.jsonValue = '{"limit": 5}';
    fixture.componentInstance.saveDetails();

    const updated = store.getFlagById('flag_checkout_guardrails');
    expect(updated?.defaultValue).toEqual({ limit: 5 });
    expect(fixture.componentInstance.jsonError()).toBeNull();
  });

  it('should initialize string default value', async () => {
    await build('flag_beta_theme');

    expect(fixture.componentInstance.stringValue).toBe('default');
  });

  it('should initialize json default value string', async () => {
    await build('flag_checkout_guardrails');

    const initial = store.getFlagById('flag_checkout_guardrails');
    expect(fixture.componentInstance.jsonValue).toBe(
      JSON.stringify(initial?.defaultValue ?? {}, null, 2),
    );
  });

  it('should set default values for all flag types', async () => {
    await build('flag_new_checkout');

    const booleanFlag = store.getFlagById('flag_new_checkout');
    const stringFlag = store.getFlagById('flag_beta_theme');
    const numberFlag = store.getFlagById('flag_search_boost');
    const jsonFlag = store.getFlagById('flag_checkout_guardrails');

    (fixture.componentInstance as FlagDetailInternals).setDefaultValueFields(booleanFlag as Flag);
    expect(fixture.componentInstance.booleanValue).toBe(false);

    (fixture.componentInstance as FlagDetailInternals).setDefaultValueFields(stringFlag as Flag);
    expect(fixture.componentInstance.stringValue).toBe('default');

    (fixture.componentInstance as FlagDetailInternals).setDefaultValueFields(numberFlag as Flag);
    expect(fixture.componentInstance.numberValue).toBe(1);

    (fixture.componentInstance as FlagDetailInternals).setDefaultValueFields(jsonFlag as Flag);
    expect(fixture.componentInstance.jsonValue).toBe(
      JSON.stringify(jsonFlag?.defaultValue ?? {}, null, 2),
    );
  });

  it('should fall back to defaults for missing default values', async () => {
    await build('flag_new_checkout');

    const fallbackString: Flag = {
      id: 'flag_missing_string',
      key: 'missing-string',
      name: 'Missing String',
      description: '',
      type: 'string',
      defaultValue: undefined as unknown as Flag['defaultValue'],
      tags: [],
      environmentValues: {} as Record<string, EnvironmentFlagValue>,
      createdAt: '',
      updatedAt: '',
    };

    const fallbackNumber: Flag = {
      ...fallbackString,
      id: 'flag_missing_number',
      key: 'missing-number',
      name: 'Missing Number',
      type: 'number',
    };

    const fallbackJson: Flag = {
      ...fallbackString,
      id: 'flag_missing_json',
      key: 'missing-json',
      name: 'Missing Json',
      type: 'json',
    };

    (fixture.componentInstance as FlagDetailInternals).setDefaultValueFields(fallbackString);
    expect(fixture.componentInstance.stringValue).toBe('');

    (fixture.componentInstance as FlagDetailInternals).setDefaultValueFields(fallbackNumber);
    expect(fixture.componentInstance.numberValue).toBe(0);

    (fixture.componentInstance as FlagDetailInternals).setDefaultValueFields(fallbackJson);
    expect(fixture.componentInstance.jsonValue).toBe('{}');
  });

  it('should update string default value', async () => {
    await build('flag_beta_theme');

    fixture.componentInstance.stringValue = 'new-default';
    fixture.componentInstance.saveDetails();

    const updated = store.getFlagById('flag_beta_theme');
    expect(updated?.defaultValue).toBe('new-default');
  });

  it('should update number default value', async () => {
    await build('flag_search_boost');

    fixture.componentInstance.numberValue = 9;
    fixture.componentInstance.saveDetails();

    const updated = store.getFlagById('flag_search_boost');
    expect(updated?.defaultValue).toBe(9);
  });

  it('should update boolean default value', async () => {
    await build('flag_new_checkout');

    fixture.componentInstance.booleanValue = true;
    fixture.componentInstance.saveDetails();

    const updated = store.getFlagById('flag_new_checkout');
    expect(updated?.defaultValue).toBe(true);
  });

  it('should not save when json is invalid', async () => {
    await build('flag_checkout_guardrails');

    const original = store.getFlagById('flag_checkout_guardrails');
    fixture.componentInstance.jsonValue = 'invalid json';
    fixture.componentInstance.saveDetails();

    const updated = store.getFlagById('flag_checkout_guardrails');
    expect(updated?.defaultValue).toEqual(original?.defaultValue);
    expect(fixture.componentInstance.jsonError()).toBe('Invalid JSON syntax');
  });

  it('should not accept array json default values', async () => {
    await build('flag_checkout_guardrails');

    fixture.componentInstance.jsonValue = '[1, 2, 3]';
    fixture.componentInstance.saveDetails();

    expect(fixture.componentInstance.jsonError()).toBe('JSON must be an object');
  });

  it('should show empty state when flag is missing', async () => {
    await build('missing_flag');

    const empty = fixture.debugElement.query(By.css('app-empty-state'));
    expect(empty).toBeTruthy();
  });

  it('should return an empty environment list when flag is missing', async () => {
    await build('missing_flag');

    const rows = (fixture.componentInstance as FlagDetailInternals).environmentRows();
    expect(rows).toEqual([]);
  });

  it('should toggle environment enabled state', async () => {
    await build('flag_new_checkout');

    const envId = 'env_development';
    fixture.componentInstance.toggleEnvironment(envId, false);

    const updated = store.getFlagById('flag_new_checkout');
    expect(updated?.environmentValues[envId].enabled).toBe(false);
  });

  it('should update environment value for boolean flag', async () => {
    await build('flag_new_checkout');

    const envId = 'env_development';
    fixture.componentInstance.updateEnvironmentValue(envId, 'false');

    const updated = store.getFlagById('flag_new_checkout');
    expect(updated?.environmentValues[envId].value).toBe(false);
  });

  it('should update environment value for string flag', async () => {
    await build('flag_beta_theme');

    const envId = 'env_development';
    fixture.componentInstance.updateEnvironmentValue(envId, 'updated');

    const updated = store.getFlagById('flag_beta_theme');
    expect(updated?.environmentValues[envId].value).toBe('updated');
  });

  it('should update environment value for number flag', async () => {
    await build('flag_search_boost');

    const envId = 'env_development';
    fixture.componentInstance.updateEnvironmentValue(envId, '4.2');

    const updated = store.getFlagById('flag_search_boost');
    expect(updated?.environmentValues[envId].value).toBe(4.2);
  });

  it('should update environment value for json flag', async () => {
    await build('flag_checkout_guardrails');

    const envId = 'env_development';
    fixture.componentInstance.updateEnvironmentValue(envId, '{"limit": 42}');

    const updated = store.getFlagById('flag_checkout_guardrails');
    expect(updated?.environmentValues[envId].value).toEqual({ limit: 42 });
  });

  it('should compute environment rows with fallback values', async () => {
    await build('flag_new_checkout');

    (store as FlagStoreInternals)._flags.update((flags: Flag[]) =>
      flags.map((flag) => {
        if (flag.id !== 'flag_new_checkout') return flag;
        const rest = { ...flag.environmentValues };
        delete rest.env_development;
        return { ...flag, environmentValues: rest };
      }),
    );

    const rows = (fixture.componentInstance as FlagDetailInternals).environmentRows();
    const row = rows.find((item) => item.id === 'env_development');
    expect(row?.enabled).toBe(false);
    expect(row?.value).toBe(false);
  });

  it('should ignore invalid number environment values', async () => {
    await build('flag_search_boost');

    const envId = 'env_development';
    const original = store.getFlagById('flag_search_boost');
    fixture.componentInstance.updateEnvironmentValue(envId, 'not-a-number');

    const updated = store.getFlagById('flag_search_boost');
    expect(updated?.environmentValues[envId].value).toBe(original?.environmentValues[envId].value);
  });

  it('should ignore invalid json environment values', async () => {
    await build('flag_checkout_guardrails');

    const envId = 'env_development';
    const original = store.getFlagById('flag_checkout_guardrails');
    fixture.componentInstance.updateEnvironmentValue(envId, 'not-json');

    const updated = store.getFlagById('flag_checkout_guardrails');
    expect(updated?.environmentValues[envId].value).toEqual(
      original?.environmentValues[envId].value,
    );
  });

  it('should skip updates when flag is missing', async () => {
    await build('missing_flag');

    const updateSpy = jest.spyOn(store, 'updateFlagDetails');
    const toggleSpy = jest.spyOn(store, 'toggleFlagInEnvironment');
    const envSpy = jest.spyOn(store, 'updateEnvironmentValue');

    fixture.componentInstance.saveDetails();
    fixture.componentInstance.toggleEnvironment('env_development', true);
    fixture.componentInstance.updateEnvironmentValue('env_development', 'true');

    expect(updateSpy).not.toHaveBeenCalled();
    expect(toggleSpy).not.toHaveBeenCalled();
    expect(envSpy).not.toHaveBeenCalled();
  });

  it('should default the flag id when the route param is missing', async () => {
    await build();

    expect((fixture.componentInstance as FlagDetailInternals).flagId()).toBe('');
  });

  it('should discard edits and navigate back on cancel', async () => {
    await build('flag_beta_theme');

    fixture.componentInstance.name = 'Changed Name';
    fixture.componentInstance.tags = 'one, two';
    fixture.componentInstance.stringValue = 'temporary';

    fixture.componentInstance.cancelChanges();

    const current = store.getFlagById('flag_beta_theme');
    expect(fixture.componentInstance.name).toBe(current?.name);
    expect(fixture.componentInstance.tags).toBe(current?.tags.join(', '));
    expect(fixture.componentInstance.stringValue).toBe(current?.defaultValue);
    expect(location.back).toHaveBeenCalled();
  });

  it('should navigate back on cancel when flag is missing', async () => {
    await build('missing_flag');

    fixture.componentInstance.cancelChanges();

    expect(location.back).toHaveBeenCalled();
  });

  it('should navigate back to list', async () => {
    await build('flag_new_checkout');
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.backToList();

    expect(navigateSpy).toHaveBeenCalledWith(['/flags']);
  });

  describe('flag deletion', () => {
    it('should show delete button when more than one flag exists', async () => {
      await build('flag_new_checkout');

      const deleteBtn = fixture.debugElement.query(By.css('.flag-detail__delete-btn'));
      expect(deleteBtn).toBeTruthy();
    });

    it('should hide delete button when only one flag exists', async () => {
      await build('flag_new_checkout');

      // Delete all but one flag
      const flags = store.flags();
      for (let i = 0; i < flags.length - 1; i++) {
        store.deleteFlag(flags[i].id);
      }
      fixture.detectChanges();

      const deleteBtn = fixture.debugElement.query(By.css('.flag-detail__delete-btn'));
      expect(deleteBtn).toBeFalsy();
    });

    it('should delete flag and navigate to /flags', async () => {
      await build('flag_new_checkout');

      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      const beforeCount = store.flags().length;

      fixture.componentInstance.deleteFlag();

      expect(store.flags().length).toBe(beforeCount - 1);
      expect(store.getFlagById('flag_new_checkout')).toBeUndefined();
      expect(navigateSpy).toHaveBeenCalledWith(['/flags']);
    });

    it('should not delete when flag is null', async () => {
      await build('missing_flag');

      const deleteSpy = jest.spyOn(store, 'deleteFlag');
      fixture.componentInstance.deleteFlag();

      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });

  it('should format json values for display', async () => {
    await build('flag_new_checkout');

    const formatted = fixture.componentInstance.formatJsonValue({ ready: true });
    expect(formatted).toBe(JSON.stringify({ ready: true }));
  });

  it('should get description value', async () => {
    await build('flag_new_checkout');

    fixture.componentInstance.description = 'Test description';
    expect(fixture.componentInstance.description).toBe('Test description');
  });

  it('should toggle environment via event handler', async () => {
    await build('flag_new_checkout');

    const envId = 'env_development';
    const event = { target: { checked: false } } as unknown as Event;
    fixture.componentInstance.onEnvironmentToggle(envId, event);

    const updated = store.getFlagById('flag_new_checkout');
    expect(updated?.environmentValues[envId].enabled).toBe(false);
  });

  it('should update environment value via event handler', async () => {
    await build('flag_beta_theme');

    const envId = 'env_development';
    const event = { target: { value: 'new-value' } } as unknown as Event;
    fixture.componentInstance.onEnvironmentValueChange(envId, event);

    const updated = store.getFlagById('flag_beta_theme');
    expect(updated?.environmentValues[envId].value).toBe('new-value');
  });
});
