import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Keycloak from 'keycloak-js';

import { environment } from '@/environments/environment';

export const roleGuard: CanActivateFn = (route) => {
  const keycloak = inject(Keycloak);
  const router = inject(Router);
  const requiredRole = route.data['role'] as string | undefined;

  if (!requiredRole) {
    return true;
  }

  const clientId = environment.keycloak.clientId;
  const clientRoles = keycloak.resourceAccess?.[clientId]?.roles ?? [];
  const realmRoles = keycloak.realmAccess?.roles ?? [];
  const allRoles = [...realmRoles, ...clientRoles];

  if (allRoles.includes(requiredRole)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
