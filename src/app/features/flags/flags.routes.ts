import { Routes } from '@angular/router';

import { FlagListComponent } from './components/flag-list/flag-list';

export const FLAG_ROUTES: Routes = [
  {
    path: '',
    component: FlagListComponent,
    data: { title: 'Feature Flags' },
  },
];
