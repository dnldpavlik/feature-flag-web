import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EmptyStateComponent } from './empty-state';

describe('EmptyState', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
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

      const container = fixture.debugElement.query(By.css('.empty-state'));
      expect(container).toBeTruthy();
    });

    it('should render the title', () => {
      fixture.componentRef.setInput('title', 'No items found');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();

      const title = fixture.debugElement.query(By.css('.empty-state__title'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent).toContain('No items found');
    });

    it('should render the message', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Create your first item to get started.');
      fixture.detectChanges();

      const message = fixture.debugElement.query(By.css('.empty-state__message'));
      expect(message).toBeTruthy();
      expect(message.nativeElement.textContent).toContain('Create your first item to get started.');
    });

    it('should use h3 for the title by default', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();

      const title = fixture.debugElement.query(By.css('h3.empty-state__title'));
      expect(title).toBeTruthy();
    });
  });

  describe('icon slot', () => {
    it('should render icon slot container', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();

      const iconSlot = fixture.debugElement.query(By.css('.empty-state__icon'));
      expect(iconSlot).toBeTruthy();
    });
  });

  describe('action slot', () => {
    it('should render action slot container', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();

      const actionSlot = fixture.debugElement.query(By.css('.empty-state__action'));
      expect(actionSlot).toBeTruthy();
    });
  });

  describe('size variants', () => {
    it('should default to medium size', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.empty-state'));
      expect(container.nativeElement.classList.contains('empty-state--md')).toBe(true);
    });

    it('should apply small size class', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.empty-state'));
      expect(container.nativeElement.classList.contains('empty-state--sm')).toBe(true);
    });

    it('should apply large size class', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.componentRef.setInput('message', 'Test message');
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.empty-state'));
      expect(container.nativeElement.classList.contains('empty-state--lg')).toBe(true);
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
    const icon = fixture.debugElement.query(By.css('.empty-state__icon svg'));
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.getAttribute('width')).toBe('48');
  });

  it('should project action content', () => {
    const action = fixture.debugElement.query(By.css('.empty-state__action button'));
    expect(action).toBeTruthy();
    expect(action.nativeElement.textContent).toContain('Create');
  });
});
