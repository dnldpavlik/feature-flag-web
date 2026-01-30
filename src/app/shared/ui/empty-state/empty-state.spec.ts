import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyStateComponent } from './empty-state';
import { query, expectExists, getText, expectHasClass, getComponent } from '@/app/testing';

describe('EmptyState', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  // Note: Cannot use createComponentFixture here because EmptyStateComponent
  // has required inputs that must be set before the first detectChanges()
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = getComponent(fixture);
  });

  it('should create', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('message', 'Test message');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render the container with empty-state class', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();

      expectExists(fixture, '.empty-state');
    });

    it('should render the title', () => {
      fixture.componentRef.setInput('title', 'No items found');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();

      expectExists(fixture, '.empty-state__title');
      expect(getText(fixture, '.empty-state__title')).toContain('No items found');
    });

    it('should render the message', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Create your first item to get started.');
      fixture.detectChanges();

      expectExists(fixture, '.empty-state__message');
      expect(getText(fixture, '.empty-state__message')).toContain(
        'Create your first item to get started.',
      );
    });

    it('should use h3 for the title by default', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();

      expectExists(fixture, 'h3.empty-state__title');
    });
  });

  describe('icon slot', () => {
    it('should render icon slot container', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();

      expectExists(fixture, '.empty-state__icon');
    });
  });

  describe('action slot', () => {
    it('should render action slot container', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();

      expectExists(fixture, '.empty-state__action');
    });
  });

  describe('size variants', () => {
    it('should default to medium size', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();

      expectHasClass(fixture, '.empty-state', 'empty-state--md');
    });

    it('should apply small size class', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();

      expectHasClass(fixture, '.empty-state', 'empty-state--sm');
    });

    it('should apply large size class', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();

      expectHasClass(fixture, '.empty-state', 'empty-state--lg');
    });
  });
});

// Test with content projection using a wrapper component
@Component({
  selector: 'app-test-host',
  template: `
    <app-empty-state title="No flags" message="Create a flag">
      <svg empty-state-icon width="48" height="48"></svg>
      <button empty-state-action>Create</button>
    </app-empty-state>
  `,
  imports: [EmptyStateComponent],
})
class TestHostComponent {}

describe('EmptyState with content projection', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should project icon content', () => {
    expectExists(fixture, '.empty-state__icon svg');
    const icon = query(fixture, '.empty-state__icon svg');
    expect(icon?.nativeElement.getAttribute('width')).toBe('48');
  });

  it('should project action content', () => {
    expectExists(fixture, '.empty-state__action button');
    expect(getText(fixture, '.empty-state__action button')).toContain('Create');
  });
});
