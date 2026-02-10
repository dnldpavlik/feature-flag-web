export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  keycloak: {
    url: string;
    realm: string;
    clientId: string;
  };
}

export const environment: Environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'homelab',
    clientId: 'feature-flags-ui',
  },
};
