import type { Environment } from './environment.model';

export const environment: Environment = {
  production: true,
  apiBaseUrl: '/api/v1',
  keycloak: {
    url: 'https://KEYCLOAK_URL_NOT_SET',
    realm: 'homelab',
    clientId: 'feature-flags-ui',
  },
};
