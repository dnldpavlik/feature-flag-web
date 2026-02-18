/**
 * Detail Component Test Helpers
 *
 * Simplifies TestBed setup for detail components that use route parameters.
 */

import { Location } from '@angular/common';
import { EnvironmentProviders, Type, Provider } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';

import { injectService } from './component.helpers';

/**
 * Configuration for detail component test setup
 */
export interface DetailComponentConfig<T> {
  component: Type<T>;
  paramName: string;
  providers?: (Provider | EnvironmentProviders)[];
}

/**
 * Result of detail component setup
 */
export interface DetailComponentTestContext<T> {
  fixture: ComponentFixture<T>;
  component: T;
  router: Router;
  location: Location;
  build: (paramValue?: string) => Promise<void>;
}

/**
 * Mock Location service for testing navigation back behavior
 */
export function createMockLocation(): Location {
  return { back: jest.fn() } as unknown as Location;
}

/**
 * Create ActivatedRoute mock with optional parameter value
 */
export function createMockActivatedRoute(
  paramName: string,
  paramValue?: string,
): Partial<ActivatedRoute> {
  return {
    snapshot: {
      paramMap: convertToParamMap(paramValue ? { [paramName]: paramValue } : {}),
    },
  } as Partial<ActivatedRoute>;
}

/**
 * Setup a detail component test with route parameter support.
 *
 * Returns a build function that can be called with different parameter values.
 *
 * @example
 * ```typescript
 * const { build, router, location } = setupDetailComponentTest({
 *   component: FlagDetailComponent,
 *   paramName: 'flagId',
 *   providers: [FlagStore, EnvironmentStore, ProjectStore],
 * });
 *
 * // In tests:
 * it('should render flag details', async () => {
 *   const { fixture, component } = await build('flag_123');
 *   expectHeading(fixture, 'My Flag');
 * });
 * ```
 */
export function setupDetailComponentTest<T>(
  config: DetailComponentConfig<T>,
): DetailComponentTestContext<T> {
  const { component: ComponentClass, paramName, providers = [] } = config;

  let fixture: ComponentFixture<T>;
  let component: T;
  let router: Router;
  let location: Location;

  const build = async (paramValue?: string): Promise<void> => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ComponentClass],
      providers: [
        ...providers,
        provideRouter([]),
        {
          provide: Location,
          useValue: createMockLocation(),
        },
        {
          provide: ActivatedRoute,
          useValue: createMockActivatedRoute(paramName, paramValue),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentClass);
    component = fixture.componentInstance;
    router = injectService(Router);
    location = injectService(Location);
    fixture.detectChanges();
  };

  // Return a context object with getters for lazy access
  return {
    get fixture() {
      return fixture;
    },
    get component() {
      return component;
    },
    get router() {
      return router;
    },
    get location() {
      return location;
    },
    build,
  };
}
