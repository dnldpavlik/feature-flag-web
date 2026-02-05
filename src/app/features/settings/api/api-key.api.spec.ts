import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_BASE_URL } from '@/app/core/api/api.tokens';
import { ApiKeyApi } from './api-key.api';
import { ApiKey, CreateApiKeyInput, CreateApiKeyResult } from '../models/settings.model';

describe('ApiKeyApi', () => {
  let api: ApiKeyApi;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:3000/api/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        ApiKeyApi,
      ],
    });

    api = TestBed.inject(ApiKeyApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll', () => {
    it('should GET all API keys', () => {
      const mockKeys: ApiKey[] = [
        {
          id: 'key_1',
          name: 'Production Key',
          prefix: 'sk_live_abc1...xyz9',
          lastUsedAt: null,
          createdAt: '2025-01-01T00:00:00.000Z',
          expiresAt: null,
          scopes: ['read:flags'],
        },
      ];

      api.getAll().subscribe((keys) => {
        expect(keys).toEqual(mockKeys);
      });

      const req = httpMock.expectOne(`${baseUrl}/api-keys`);
      expect(req.request.method).toBe('GET');
      req.flush(mockKeys);
    });
  });

  describe('create', () => {
    it('should POST a new API key', () => {
      const input: CreateApiKeyInput = {
        name: 'New Key',
        scopes: ['read:flags', 'write:flags'],
      };

      const mockResponse: CreateApiKeyResult = {
        key: {
          id: 'key_new',
          name: 'New Key',
          prefix: 'sk_live_abc1...xyz9',
          lastUsedAt: null,
          createdAt: '2025-01-01T00:00:00.000Z',
          expiresAt: null,
          scopes: ['read:flags', 'write:flags'],
        },
        secret: 'sk_live_abcdef123456',
      };

      api.create(input).subscribe((result) => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/api-keys`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(input);
      req.flush(mockResponse);
    });
  });

  describe('revoke', () => {
    it('should DELETE an API key', () => {
      api.revoke('key_1').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/api-keys/key_1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
