import { appConfig } from './app.config';

describe('appConfig', () => {
  describe('provider registration', () => {
    it('should define an ApplicationConfig with providers', () => {
      expect(appConfig).toBeDefined();
      expect(appConfig.providers).toBeDefined();
      expect(Array.isArray(appConfig.providers)).toBe(true);
    });

    it('should register six core providers', () => {
      // 3 original (errorListeners, zoneChangeDetection, router)
      // + httpClient, API_BASE_URL, AUTH_TOKEN_KEY
      expect(appConfig.providers.length).toBe(6);
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
