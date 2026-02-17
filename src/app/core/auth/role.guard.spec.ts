import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { signal, Component } from '@angular/core';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, KeycloakEvent } from 'keycloak-angular';

import { AuthService } from './auth.service';
import { roleGuard } from './role.guard';

@Component({ template: '' })
class DummyComponent {}

describe('roleGuard', () => {
  function setup(
    roles: { clientRoles?: string[]; realmRoles?: string[]; undefinedRealmAccess?: boolean } = {},
  ) {
    const mockKeycloak: Partial<Keycloak> = {
      authenticated: true,
      login: jest.fn().mockResolvedValue(undefined),
      logout: jest.fn().mockResolvedValue(undefined),
      loadUserProfile: jest.fn().mockResolvedValue({
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      }),
      resourceAccess: roles.clientRoles ? { 'feature-flags-ui': { roles: roles.clientRoles } } : {},
      realmAccess: roles.undefinedRealmAccess ? undefined : { roles: roles.realmRoles ?? [] },
    };
    const eventSignal = signal<KeycloakEvent>({
      type: KeycloakEventType.AuthSuccess,
    });

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'dashboard', component: DummyComponent },
          {
            path: 'admin',
            component: DummyComponent,
            canActivate: [roleGuard],
            data: { role: 'admin' },
          },
          {
            path: 'no-role',
            component: DummyComponent,
            canActivate: [roleGuard],
          },
        ]),
        { provide: Keycloak, useValue: mockKeycloak },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: eventSignal },
      ],
    });

    // Ensure AuthService is created and its constructor effect loads roles
    TestBed.inject(AuthService);
    TestBed.flushEffects();

    return TestBed.inject(Router);
  }

  it('should allow access when user has required client role', async () => {
    const router = setup({ clientRoles: ['admin'] });
    await router.navigateByUrl('/admin');
    expect(router.url).toBe('/admin');
  });

  it('should allow access when user has required realm role', async () => {
    const router = setup({ realmRoles: ['admin'] });
    await router.navigateByUrl('/admin');
    expect(router.url).toBe('/admin');
  });

  it('should redirect to dashboard when user lacks required role', async () => {
    const router = setup({ clientRoles: ['user'] });
    await router.navigateByUrl('/admin');
    expect(router.url).toBe('/dashboard');
  });

  it('should allow access when user has role and realmAccess is undefined', async () => {
    const router = setup({ clientRoles: ['admin'], undefinedRealmAccess: true });
    await router.navigateByUrl('/admin');
    expect(router.url).toBe('/admin');
  });

  it('should allow access when no role is required in route data', async () => {
    const router = setup();
    const success = await router.navigateByUrl('/no-role');
    expect(success).toBe(true);
    expect(router.url).toBe('/no-role');
  });
});
