import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data['role'] as string | undefined;

  if (!requiredRole) {
    return true;
  }

  if (authService.hasRole(requiredRole)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
