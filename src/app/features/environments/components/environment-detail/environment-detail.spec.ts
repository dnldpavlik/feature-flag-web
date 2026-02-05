import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { MOCK_API_PROVIDERS } from '@/app/testing';
import { EnvironmentDetailComponent } from './environment-detail';

describe('EnvironmentDetail', () => {
  let fixture: ComponentFixture<EnvironmentDetailComponent>;
  let store: EnvironmentStore;
  let flagStore: FlagStore;
  let router: Router;

  const build = async (envId?: string) => {
    const paramMap$ = new BehaviorSubject(convertToParamMap(envId ? { envId } : {}));
    await TestBed.configureTestingModule({
      imports: [EnvironmentDetailComponent],
      providers: [
        EnvironmentStore,
        FlagStore,
        ...MOCK_API_PROVIDERS,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: paramMap$.value,
            },
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EnvironmentDetailComponent);
    store = TestBed.inject(EnvironmentStore);
    flagStore = TestBed.inject(FlagStore);
    router = TestBed.inject(Router);
    await store.loadEnvironments();
    fixture.detectChanges();

    return { paramMap$ };
  };

  it('should render environment details', async () => {
    await build('env_staging');

    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading.nativeElement.textContent).toContain('Staging');
  });

  it('should render flags for the environment', async () => {
    await build('env_staging');

    const rows = fixture.debugElement.queryAll(By.css('.environment-detail__row--data'));
    expect(rows.length).toBe(flagStore.flags().length);
  });

  it('should select the environment', async () => {
    await build('env_staging');
    const selectSpy = jest.spyOn(store, 'selectEnvironment');

    fixture.componentInstance.selectEnvironment();

    expect(selectSpy).toHaveBeenCalledWith('env_staging');
  });

  it('should make the environment default', async () => {
    await build('env_staging');
    const defaultSpy = jest.spyOn(store, 'setDefaultEnvironment');

    fixture.componentInstance.makeDefault();

    expect(defaultSpy).toHaveBeenCalledWith('env_staging');
  });

  it('should ignore actions when environment is missing', async () => {
    await build('missing_env');
    const selectSpy = jest.spyOn(store, 'selectEnvironment');
    const defaultSpy = jest.spyOn(store, 'setDefaultEnvironment');

    fixture.componentInstance.selectEnvironment();
    fixture.componentInstance.makeDefault();

    expect(selectSpy).not.toHaveBeenCalled();
    expect(defaultSpy).not.toHaveBeenCalled();
  });

  it('should navigate back to list', async () => {
    await build('env_staging');
    const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.backToList();

    expect(navSpy).toHaveBeenCalledWith(['/environments']);
  });

  it('should show empty state when env is missing', async () => {
    await build('missing_env');

    const empty = fixture.debugElement.query(By.css('app-empty-state'));
    expect(empty).toBeTruthy();
  });

  it('should treat missing route param as empty id', async () => {
    await build();

    const empty = fixture.debugElement.query(By.css('app-empty-state'));
    expect(empty).toBeTruthy();

    const flags = (
      fixture.componentInstance as EnvironmentDetailComponent & {
        flags: () => unknown[];
      }
    ).flags();
    expect(flags).toEqual([]);
  });

  it('should update when route param changes', async () => {
    const { paramMap$ } = await build('env_staging');

    paramMap$.next(convertToParamMap({ envId: 'env_production' }));
    fixture.detectChanges();

    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading.nativeElement.textContent).toContain('Production');
  });

  it('should format flag values for display', async () => {
    await build('env_staging');

    expect(fixture.componentInstance.formatValue(true)).toBe('true');
    expect(fixture.componentInstance.formatValue({ key: 'value' })).toBe('{"key":"value"}');
    expect(fixture.componentInstance.formatValue('alpha')).toBe('alpha');
  });

  describe('inline editing', () => {
    const clickButton = (label: string) => {
      const buttons = fixture.debugElement.queryAll(By.css('app-button, button'));
      const target = buttons.find((b) => b.nativeElement.textContent.trim().includes(label));
      target?.triggerEventHandler('click', null);
      target?.nativeElement.click?.();
      fixture.detectChanges();
    };

    it('should show Edit button in detail view', async () => {
      await build('env_staging');

      const buttons = fixture.debugElement.queryAll(By.css('app-button'));
      const editBtn = buttons.find((b) => b.nativeElement.textContent.trim().includes('Edit'));
      expect(editBtn).toBeTruthy();
    });

    it('should enter edit mode when Edit is clicked', async () => {
      await build('env_staging');
      clickButton('Edit');

      const editForm = fixture.debugElement.query(By.css('.environment-detail__edit-form'));
      expect(editForm).toBeTruthy();
    });

    it('should pre-fill edit form with current values', async () => {
      await build('env_staging');
      clickButton('Edit');

      const nameInput = fixture.debugElement.query(By.css('.environment-detail__name-input'));
      const keyInput = fixture.debugElement.query(By.css('.environment-detail__key-input'));
      const colorInput = fixture.debugElement.query(By.css('.environment-detail__color-input'));
      expect(nameInput.nativeElement.value).toBe('Staging');
      expect(keyInput.nativeElement.value).toBe('staging');
      expect(colorInput.nativeElement.value).toBe('#F59E0B');
    });

    it('should save updates and exit edit mode', async () => {
      await build('env_staging');
      clickButton('Edit');

      const nameInput = fixture.debugElement.query(By.css('.environment-detail__name-input'));
      nameInput.nativeElement.value = 'QA Staging';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await fixture.componentInstance.saveEdit();
      fixture.detectChanges();

      const env = store.getEnvironmentById('env_staging');
      expect(env?.name).toBe('QA Staging');

      const editForm = fixture.debugElement.query(By.css('.environment-detail__edit-form'));
      expect(editForm).toBeFalsy();
    });

    it('should cancel edit and discard changes', async () => {
      await build('env_staging');
      clickButton('Edit');

      const nameInput = fixture.debugElement.query(By.css('.environment-detail__name-input'));
      nameInput.nativeElement.value = 'Changed';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      clickButton('Cancel');

      const env = store.getEnvironmentById('env_staging');
      expect(env?.name).toBe('Staging');

      const editForm = fixture.debugElement.query(By.css('.environment-detail__edit-form'));
      expect(editForm).toBeFalsy();
    });

    it('should fall back to original values when name/key are blank', async () => {
      await build('env_staging');
      clickButton('Edit');

      const nameInput = fixture.debugElement.query(By.css('.environment-detail__name-input'));
      nameInput.nativeElement.value = '   ';
      nameInput.nativeElement.dispatchEvent(new Event('input'));

      const keyInput = fixture.debugElement.query(By.css('.environment-detail__key-input'));
      keyInput.nativeElement.value = '   ';
      keyInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      clickButton('Save Changes');

      const env = store.getEnvironmentById('env_staging');
      expect(env?.name).toBe('Staging');
      expect(env?.key).toBe('staging');
    });

    it('should save updated color', async () => {
      await build('env_staging');
      clickButton('Edit');

      const colorInput = fixture.debugElement.query(By.css('.environment-detail__color-input'));
      colorInput.nativeElement.value = '#8B5CF6';
      colorInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await fixture.componentInstance.saveEdit();
      fixture.detectChanges();

      const env = store.getEnvironmentById('env_staging');
      expect(env?.color).toBe('#8B5CF6');
    });

    it('should no-op enterEditMode when environment is null', async () => {
      await build('missing_env');

      fixture.componentInstance.enterEditMode();

      expect(fixture.componentInstance.isEditing()).toBe(false);
    });

    it('should no-op saveEdit when environment is null', async () => {
      await build('missing_env');
      const updateSpy = jest.spyOn(store, 'updateEnvironment');

      fixture.componentInstance.saveEdit();

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should fall back to original color when color is blank', async () => {
      await build('env_staging');
      const originalColor = store.getEnvironmentById('env_staging')?.color;
      clickButton('Edit');

      const colorInput = fixture.debugElement.query(By.css('.environment-detail__color-input'));
      colorInput.nativeElement.value = '   ';
      colorInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      clickButton('Save Changes');

      const env = store.getEnvironmentById('env_staging');
      expect(env?.color).toBe(originalColor);
    });
  });
});
