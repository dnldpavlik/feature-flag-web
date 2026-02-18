import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import {
  createMockLocation,
  createMockActivatedRoute,
  setupDetailComponentTest,
} from './detail-component.helpers';

@Component({
  selector: 'app-test-detail',
  template: `<h1>{{ title() }}</h1>`,
})
class TestDetailComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = signal(this.route.snapshot.paramMap.get('itemId') ?? 'No ID');
}

describe('detail-component.helpers', () => {
  describe('createMockLocation', () => {
    it('should create a mock with back function', () => {
      const location = createMockLocation();
      expect(location.back).toBeDefined();
      expect(typeof location.back).toBe('function');
    });

    it('should track back calls', () => {
      const location = createMockLocation();
      location.back();
      expect(location.back).toHaveBeenCalled();
    });
  });

  describe('createMockActivatedRoute', () => {
    it('should create route with parameter value', () => {
      const route = createMockActivatedRoute('itemId', 'item_123');
      expect(route.snapshot?.paramMap.get('itemId')).toBe('item_123');
    });

    it('should create route with empty params when no value provided', () => {
      const route = createMockActivatedRoute('itemId');
      expect(route.snapshot?.paramMap.get('itemId')).toBeNull();
    });
  });

  describe('setupDetailComponentTest', () => {
    it('should create build function', () => {
      const context = setupDetailComponentTest({
        component: TestDetailComponent,
        paramName: 'itemId',
        providers: [provideRouter([])],
      });

      expect(context.build).toBeDefined();
      expect(typeof context.build).toBe('function');
    });

    it('should build component with parameter', async () => {
      const context = setupDetailComponentTest({
        component: TestDetailComponent,
        paramName: 'itemId',
        providers: [],
      });

      await context.build('item_456');

      expect(context.fixture).toBeDefined();
      expect(context.component).toBeDefined();
      expect(context.component.title()).toBe('item_456');
    });

    it('should build component without parameter', async () => {
      const context = setupDetailComponentTest({
        component: TestDetailComponent,
        paramName: 'itemId',
        providers: [],
      });

      await context.build();

      expect(context.component.title()).toBe('No ID');
    });

    it('should provide router and location mocks', async () => {
      const context = setupDetailComponentTest({
        component: TestDetailComponent,
        paramName: 'itemId',
        providers: [],
      });

      await context.build('item_789');

      expect(context.router).toBeDefined();
      expect(context.location).toBeDefined();
      expect(context.location.back).toBeDefined();
    });

    it('should reset TestBed between builds', async () => {
      const context = setupDetailComponentTest({
        component: TestDetailComponent,
        paramName: 'itemId',
        providers: [],
      });

      await context.build('first');
      expect(context.component.title()).toBe('first');

      await context.build('second');
      expect(context.component.title()).toBe('second');
    });

    it('should include custom providers', async () => {
      const customService = { getValue: () => 'custom' };

      const context = setupDetailComponentTest({
        component: TestDetailComponent,
        paramName: 'itemId',
        providers: [{ provide: 'CUSTOM_TOKEN', useValue: customService }],
      });

      await context.build('test');

      const injected = TestBed.inject('CUSTOM_TOKEN' as never);
      expect(injected).toBe(customService);
    });
  });
});
