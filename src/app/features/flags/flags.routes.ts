import { Routes } from '@angular/router';

import { FlagCreateComponent } from './components/flag-create/flag-create';
import { FlagDetailComponent } from './components/flag-detail/flag-detail';
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
  {
    path: ':flagId',
    component: FlagDetailComponent,
    data: { title: 'Flag Details' },
  },
];
