import { Routes } from '@angular/router';

import { SettingsPageComponent } from './components/settings-page/settings-page';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: SettingsPageComponent,
    data: { title: 'Settings' },
  },
];
