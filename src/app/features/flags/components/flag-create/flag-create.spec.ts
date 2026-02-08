import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { ProjectStore } from '@/app/shared/store/project.store';
import { FlagStore } from '@/app/features/flags/store/flag.store';
import { FlagCreateComponent } from './flag-create';
import { MOCK_API_PROVIDERS } from '@/app/testing';

describe('FlagCreate', () => {
  let fixture: ComponentFixture<FlagCreateComponent>;
  let component: FlagCreateComponent;
  let store: { addFlag: jest.Mock };
  let projectStore: ProjectStore;
  let router: Router;

  beforeEach(async () => {
    store = { addFlag: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [FlagCreateComponent],
      providers: [
        provideRouter([]),
        { provide: FlagStore, useValue: store },
        EnvironmentStore,
        ProjectStore,
        ...MOCK_API_PROVIDERS,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FlagCreateComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    projectStore = TestBed.inject(ProjectStore);
    const environmentStore = TestBed.inject(EnvironmentStore);
    await projectStore.loadProjects();
    await environmentStore.loadEnvironments();
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
          projectId: 'proj_default',
          key: 'new-flag',
          name: 'New Flag',
          resourceName: 'New Flag',
          description: 'Description',
          type: 'boolean',
          defaultValue: true,
          tags: ['core', 'beta'],
        },
        expect.any(Object),
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
        expect.any(Object),
      );
    });

    it('should use the selected project when creating a flag', () => {
      jest.spyOn(router, 'navigate').mockResolvedValue(true);
      projectStore.selectProject('proj_growth');
      component.form.patchValue({
        name: 'Growth Flag',
        type: 'boolean',
      });

      component.createFlag();

      expect(store.addFlag).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: 'proj_growth' }),
        expect.any(Object),
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
        expect.any(Object),
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
        expect.any(Object),
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
        expect.any(Object),
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
      expect.any(Object),
    );
  });

  it('should navigate back when cancel is clicked', () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/flags']);
  });

  it('should render flag value input component', () => {
    fixture.detectChanges();

    const valueInput = fixture.debugElement.query(By.css('app-flag-value-input'));
    expect(valueInput).toBeTruthy();
  });

  it('should show checkbox for boolean type', () => {
    component.form.controls.type.setValue('boolean');
    fixture.detectChanges();

    // Boolean type shows checkbox inside the value input component
    const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]'));
    expect(checkbox).toBeTruthy();
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

      expect(store.addFlag).toHaveBeenCalledWith(expect.any(Object), {
        env_development: true,
        env_production: true,
      });
    });

    it('should toggle environment via event handler', () => {
      const mockEvent = { target: { checked: true } } as unknown as Event;
      component.onEnvironmentToggle('env_development', mockEvent);

      const envs = component.environmentsWithEnabled();
      const devEnv = envs.find((e) => e.id === 'env_development');
      expect(devEnv?.enabled).toBe(true);
    });
  });

  describe('type change', () => {
    it('should update type via onTypeChange', () => {
      component.onTypeChange('string');
      expect(component.form.controls.type.value).toBe('string');

      component.onTypeChange('number');
      expect(component.form.controls.type.value).toBe('number');
    });
  });
});
