import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'flags',
    canActivate: [authGuard],
    loadChildren: () => import('./features/flags/flags.routes').then((m) => m.FLAG_ROUTES),
  },
  {
    path: 'environments',
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
    loadChildren: () =>
      import('./features/environments/environments.routes').then((m) => m.ENVIRONMENT_ROUTES),
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadChildren: () => import('./features/projects/projects.routes').then((m) => m.PROJECT_ROUTES),
  },
  {
    path: 'segments',
    canActivate: [authGuard],
    loadChildren: () => import('./features/segments/segments.routes').then((m) => m.SEGMENT_ROUTES),
  },
  {
    path: 'audit',
    canActivate: [authGuard],
    loadChildren: () => import('./features/audit/audit.routes').then((m) => m.AUDIT_ROUTES),
  },
  {
    path: 'settings',
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
    loadChildren: () =>
      import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
