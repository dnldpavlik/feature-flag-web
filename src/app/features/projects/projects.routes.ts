import { Routes } from '@angular/router';

import { ProjectDetailComponent } from './components/project-detail/project-detail';
import { ProjectListComponent } from './components/project-list/project-list';

export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    component: ProjectListComponent,
    data: { title: 'Projects' },
  },
  {
    path: ':projectId',
    component: ProjectDetailComponent,
    data: { title: 'Project' },
  },
];
