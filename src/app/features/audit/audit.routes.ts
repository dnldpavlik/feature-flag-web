import { Routes } from '@angular/router';

import { AuditListComponent } from './components/audit-list/audit-list';

export const AUDIT_ROUTES: Routes = [
  {
    path: '',
    component: AuditListComponent,
    data: { title: 'Audit Log' },
  },
];
