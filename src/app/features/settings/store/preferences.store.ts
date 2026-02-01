import { Injectable, computed, inject, signal } from '@angular/core';

import { ThemeService } from '@/app/core/theme/theme.service';
import { ProjectPreferences, ThemePreferences } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class PreferencesStore {
  private readonly themeService = inject(ThemeService);

  private readonly _projectPreferences = signal<ProjectPreferences>({
    defaultEnvironmentId: 'env_development',
    notifications: {
      emailOnFlagChange: true,
      emailOnApiKeyCreated: true,
      emailDigest: 'weekly',
    },
  });

  private readonly _themePreferences = signal<ThemePreferences>({
    mode: 'system',
    reducedMotion: false,
    compactMode: false,
  });

  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly projectPreferences = this._projectPreferences.asReadonly();
  readonly themePreferences = this._themePreferences.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /** Resolved active theme - delegates to ThemeService */
  readonly activeThemeMode = computed(() => this.themeService.activeTheme());

  updateProjectPreferences(updates: Partial<ProjectPreferences>): void {
    this._projectPreferences.update((prefs) => ({
      ...prefs,
      ...updates,
    }));
  }

  updateThemePreferences(updates: Partial<ThemePreferences>): void {
    this._themePreferences.update((prefs) => ({
      ...prefs,
      ...updates,
    }));

    // Sync mode with ThemeService
    if (updates.mode) {
      this.themeService.setMode(updates.mode);
    }
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  clearError(): void {
    this._error.set(null);
  }
}
