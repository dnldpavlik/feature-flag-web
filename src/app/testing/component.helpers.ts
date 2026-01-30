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
export interface ComponentTestConfig<T> {
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
 * Trigger change detection and wait for stability
 */
export async function detectChangesAndWait<T>(fixture: ComponentFixture<T>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
}

/**
 * Trigger input event on native element
 */
export function dispatchInputEvent(element: HTMLInputElement, value: string): void {
  element.value = value;
  element.dispatchEvent(new Event('input'));
}

/**
 * Trigger change event on native element
 */
export function dispatchChangeEvent(element: HTMLElement): void {
  element.dispatchEvent(new Event('change'));
}

/**
 * Trigger blur event on native element
 */
export function dispatchBlurEvent(element: HTMLElement): void {
  element.dispatchEvent(new Event('blur'));
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
