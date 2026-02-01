import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { SettingsStore } from '../../store/settings.store';
import { ThemeMode } from '../../models/settings.model';

@Component({
  selector: 'app-theme-tab',
  templateUrl: './theme-tab.html',
  styleUrl: './theme-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeTabComponent {
  private readonly settingsStore = inject(SettingsStore);

  protected readonly themePreferences = computed(() => this.settingsStore.themePreferences());

  protected readonly currentMode = computed(() => this.themePreferences().mode);
  protected readonly reducedMotion = computed(() => this.themePreferences().reducedMotion);
  protected readonly compactMode = computed(() => this.themePreferences().compactMode);

  protected onModeChange(mode: ThemeMode): void {
    this.settingsStore.updateThemePreferences({ mode });
  }

  protected onReducedMotionChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.settingsStore.updateThemePreferences({ reducedMotion: checked });
  }

  protected onCompactModeChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.settingsStore.updateThemePreferences({ compactMode: checked });
  }
}
