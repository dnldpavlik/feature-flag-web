import { Routes } from '@angular/router';

import { SegmentDetailComponent } from './components/segment-detail/segment-detail';
import { SegmentListComponent } from './components/segment-list/segment-list';

export const SEGMENT_ROUTES: Routes = [
  {
    path: '',
    component: SegmentListComponent,
  },
  {
    path: ':segmentId',
    component: SegmentDetailComponent,
  },
];
