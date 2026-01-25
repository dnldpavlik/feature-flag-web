import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { FlagStore } from '@/app/features/flags/store/flag.store';
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

    const flags = (fixture.componentInstance as EnvironmentDetailComponent & {
      flags: () => unknown[];
    }).flags();
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
});
