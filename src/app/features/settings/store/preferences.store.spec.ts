import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { ThemeService } from '@/app/core/theme/theme.service';
import { PreferencesStore } from './preferences.store';
import { injectService } from '@/app/testing';

describe('PreferencesStore', () => {
  let store: PreferencesStore;
  let themeService: ThemeService;

  beforeEach(() => {
    // Mock matchMedia for ThemeService
    Object.defineProperty(window, 'matchMedia', {
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }),
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [PreferencesStore, ThemeService, { provide: DOCUMENT, useValue: document }],
    });

    themeService = injectService(ThemeService);
    store = injectService(PreferencesStore);
    TestBed.flushEffects();
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  describe('initial state', () => {
    it('should have default project preferences', () => {
      const prefs = store.projectPreferences();
      expect(prefs).toBeDefined();
      expect(prefs.defaultEnvironmentId).toBeDefined();
      expect(prefs.notifications).toBeDefined();
    });

    it('should have default theme preferences', () => {
      const theme = store.themePreferences();
      expect(theme).toBeDefined();
      expect(theme.mode).toBe('system');
      expect(theme.reducedMotion).toBe(false);
      expect(theme.compactMode).toBe(false);
    });

    it('should not be loading initially', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have no error initially', () => {
      expect(store.error()).toBeNull();
    });
  });

  describe('updateProjectPreferences', () => {
    it('should update default environment ID', () => {
      store.updateProjectPreferences({ defaultEnvironmentId: 'env_staging' });
      expect(store.projectPreferences().defaultEnvironmentId).toBe('env_staging');
    });

    it('should update notification preferences', () => {
      store.updateProjectPreferences({
        notifications: {
          emailOnFlagChange: true,
          emailOnApiKeyCreated: false,
          emailDigest: 'weekly',
        },
      });
      const notifs = store.projectPreferences().notifications;
      expect(notifs.emailOnFlagChange).toBe(true);
      expect(notifs.emailOnApiKeyCreated).toBe(false);
      expect(notifs.emailDigest).toBe('weekly');
    });

    it('should merge notification preferences', () => {
      const originalDigest = store.projectPreferences().notifications.emailDigest;
      store.updateProjectPreferences({
        notifications: {
          ...store.projectPreferences().notifications,
          emailOnFlagChange: true,
        },
      });
      expect(store.projectPreferences().notifications.emailDigest).toBe(originalDigest);
    });
  });

  describe('updateThemePreferences', () => {
    it('should update theme mode to light', () => {
      store.updateThemePreferences({ mode: 'light' });
      expect(store.themePreferences().mode).toBe('light');
    });

    it('should update theme mode to dark', () => {
      store.updateThemePreferences({ mode: 'dark' });
      expect(store.themePreferences().mode).toBe('dark');
    });

    it('should update reduced motion', () => {
      store.updateThemePreferences({ reducedMotion: true });
      expect(store.themePreferences().reducedMotion).toBe(true);
    });

    it('should update compact mode', () => {
      store.updateThemePreferences({ compactMode: true });
      expect(store.themePreferences().compactMode).toBe(true);
    });

    it('should only update provided fields', () => {
      const originalMode = store.themePreferences().mode;
      store.updateThemePreferences({ compactMode: true });
      expect(store.themePreferences().mode).toBe(originalMode);
    });

    it('should sync theme mode with ThemeService when updated', () => {
      store.updateThemePreferences({ mode: 'dark' });
      TestBed.flushEffects();
      expect(themeService.mode()).toBe('dark');
      expect(store.activeThemeMode()).toBe('dark');

      store.updateThemePreferences({ mode: 'light' });
      TestBed.flushEffects();
      expect(themeService.mode()).toBe('light');
      expect(store.activeThemeMode()).toBe('light');
    });
  });

  describe('computed selectors', () => {
    it('should delegate activeThemeMode to ThemeService', () => {
      expect(store.activeThemeMode()).toBe(themeService.activeTheme());
    });
  });

  describe('loading state', () => {
    it('should set loading state', () => {
      store.setLoading(true);
      expect(store.loading()).toBe(true);
    });

    it('should clear loading state', () => {
      store.setLoading(true);
      store.setLoading(false);
      expect(store.loading()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should set error state', () => {
      store.setError('Something went wrong');
      expect(store.error()).toBe('Something went wrong');
    });

    it('should clear error state', () => {
      store.setError('An error');
      store.clearError();
      expect(store.error()).toBeNull();
    });
  });
});
