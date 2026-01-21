import { Routes } from '@angular/router';

import { EnvironmentDetailComponent } from './components/environment-detail/environment-detail';
import { EnvironmentListComponent } from './components/environment-list/environment-list';

export const ENVIRONMENT_ROUTES: Routes = [
  {
    path: '',
    component: EnvironmentListComponent,
    data: { title: 'Environments' },
  },
  {
    path: ':envId',
    component: EnvironmentDetailComponent,
    data: { title: 'Environment' },
  },
];
