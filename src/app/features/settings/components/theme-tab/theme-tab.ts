import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PreferencesStore } from '../../store/preferences.store';
import { ThemeMode } from '../../models/settings.model';

@Component({
  selector: 'app-theme-tab',
  templateUrl: './theme-tab.html',
  styleUrl: './theme-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeTabComponent {
  private readonly preferencesStore = inject(PreferencesStore);

  protected readonly themePreferences = computed(() => this.preferencesStore.themePreferences());

  protected readonly currentMode = computed(() => this.themePreferences().mode);
  protected readonly reducedMotion = computed(() => this.themePreferences().reducedMotion);
  protected readonly compactMode = computed(() => this.themePreferences().compactMode);

  protected onModeChange(mode: ThemeMode): void {
    this.preferencesStore.updateThemePreferences({ mode });
  }

  protected onReducedMotionChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.preferencesStore.updateThemePreferences({ reducedMotion: checked });
  }

  protected onCompactModeChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.preferencesStore.updateThemePreferences({ compactMode: checked });
  }
}
