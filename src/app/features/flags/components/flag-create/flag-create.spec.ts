import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { FlagCreateComponent } from './flag-create';
import { FlagStore } from '../../store/flag.store';
import { EnvironmentStore } from '@/app/shared/store/environment.store';

describe('FlagCreate', () => {
  let fixture: ComponentFixture<FlagCreateComponent>;
  let component: FlagCreateComponent;
  let store: { addFlag: jest.Mock };
  let router: Router;

  beforeEach(async () => {
    store = { addFlag: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [FlagCreateComponent],
      providers: [
        provideRouter([]),
        { provide: FlagStore, useValue: store },
        EnvironmentStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FlagCreateComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should render the create form', () => {
    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading.nativeElement.textContent).toContain('Create Feature Flag');
  });

  describe('boolean flag creation', () => {
    it('should add a boolean flag with default value', () => {
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.form.patchValue({
        name: 'New Flag',
        key: 'new-flag',
        description: 'Description',
        type: 'boolean',
        booleanValue: true,
        tags: 'core, beta',
      });

      component.createFlag();

      expect(store.addFlag).toHaveBeenCalledWith(
        {
          key: 'new-flag',
          name: 'New Flag',
          description: 'Description',
          type: 'boolean',
          defaultValue: true,
          tags: ['core', 'beta'],
        },
        expect.any(Object)
      );
      expect(navigateSpy).toHaveBeenCalledWith(['/flags']);
    });

    it('should default boolean value to false', () => {
      jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.form.patchValue({
        name: 'Test Flag',
        type: 'boolean',
      });

      component.createFlag();

      expect(store.addFlag).toHaveBeenCalledWith(
        expect.objectContaining({ defaultValue: false }),
        expect.any(Object)
      );
    });
  });

  describe('string flag creation', () => {
    it('should add a string flag with default value', () => {
      jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.form.patchValue({
        name: 'String Flag',
        type: 'string',
        stringValue: 'hello world',
      });

      component.createFlag();

      expect(store.addFlag).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'string',
          defaultValue: 'hello world',
        }),
        expect.any(Object)
      );
    });
  });

  describe('number flag creation', () => {
    it('should add a number flag with default value', () => {
      jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.form.patchValue({
        name: 'Number Flag',
        type: 'number',
        numberValue: 42,
      });

      component.createFlag();

      expect(store.addFlag).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'number',
          defaultValue: 42,
        }),
        expect.any(Object)
      );
    });
  });

  describe('json flag creation', () => {
    it('should add a json flag with default value', () => {
      jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.form.patchValue({
        name: 'JSON Flag',
        type: 'json',
        jsonValue: '{"key": "value"}',
      });

      component.createFlag();

      expect(store.addFlag).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'json',
          defaultValue: { key: 'value' },
        }),
        expect.any(Object)
      );
    });

    it('should not submit with invalid json', () => {
      jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.form.patchValue({
        name: 'JSON Flag',
        type: 'json',
        jsonValue: 'invalid json',
      });

      component.createFlag();

      expect(store.addFlag).not.toHaveBeenCalled();
      expect(component.jsonError()).toBe('Invalid JSON syntax');
    });

    it('should not accept array as json', () => {
      jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.form.patchValue({
        name: 'JSON Flag',
        type: 'json',
        jsonValue: '[1, 2, 3]',
      });

      component.createFlag();

      expect(store.addFlag).not.toHaveBeenCalled();
      expect(component.jsonError()).toBe('JSON must be an object');
    });

    it('should validate json on blur', () => {
      component.form.controls.jsonValue.setValue('not valid');
      component.validateJson();
      expect(component.jsonError()).toBe('Invalid JSON syntax');

      component.form.controls.jsonValue.setValue('{"valid": true}');
      component.validateJson();
      expect(component.jsonError()).toBeNull();
    });

    it('should reject array in validateJson', () => {
      component.form.controls.jsonValue.setValue('[1, 2, 3]');
      component.validateJson();
      expect(component.jsonError()).toBe('JSON must be an object');
    });

    it('should reject null in validateJson', () => {
      component.form.controls.jsonValue.setValue('null');
      component.validateJson();
      expect(component.jsonError()).toBe('JSON must be an object');
    });
  });

  it('should not submit when name is missing', () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.patchValue({
      name: ' ',
      key: '',
    });

    component.createFlag();

    expect(store.addFlag).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should derive a key when none is provided', () => {
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.form.patchValue({
      name: 'My Flag',
      key: '',
    });

    component.createFlag();

    expect(store.addFlag).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'my-flag' }),
      expect.any(Object)
    );
  });

  it('should navigate back when cancel is clicked', () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/flags']);
  });

  it('should fall back to default handling for unknown type', () => {
    component.form.controls.type.setValue('unknown' as 'boolean');

    const result = (component as unknown as { getDefaultValue: () => unknown }).getDefaultValue();

    expect(result).toBeUndefined();
  });

  it('should show default value input based on type', () => {
    component.form.controls.type.setValue('boolean');
    fixture.detectChanges();

    const booleanInput = fixture.debugElement.query(By.css('input[formControlName="booleanValue"]'));
    expect(booleanInput).toBeTruthy();

    component.form.controls.type.setValue('string');
    fixture.detectChanges();

    const stringInput = fixture.debugElement.query(By.css('input[formControlName="stringValue"]'));
    expect(stringInput).toBeTruthy();
  });

  describe('per-environment toggles', () => {
    it('should show environment toggles', () => {
      fixture.detectChanges();

      const envToggles = fixture.debugElement.queryAll(By.css('.flag-create__env-toggle'));
      expect(envToggles.length).toBe(3);
    });

    it('should toggle environment enabled state', () => {
      component.toggleEnvironment('env_development', true);
      component.toggleEnvironment('env_staging', true);

      const envs = component.environmentsWithEnabled();
      const devEnv = envs.find((e) => e.id === 'env_development');
      const stagingEnv = envs.find((e) => e.id === 'env_staging');
      const prodEnv = envs.find((e) => e.id === 'env_production');

      expect(devEnv?.enabled).toBe(true);
      expect(stagingEnv?.enabled).toBe(true);
      expect(prodEnv?.enabled).toBe(false);
    });

    it('should pass enabled environments to store', () => {
      jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.form.controls.name.setValue('Test Flag');
      component.toggleEnvironment('env_development', true);
      component.toggleEnvironment('env_production', true);

      component.createFlag();

      expect(store.addFlag).toHaveBeenCalledWith(
        expect.any(Object),
        { env_development: true, env_production: true }
      );
    });
  });
});
