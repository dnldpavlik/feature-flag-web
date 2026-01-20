import { Routes } from '@angular/router';

import { FlagCreateComponent } from './components/flag-create/flag-create';
import { FlagListComponent } from './components/flag-list/flag-list';

export const FLAG_ROUTES: Routes = [
  {
    path: '',
    component: FlagListComponent,
    data: { title: 'Feature Flags' },
  },
  {
    path: 'new',
    component: FlagCreateComponent,
    data: { title: 'Create Flag' },
  },
];
