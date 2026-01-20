import { appConfig } from './app.config';

describe('appConfig', () => {
  it('should register core providers', () => {
    expect(appConfig.providers).toBeDefined();
    expect(appConfig.providers.length).toBe(3);
  });
});
