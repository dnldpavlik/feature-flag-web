export type { Environment } from './environment.model';
import type { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'homelab',
    clientId: 'feature-flags-ui',
  },
};
