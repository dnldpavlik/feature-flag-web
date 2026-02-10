import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { signal, Component } from '@angular/core';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, KeycloakEvent } from 'keycloak-angular';

import { authGuard } from './auth.guard';

@Component({ template: '' })
class DummyComponent {}

describe('authGuard', () => {
  let router: Router;
  let mockKeycloak: Partial<Keycloak>;
  let eventSignal: ReturnType<typeof signal<KeycloakEvent>>;

  beforeEach(() => {
    mockKeycloak = {
      authenticated: false,
      login: jest.fn().mockResolvedValue(undefined),
      resourceAccess: {},
      realmAccess: { roles: [] },
    };
    eventSignal = signal<KeycloakEvent>({
      type: KeycloakEventType.Ready,
      args: true,
    });

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'dashboard', component: DummyComponent },
          { path: 'protected', component: DummyComponent, canActivate: [authGuard] },
        ]),
        { provide: Keycloak, useValue: mockKeycloak },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: eventSignal },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('should allow access when authenticated', async () => {
    mockKeycloak.authenticated = true;
    const success = await router.navigateByUrl('/protected');
    expect(success).toBe(true);
  });

  it('should redirect to keycloak login when not authenticated', async () => {
    mockKeycloak.authenticated = false;
    const success = await router.navigateByUrl('/protected');
    expect(success).toBe(false);
    expect(mockKeycloak.login).toHaveBeenCalled();
  });
});
