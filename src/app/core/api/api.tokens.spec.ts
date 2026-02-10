import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from './api.tokens';

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
});
