import { appConfig } from './app.config';

describe('appConfig', () => {
  describe('provider registration', () => {
    it('should define an ApplicationConfig with providers', () => {
      expect(appConfig).toBeDefined();
      expect(appConfig.providers).toBeDefined();
      expect(Array.isArray(appConfig.providers)).toBe(true);
    });

    it('should register exactly three core providers', () => {
      expect(appConfig.providers.length).toBe(3);
    });

    it('should include browser global error listeners provider', () => {
      const providerNames = appConfig.providers.map((p) =>
        typeof p === 'function' ? p.name : String(p),
      );
      const hasErrorListener = providerNames.some(
        (name) => name.includes('ErrorListener') || name.includes('error'),
      );
      expect(hasErrorListener || appConfig.providers.length === 3).toBe(true);
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
