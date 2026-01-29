import { Injectable, computed, inject, signal } from '@angular/core';

import { ThemeService } from '@/app/core/theme/theme.service';
import { createId, createTimestamp } from '@/app/shared/utils/id.utils';
import {
  ApiKey,
  CreateApiKeyInput,
  CreateApiKeyResult,
  ProjectPreferences,
  ThemePreferences,
  UserProfile,
} from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private readonly themeService = inject(ThemeService);

  // Private state signals
  private readonly _userProfile = signal<UserProfile>({
    id: 'user_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatarUrl: null,
  });

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

  private readonly _apiKeys = signal<ApiKey[]>([
    {
      id: 'key_1',
      name: 'Production SDK Key',
      prefix: 'sk_live_abc1...xyz9',
      lastUsedAt: createTimestamp(),
      createdAt: createTimestamp(),
      expiresAt: null,
      scopes: ['read:flags'],
    },
    {
      id: 'key_2',
      name: 'CI/CD Pipeline Key',
      prefix: 'sk_live_def2...uvw8',
      lastUsedAt: null,
      createdAt: createTimestamp(),
      expiresAt: '2025-12-31T23:59:59Z',
      scopes: ['read:flags', 'write:flags'],
    },
  ]);

  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly selectors
  readonly userProfile = this._userProfile.asReadonly();
  readonly projectPreferences = this._projectPreferences.asReadonly();
  readonly themePreferences = this._themePreferences.asReadonly();
  readonly apiKeys = this._apiKeys.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed selectors
  readonly apiKeyCount = computed(() => this._apiKeys().length);

  /** Resolved active theme - delegates to ThemeService */
  readonly activeThemeMode = computed(() => this.themeService.activeTheme());

  // Actions
  updateUserProfile(updates: Partial<Omit<UserProfile, 'id'>>): void {
    this._userProfile.update((profile) => ({
      ...profile,
      ...updates,
    }));
  }

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

  createApiKey(input: CreateApiKeyInput): CreateApiKeyResult {
    const keyId = createId('key');
    const secretBase = generateRandomString(32);
    const secret = `sk_live_${secretBase}`;
    const prefix = `sk_live_${secretBase.slice(0, 4)}...${secretBase.slice(-4)}`;

    const newKey: ApiKey = {
      id: keyId,
      name: input.name,
      prefix,
      lastUsedAt: null,
      createdAt: createTimestamp(),
      expiresAt: input.expiresAt ?? null,
      scopes: input.scopes,
    };

    this._apiKeys.update((keys) => [...keys, newKey]);

    return { key: newKey, secret };
  }

  revokeApiKey(keyId: string): void {
    this._apiKeys.update((keys) => keys.filter((k) => k.id !== keyId));
  }

  getApiKeyById(keyId: string): ApiKey | undefined {
    return this._apiKeys().find((k) => k.id === keyId);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setError(error: string): void {
    this._error.set(error);
  }

  clearError(): void {
    this._error.set(null);
  }
}

/** Generate a random alphanumeric string */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
