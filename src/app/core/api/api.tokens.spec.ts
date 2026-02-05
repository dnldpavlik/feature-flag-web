import { TestBed } from '@angular/core/testing';

import { API_BASE_URL, AUTH_TOKEN_KEY } from './api.tokens';

describe('API Tokens', () => {
  describe('API_BASE_URL', () => {
    it('should be injectable with a provided value', () => {
      TestBed.configureTestingModule({
        providers: [{ provide: API_BASE_URL, useValue: '/api/v1' }],
      });

      const baseUrl = TestBed.inject(API_BASE_URL);
      expect(baseUrl).toBe('/api/v1');
    });
  });

  describe('AUTH_TOKEN_KEY', () => {
    it('should be injectable with a provided value', () => {
      TestBed.configureTestingModule({
        providers: [{ provide: AUTH_TOKEN_KEY, useValue: 'ff_api_key' }],
      });

      const tokenKey = TestBed.inject(AUTH_TOKEN_KEY);
      expect(tokenKey).toBe('ff_api_key');
    });
  });
});
