import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { ToastService } from '@/app/shared/ui/toast/toast.service';
import { isApiError } from './api-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = extractErrorMessage(error);
      toastService.error(message);
      return throwError(() => error);
    }),
  );
};

function extractErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Unable to connect to the server. Please check your connection.';
  }

  if (isApiError(error.error)) {
    // Check for database constraint violations and provide friendly messages
    const message = error.error.message.toLowerCase();
    if (message.includes('foreign key constraint') || message.includes('violates')) {
      return 'This item cannot be deleted because it has related data. Please delete related items first.';
    }
    return error.error.message;
  }

  if (error.status === 401) {
    return 'Session expired. Redirecting to login...';
  }

  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (error.status === 404) {
    return 'The requested resource was not found.';
  }

  if (error.status === 409) {
    return 'This operation conflicts with existing data.';
  }

  if (error.status >= 500) {
    return 'A server error occurred. Please try again later.';
  }

  return 'An unexpected error occurred.';
}
