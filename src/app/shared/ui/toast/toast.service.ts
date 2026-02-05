import { Injectable, signal } from '@angular/core';

import { createId } from '@/app/shared/utils/id.utils';
import {
  Toast,
  ToastOptions,
  ToastVariant,
  DEFAULT_TOAST_DURATION,
  MAX_VISIBLE_TOASTS,
} from './toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly toasts = this._toasts.asReadonly();

  show(message: string, variant: ToastVariant, options?: ToastOptions): string {
    const id = createId('toast');
    const duration = options?.duration ?? DEFAULT_TOAST_DURATION;

    const toast: Toast = { id, message, variant, duration };

    this._toasts.update((toasts) => {
      const updated = [...toasts, toast];
      return updated.length > MAX_VISIBLE_TOASTS ? updated.slice(-MAX_VISIBLE_TOASTS) : updated;
    });

    if (duration > 0) {
      const timer = setTimeout(() => this.dismiss(id), duration);
      this.timers.set(id, timer);
    }

    return id;
  }

  success(message: string, options?: ToastOptions): string {
    return this.show(message, 'success', options);
  }

  error(message: string, options?: ToastOptions): string {
    return this.show(message, 'error', { duration: 0, ...options });
  }

  warning(message: string, options?: ToastOptions): string {
    return this.show(message, 'warning', options);
  }

  info(message: string, options?: ToastOptions): string {
    return this.show(message, 'info', options);
  }

  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this._toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }
}
