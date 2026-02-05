export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  readonly id: string;
  readonly message: string;
  readonly variant: ToastVariant;
  readonly duration: number;
}

export interface ToastOptions {
  readonly duration?: number;
}

export const DEFAULT_TOAST_DURATION = 5000;
export const MAX_VISIBLE_TOASTS = 5;
