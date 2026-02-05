import { ComponentFixture } from '@angular/core/testing';

import { createComponentFixture, getComponent } from '@/app/testing';
import { query, getText, expectExists, expectNotExists } from '@/app/testing';
import { ErrorBannerComponent } from './error-banner';

describe('ErrorBannerComponent', () => {
  let fixture: ComponentFixture<ErrorBannerComponent>;
  let component: ErrorBannerComponent;

  beforeEach(async () => {
    fixture = await createComponentFixture(ErrorBannerComponent);
    component = getComponent(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default error message', () => {
    fixture.detectChanges();
    expect(getText(fixture, '.error-banner__message')).toBe(
      'Something went wrong. Please try again.',
    );
  });

  it('should display custom error message', () => {
    fixture.componentRef.setInput('message', 'Failed to load projects');
    fixture.detectChanges();
    expect(getText(fixture, '.error-banner__message')).toBe('Failed to load projects');
  });

  it('should show retry button by default', () => {
    fixture.detectChanges();
    expectExists(fixture, 'app-button');
  });

  it('should hide retry button when retryable is false', () => {
    fixture.componentRef.setInput('retryable', false);
    fixture.detectChanges();
    expectNotExists(fixture, 'app-button');
  });

  it('should emit retry event when retry button is clicked', () => {
    fixture.detectChanges();
    const retrySpy = jest.fn();
    component.retry.subscribe(retrySpy);

    const btn = query(fixture, 'app-button');
    btn?.nativeElement.click();

    expect(retrySpy).toHaveBeenCalled();
  });

  it('should have role=alert for accessibility', () => {
    fixture.detectChanges();
    const banner = query(fixture, '.error-banner');
    expect(banner?.nativeElement.getAttribute('role')).toBe('alert');
  });
});
