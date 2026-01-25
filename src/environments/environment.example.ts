/**
 * Environment Configuration Template
 *
 * Copy this file to:
 * - environment.ts (development)
 * - environment.staging.ts (staging)
 * - environment.prod.ts (production)
 *
 * And update the values accordingly.
 */

export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  auth: {
    domain: string;
    clientId: string;
    audience: string;
  };
  features: {
    analytics: boolean;
    auditLog: boolean;
    segments: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    sentryDsn?: string;
  };
}

export const environment: Environment = {
  production: false,

  // Rust Backend API URL
  apiBaseUrl: 'http://localhost:8080/api/v1',

  // Authentication Configuration
  // Update these values based on your auth provider
  auth: {
    domain: 'your-auth-domain.com',
    clientId: 'your-client-id',
    audience: 'https://api.featureflags.local',
  },

  // Feature Toggles for the UI itself
  features: {
    analytics: true,
    auditLog: true,
    segments: true,
  },

  // Logging Configuration
  logging: {
    level: 'debug',
    // sentryDsn: 'https://your-sentry-dsn' // Optional: for error tracking
  },
};
