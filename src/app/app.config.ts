import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  provideKeycloak,
  withAutoRefreshToken,
  AutoRefreshTokenService,
  UserActivityService,
  includeBearerTokenInterceptor,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
} from 'keycloak-angular';

import { environment } from '@/environments/environment';
import { API_BASE_URL } from './core/api/api.tokens';
import { errorInterceptor } from './core/api/error.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideKeycloak({
      config: environment.keycloak,
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false,
      },
      providers: [AutoRefreshTokenService, UserActivityService],
      features: [
        withAutoRefreshToken({
          sessionTimeout: 300000,
          onInactivityTimeout: 'logout',
        }),
      ],
    }),
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor, errorInterceptor])),
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [{ urlPattern: /\/api\//i }],
    },
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
  ],
};
