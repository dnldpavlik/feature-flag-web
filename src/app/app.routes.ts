import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'flags',
    loadChildren: () => import('./features/flags/flags.routes').then((m) => m.FLAG_ROUTES),
  },
  {
    path: 'environments',
    loadChildren: () =>
      import('./features/environments/environments.routes').then((m) => m.ENVIRONMENT_ROUTES),
  },
  {
    path: 'projects',
    loadChildren: () => import('./features/projects/projects.routes').then((m) => m.PROJECT_ROUTES),
  },
  {
    path: 'segments',
    loadChildren: () => import('./features/segments/segments.routes').then((m) => m.SEGMENT_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
