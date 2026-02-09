export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  auth: {
    tokenKey: string;
  };
}

export const environment: Environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  auth: {
    tokenKey: 'ff_api_key',
  },
};
