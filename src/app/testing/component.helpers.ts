/**
 * Component Test Setup Helpers
 *
 * Simplifies common TestBed configuration patterns for component tests.
 */

import { Type, Provider } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Routes } from '@angular/router';

/**
 * Common test configuration options
 */
interface ComponentTestConfig<T> {
  component: Type<T>;
  imports?: Type<unknown>[];
  providers?: Provider[];
  routes?: Routes;
}

/**
 * Configure TestBed with common defaults for component tests
 */
export async function setupComponentTest<T>(
  config: ComponentTestConfig<T>,
): Promise<ComponentFixture<T>> {
  const { component, imports = [], providers = [], routes = [] } = config;

  await TestBed.configureTestingModule({
    imports: [component, ...imports],
    providers: [...providers, provideRouter(routes)],
  }).compileComponents();

  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}

/**
 * Create a minimal TestBed config for standalone component
 */
export async function createComponentFixture<T>(
  component: Type<T>,
  providers: Provider[] = [],
): Promise<ComponentFixture<T>> {
  return setupComponentTest({ component, providers });
}

/**
 * Get component instance from fixture
 */
export function getComponent<T>(fixture: ComponentFixture<T>): T {
  return fixture.componentInstance;
}

/**
 * Inject service from TestBed
 */
export function injectService<T>(token: Type<T>): T {
  return TestBed.inject(token);
}

/**
 * Interface for components with a form property
 */
interface ComponentWithForm {
  form: { get: (field: string) => { value: unknown; setValue: (v: unknown) => void } | null };
}

/**
 * Set a form field value on a component.
 * Works with components that have a `form` property (FormGroup).
 *
 * @example
 * ```typescript
 * setFormField(component, 'name', 'Test Project');
 * setFormField(component, 'key', 'test-key');
 * ```
 */
export function setFormField<T extends ComponentWithForm>(
  component: T,
  field: string,
  value: unknown,
): void {
  component.form.get(field)?.setValue(value);
}

/**
 * Get a form field value from a component.
 *
 * @example
 * ```typescript
 * const name = getFormField(component, 'name');
 * ```
 */
export function getFormField<T extends ComponentWithForm>(component: T, field: string): unknown {
  return component.form.get(field)?.value;
}

/**
 * Set multiple form field values at once.
 *
 * @example
 * ```typescript
 * setFormFields(component, { name: 'Test', key: 'test-key', description: 'desc' });
 * ```
 */
export function setFormFields<T extends ComponentWithForm>(
  component: T,
  values: Record<string, unknown>,
): void {
  for (const [field, value] of Object.entries(values)) {
    setFormField(component, field, value);
  }
}
