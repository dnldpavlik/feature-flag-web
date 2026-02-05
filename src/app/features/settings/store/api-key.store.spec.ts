import { TestBed } from '@angular/core/testing';

import { ApiKeyStore } from './api-key.store';
import { CreateApiKeyInput } from '../models/settings.model';
import {
  injectService,
  getCountBefore,
  expectItemAdded,
  expectItemRemoved,
  MOCK_API_PROVIDERS,
} from '@/app/testing';

describe('ApiKeyStore', () => {
  let store: ApiKeyStore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [ApiKeyStore, ...MOCK_API_PROVIDERS],
    });

    store = injectService(ApiKeyStore);
    await store.loadApiKeys();
  });

  describe('initial state', () => {
    it('should have API keys after loading', () => {
      const keys = store.apiKeys();
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThan(0);
    });

    it('should not be loading after loadApiKeys completes', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have no error after successful load', () => {
      expect(store.error()).toBeNull();
    });
  });

  describe('createApiKey', () => {
    it('should create a new API key', async () => {
      const countBefore = getCountBefore(store.apiKeys);
      const input: CreateApiKeyInput = {
        name: 'Test Key',
        scopes: ['read:flags'],
      };

      const result = await store.createApiKey(input);

      expectItemAdded(store.apiKeys, countBefore);
      expect(result?.key.name).toBe('Test Key');
      expect(result?.key.scopes).toEqual(['read:flags']);
    });

    it('should return the full secret only at creation', async () => {
      const input: CreateApiKeyInput = {
        name: 'Secret Key',
        scopes: ['read:flags', 'write:flags'],
      };

      const result = await store.createApiKey(input);

      expect(result?.secret).toBeDefined();
      expect(result?.secret.startsWith('sk_live_')).toBe(true);
    });

    it('should generate a masked prefix', async () => {
      const input: CreateApiKeyInput = {
        name: 'Masked Key',
        scopes: ['admin'],
      };

      const result = await store.createApiKey(input);

      expect(result?.key.prefix).toBeDefined();
      expect(result?.key.prefix.startsWith('sk_live_')).toBe(true);
      expect(result?.key.prefix).toContain('...');
    });

    it('should set createdAt timestamp', async () => {
      const input: CreateApiKeyInput = {
        name: 'Timestamped Key',
        scopes: ['read:flags'],
      };

      const result = await store.createApiKey(input);

      expect(result?.key.createdAt).toBeDefined();
    });

    it('should set expiresAt when provided', async () => {
      const expiresAt = '2025-12-31T23:59:59Z';
      const input: CreateApiKeyInput = {
        name: 'Expiring Key',
        scopes: ['read:flags'],
        expiresAt,
      };

      const result = await store.createApiKey(input);

      expect(result?.key.expiresAt).toBe(expiresAt);
    });

    it('should set expiresAt to null when not provided', async () => {
      const input: CreateApiKeyInput = {
        name: 'Non-expiring Key',
        scopes: ['read:flags'],
      };

      const result = await store.createApiKey(input);

      expect(result?.key.expiresAt).toBeNull();
    });
  });

  describe('revokeApiKey', () => {
    it('should remove an API key by ID', async () => {
      const input: CreateApiKeyInput = {
        name: 'Key to Revoke',
        scopes: ['read:flags'],
      };
      const result = await store.createApiKey(input);
      const countBefore = getCountBefore(store.apiKeys);

      await store.revokeApiKey(result!.key.id);

      expectItemRemoved(store.apiKeys, countBefore);
      expect(store.apiKeys().find((k) => k.id === result!.key.id)).toBeUndefined();
    });

    it('should not affect other API keys', async () => {
      const key1 = await store.createApiKey({
        name: 'Key 1',
        scopes: ['read:flags'],
      });
      const key2 = await store.createApiKey({
        name: 'Key 2',
        scopes: ['write:flags'],
      });

      await store.revokeApiKey(key1!.key.id);

      expect(store.apiKeys().find((k) => k.id === key2!.key.id)).toBeDefined();
    });
  });

  describe('getApiKeyById', () => {
    it('should find API key by ID', async () => {
      const result = await store.createApiKey({
        name: 'Findable Key',
        scopes: ['read:flags'],
      });

      const found = store.getApiKeyById(result!.key.id);

      expect(found).toBeDefined();
      expect(found?.name).toBe('Findable Key');
    });

    it('should return undefined for non-existent ID', () => {
      const found = store.getApiKeyById('non_existent_id');
      expect(found).toBeUndefined();
    });
  });

  describe('computed selectors', () => {
    it('should compute API key count', async () => {
      const initialCount = store.apiKeyCount();
      await store.createApiKey({ name: 'New Key', scopes: ['read:flags'] });
      expect(store.apiKeyCount()).toBe(initialCount + 1);
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
