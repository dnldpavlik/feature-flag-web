import { ComponentFixture } from '@angular/core/testing';

import { createComponentFixture, getComponent } from '@/app/testing';
import { queryAll, query, expectNotExists } from '@/app/testing';
import { ToastComponent } from './toast';
import { ToastService } from './toast.service';

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    fixture = await createComponentFixture(ToastComponent);
    toastService = getComponent(fixture)['toastService'];
  });

  it('should create', () => {
    expect(getComponent(fixture)).toBeTruthy();
  });

  it('should not render container when there are no toasts', () => {
    fixture.detectChanges();
    expectNotExists(fixture, '.toast-container');
  });

  it('should render toasts when present', () => {
    toastService.show('Test message', 'info', { duration: 0 });
    fixture.detectChanges();

    const toasts = queryAll(fixture, '.toast');
    expect(toasts).toHaveLength(1);
  });

  it('should display toast message text', () => {
    toastService.show('Hello World', 'success', { duration: 0 });
    fixture.detectChanges();

    const message = query(fixture, '.toast__message');
    expect(message?.nativeElement.textContent).toContain('Hello World');
  });

  it('should apply variant class', () => {
    toastService.show('Error!', 'error', { duration: 0 });
    fixture.detectChanges();

    const toast = query(fixture, '.toast');
    expect(toast?.nativeElement.classList).toContain('toast--error');
  });

  it('should render multiple toasts', () => {
    toastService.show('First', 'info', { duration: 0 });
    toastService.show('Second', 'success', { duration: 0 });
    fixture.detectChanges();

    const toasts = queryAll(fixture, '.toast');
    expect(toasts).toHaveLength(2);
  });

  it('should dismiss toast when close button is clicked', () => {
    toastService.show('Dismiss me', 'info', { duration: 0 });
    fixture.detectChanges();

    const dismissBtn = query(fixture, '.toast__dismiss');
    dismissBtn?.nativeElement.click();
    fixture.detectChanges();

    expectNotExists(fixture, '.toast');
  });

  it('should have aria-live attribute on container', () => {
    toastService.show('Accessible', 'info', { duration: 0 });
    fixture.detectChanges();

    const container = query(fixture, '.toast-container');
    expect(container?.nativeElement.getAttribute('aria-live')).toBe('polite');
  });

  it('should have role=alert on toast items', () => {
    toastService.show('Alert', 'warning', { duration: 0 });
    fixture.detectChanges();

    const toast = query(fixture, '.toast');
    expect(toast?.nativeElement.getAttribute('role')).toBe('alert');
  });
});
