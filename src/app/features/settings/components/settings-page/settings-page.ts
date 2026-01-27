import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { TabsComponent } from '@/app/shared/ui/tabs/tabs';
import { TabItem } from '@/app/shared/ui/tabs/tabs.types';
import { UserProfileTabComponent } from '../user-profile-tab/user-profile-tab';
import { PreferencesTabComponent } from '../preferences-tab/preferences-tab';
import { ApiKeysTabComponent } from '../api-keys-tab/api-keys-tab';
import { ThemeTabComponent } from '../theme-tab/theme-tab';

export type SettingsTab = 'profile' | 'preferences' | 'api-keys' | 'theme';

const SETTINGS_TABS: TabItem[] = [
  { id: 'profile', label: 'Profile', icon: 'users' },
  { id: 'preferences', label: 'Preferences', icon: 'settings' },
  { id: 'api-keys', label: 'API Keys', icon: 'list' },
  { id: 'theme', label: 'Appearance', icon: 'flag' },
];

@Component({
  selector: 'app-settings-page',
  imports: [
    TabsComponent,
    UserProfileTabComponent,
    PreferencesTabComponent,
    ApiKeysTabComponent,
    ThemeTabComponent,
  ],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  readonly tabs = SETTINGS_TABS;
  readonly activeTab = signal<SettingsTab>('profile');

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId as SettingsTab);
  }
}
