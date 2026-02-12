import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ToastService } from '@watt/ui';
import { ApiKeyApi } from '../api/api-key.api';
import { ApiKey, CreateApiKeyInput, CreateApiKeyResult } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class ApiKeyStore {
  private readonly api = inject(ApiKeyApi);
  private readonly toast = inject(ToastService);

  private readonly _apiKeys = signal<ApiKey[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly apiKeys = this._apiKeys.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly apiKeyCount = computed(() => this._apiKeys().length);

  async loadApiKeys(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const keys = await firstValueFrom(this.api.getAll());
      this._apiKeys.set(keys);
    } catch {
      this._error.set('Failed to load API keys');
      this.toast.error('Failed to load API keys');
    } finally {
      this._loading.set(false);
    }
  }

  async createApiKey(input: CreateApiKeyInput): Promise<CreateApiKeyResult | null> {
    try {
      const result = await firstValueFrom(this.api.create(input));
      this._apiKeys.update((keys) => [...keys, result.key]);
      this.toast.success('API key created');
      return result;
    } catch {
      this.toast.error('Failed to create API key');
      return null;
    }
  }

  async revokeApiKey(keyId: string): Promise<void> {
    try {
      await firstValueFrom(this.api.revoke(keyId));
      this._apiKeys.update((keys) => keys.filter((k) => k.id !== keyId));
      this.toast.success('API key revoked');
    } catch {
      this.toast.error('Failed to revoke API key');
    }
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
