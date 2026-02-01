import { Injectable, computed, inject, signal } from '@angular/core';

import { TimeService } from '@/app/core/time/time.service';
import { createId } from '@/app/shared/utils/id.utils';
import { ApiKey, CreateApiKeyInput, CreateApiKeyResult } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class ApiKeyStore {
  private readonly timeService = inject(TimeService);

  private readonly _apiKeys = signal<ApiKey[]>([
    {
      id: 'key_1',
      name: 'Production SDK Key',
      prefix: 'sk_live_abc1...xyz9',
      lastUsedAt: '2025-01-15T10:30:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      expiresAt: null,
      scopes: ['read:flags'],
    },
    {
      id: 'key_2',
      name: 'CI/CD Pipeline Key',
      prefix: 'sk_live_def2...uvw8',
      lastUsedAt: null,
      createdAt: '2025-01-10T00:00:00.000Z',
      expiresAt: '2025-12-31T23:59:59Z',
      scopes: ['read:flags', 'write:flags'],
    },
  ]);

  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly apiKeys = this._apiKeys.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly apiKeyCount = computed(() => this._apiKeys().length);

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
      createdAt: this.timeService.now(),
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

  setError(error: string | null): void {
    this._error.set(error);
  }

  clearError(): void {
    this._error.set(null);
  }
}

/** Generate a random alphanumeric string */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join(
    '',
  );
}
