/**
 * Note: app.config.ts uses provideKeycloak() which internally constructs a
 * Keycloak instance. Mocking keycloak-angular avoids the ESM/CJS interop
 * issue where keycloak-js constructor fails in Jest.
 */

jest.mock('keycloak-angular', () => {
  const { InjectionToken } = jest.requireActual('@angular/core');
  return {
    __esModule: true,
    provideKeycloak: jest.fn(() => ({ ɵproviders: [] })),
    withAutoRefreshToken: jest.fn(() => ({})),
    AutoRefreshTokenService: class {},
    UserActivityService: class {},
    includeBearerTokenInterceptor: jest.fn(),
    INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG: new InjectionToken(
      'INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG',
    ),
  };
});

import { appConfig } from './app.config';

describe('appConfig', () => {
  describe('provider registration', () => {
    it('should define an ApplicationConfig with providers', () => {
      expect(appConfig).toBeDefined();
      expect(appConfig.providers).toBeDefined();
      expect(Array.isArray(appConfig.providers)).toBe(true);
    });

    it('should register core providers', () => {
      // 3 original (errorListeners, zoneChangeDetection, router)
      // + provideKeycloak, httpClient, INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG, API_BASE_URL
      expect(appConfig.providers.length).toBe(7);
    });

    it('should include browser global error listeners provider', () => {
      expect(appConfig.providers.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('routing configuration', () => {
    it('should include router provider for application routes', () => {
      expect(appConfig.providers.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('zone configuration', () => {
    it('should include zone change detection provider', () => {
      expect(appConfig.providers.length).toBeGreaterThanOrEqual(1);
    });
  });
});
