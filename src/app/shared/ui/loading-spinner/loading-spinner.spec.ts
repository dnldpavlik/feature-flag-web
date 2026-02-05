import { ComponentFixture } from '@angular/core/testing';

import { createComponentFixture, getComponent } from '@/app/testing';
import { query, getText } from '@/app/testing';
import { LoadingSpinnerComponent } from './loading-spinner';

describe('LoadingSpinnerComponent', () => {
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    fixture = await createComponentFixture(LoadingSpinnerComponent);
  });

  it('should create', () => {
    expect(getComponent(fixture)).toBeTruthy();
  });

  it('should display default label', () => {
    fixture.detectChanges();
    expect(getText(fixture, '.spinner__label')).toBe('Loading...');
  });

  it('should display custom label', () => {
    fixture.componentRef.setInput('label', 'Fetching data...');
    fixture.detectChanges();
    expect(getText(fixture, '.spinner__label')).toBe('Fetching data...');
  });

  it('should apply default md size', () => {
    fixture.detectChanges();
    const spinner = query(fixture, '.spinner');
    expect(spinner?.nativeElement.classList).toContain('spinner--md');
  });

  it('should apply sm size', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    const spinner = query(fixture, '.spinner');
    expect(spinner?.nativeElement.classList).toContain('spinner--sm');
  });

  it('should apply lg size', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const spinner = query(fixture, '.spinner');
    expect(spinner?.nativeElement.classList).toContain('spinner--lg');
  });

  it('should have role=status for accessibility', () => {
    fixture.detectChanges();
    const spinner = query(fixture, '.spinner');
    expect(spinner?.nativeElement.getAttribute('role')).toBe('status');
  });

  it('should hide circle from screen readers', () => {
    fixture.detectChanges();
    const circle = query(fixture, '.spinner__circle');
    expect(circle?.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });
});
