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
      import('./features/dashboard/dashboard.routes').then(
        (m) => m.DASHBOARD_ROUTES
      ),
  },
  {
    path: 'flags',
    loadChildren: () =>
      import('./features/flags/flags.routes').then((m) => m.FLAG_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
