import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { ThemeService } from '@/app/core/theme/theme.service';
import { SettingsStore } from './settings.store';
import { CreateApiKeyInput } from '../models/settings.model';
import { injectService, getCountBefore, expectItemAdded, expectItemRemoved } from '@/app/testing';

describe('SettingsStore', () => {
  let store: SettingsStore;
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
      providers: [SettingsStore, ThemeService, { provide: DOCUMENT, useValue: document }],
    });

    themeService = injectService(ThemeService);
    store = injectService(SettingsStore);
    TestBed.flushEffects();
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  describe('initial state', () => {
    it('should have default user profile', () => {
      const profile = store.userProfile();
      expect(profile).toBeDefined();
      expect(profile.id).toBeDefined();
      expect(profile.name).toBeDefined();
      expect(profile.email).toBeDefined();
    });

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

    it('should have initial API keys', () => {
      const keys = store.apiKeys();
      expect(Array.isArray(keys)).toBe(true);
    });

    it('should not be loading initially', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have no error initially', () => {
      expect(store.error()).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user name', () => {
      store.updateUserProfile({ name: 'Updated Name' });
      expect(store.userProfile().name).toBe('Updated Name');
    });

    it('should update user email', () => {
      store.updateUserProfile({ email: 'new@example.com' });
      expect(store.userProfile().email).toBe('new@example.com');
    });

    it('should update avatar URL', () => {
      store.updateUserProfile({ avatarUrl: 'https://example.com/avatar.png' });
      expect(store.userProfile().avatarUrl).toBe('https://example.com/avatar.png');
    });

    it('should only update provided fields', () => {
      const originalEmail = store.userProfile().email;
      store.updateUserProfile({ name: 'New Name' });
      expect(store.userProfile().email).toBe(originalEmail);
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
  });

  describe('createApiKey', () => {
    it('should create a new API key', () => {
      const countBefore = getCountBefore(store.apiKeys);
      const input: CreateApiKeyInput = {
        name: 'Test Key',
        scopes: ['read:flags'],
      };

      const result = store.createApiKey(input);

      expectItemAdded(store.apiKeys, countBefore);
      expect(result.key.name).toBe('Test Key');
      expect(result.key.scopes).toEqual(['read:flags']);
    });

    it('should return the full secret only at creation', () => {
      const input: CreateApiKeyInput = {
        name: 'Secret Key',
        scopes: ['read:flags', 'write:flags'],
      };

      const result = store.createApiKey(input);

      expect(result.secret).toBeDefined();
      expect(result.secret.startsWith('sk_live_')).toBe(true);
    });

    it('should generate a masked prefix', () => {
      const input: CreateApiKeyInput = {
        name: 'Masked Key',
        scopes: ['admin'],
      };

      const result = store.createApiKey(input);

      expect(result.key.prefix).toBeDefined();
      expect(result.key.prefix.startsWith('sk_live_')).toBe(true);
      expect(result.key.prefix).toContain('...');
    });

    it('should set createdAt timestamp', () => {
      const input: CreateApiKeyInput = {
        name: 'Timestamped Key',
        scopes: ['read:flags'],
      };

      const result = store.createApiKey(input);

      expect(result.key.createdAt).toBeDefined();
    });

    it('should set expiresAt when provided', () => {
      const expiresAt = '2025-12-31T23:59:59Z';
      const input: CreateApiKeyInput = {
        name: 'Expiring Key',
        scopes: ['read:flags'],
        expiresAt,
      };

      const result = store.createApiKey(input);

      expect(result.key.expiresAt).toBe(expiresAt);
    });

    it('should set expiresAt to null when not provided', () => {
      const input: CreateApiKeyInput = {
        name: 'Non-expiring Key',
        scopes: ['read:flags'],
      };

      const result = store.createApiKey(input);

      expect(result.key.expiresAt).toBeNull();
    });
  });

  describe('revokeApiKey', () => {
    it('should remove an API key by ID', () => {
      const input: CreateApiKeyInput = {
        name: 'Key to Revoke',
        scopes: ['read:flags'],
      };
      const result = store.createApiKey(input);
      const countBefore = getCountBefore(store.apiKeys);

      store.revokeApiKey(result.key.id);

      expectItemRemoved(store.apiKeys, countBefore);
      expect(store.apiKeys().find((k) => k.id === result.key.id)).toBeUndefined();
    });

    it('should not affect other API keys', () => {
      const key1 = store.createApiKey({
        name: 'Key 1',
        scopes: ['read:flags'],
      });
      const key2 = store.createApiKey({
        name: 'Key 2',
        scopes: ['write:flags'],
      });

      store.revokeApiKey(key1.key.id);

      expect(store.apiKeys().find((k) => k.id === key2.key.id)).toBeDefined();
    });
  });

  describe('getApiKeyById', () => {
    it('should find API key by ID', () => {
      const result = store.createApiKey({
        name: 'Findable Key',
        scopes: ['read:flags'],
      });

      const found = store.getApiKeyById(result.key.id);

      expect(found).toBeDefined();
      expect(found?.name).toBe('Findable Key');
    });

    it('should return undefined for non-existent ID', () => {
      const found = store.getApiKeyById('non_existent_id');
      expect(found).toBeUndefined();
    });
  });

  describe('computed selectors', () => {
    it('should delegate activeThemeMode to ThemeService', () => {
      // activeThemeMode should reflect ThemeService.activeTheme()
      expect(store.activeThemeMode()).toBe(themeService.activeTheme());
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

    it('should compute API key count', () => {
      const initialCount = store.apiKeyCount();
      store.createApiKey({ name: 'New Key', scopes: ['read:flags'] });
      expect(store.apiKeyCount()).toBe(initialCount + 1);
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
});
