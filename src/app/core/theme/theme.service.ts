import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

/** Theme mode options */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Resolved theme (no system option) */
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme-mode';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

/**
 * Service for managing application theme (light/dark mode).
 *
 * Features:
 * - Persists user preference to localStorage
 * - Listens for OS preference changes when mode is 'system'
 * - Applies theme to document via data-theme attribute
 * - Exposes reactive signals for current mode and active theme
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;

  private readonly _mode = signal<ThemeMode>(this.loadMode());
  private readonly _systemPrefersDark = signal(this.getSystemPreference());

  /** Current theme mode setting (light, dark, or system) */
  readonly mode = this._mode.asReadonly();

  /** Resolved active theme (light or dark) - resolves 'system' to actual preference */
  readonly activeTheme = computed<Theme>(() => {
    const mode = this._mode();
    if (mode === 'system') {
      return this._systemPrefersDark() ? 'dark' : 'light';
    }
    return mode;
  });

  /** Whether the active theme is dark */
  readonly isDark = computed(() => this.activeTheme() === 'dark');

  constructor() {
    // Listen for system preference changes
    this.setupSystemPreferenceListener();

    // Apply theme to document whenever activeTheme changes
    effect(() => {
      this.applyTheme(this.activeTheme());
    });
  }

  /**
   * Set the theme mode.
   * @param mode - 'light', 'dark', or 'system'
   */
  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
    this.saveMode(mode);
  }

  /**
   * Toggle between light and dark modes.
   * If currently on 'system', switches to the opposite of the current active theme.
   */
  toggle(): void {
    const newMode = this.activeTheme() === 'dark' ? 'light' : 'dark';
    this.setMode(newMode);
  }

  private loadMode(): ThemeMode {
    if (!this.window?.localStorage) {
      return 'system';
    }
    const saved = this.window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  }

  private saveMode(mode: ThemeMode): void {
    if (!this.window?.localStorage) {
      return;
    }
    this.window.localStorage.setItem(STORAGE_KEY, mode);
  }

  private getSystemPreference(): boolean {
    if (!this.window?.matchMedia) {
      return false;
    }
    return this.window.matchMedia(MEDIA_QUERY).matches;
  }

  private setupSystemPreferenceListener(): void {
    if (!this.window?.matchMedia) {
      return;
    }

    const mediaQuery = this.window.matchMedia(MEDIA_QUERY);
    mediaQuery.addEventListener('change', (event) => {
      this._systemPrefersDark.set(event.matches);
    });
  }

  private applyTheme(theme: Theme): void {
    this.document.documentElement.setAttribute('data-theme', theme);
  }
}
