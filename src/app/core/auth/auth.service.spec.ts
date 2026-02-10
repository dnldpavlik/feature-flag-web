import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, KeycloakEvent } from 'keycloak-angular';

import { AuthService } from './auth.service';
import { AUTH_ROLES } from './auth.models';

function createMockKeycloak(overrides: Partial<Keycloak> = {}): Partial<Keycloak> {
  return {
    authenticated: false,
    token: undefined,
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn().mockResolvedValue(undefined),
    loadUserProfile: jest.fn().mockResolvedValue({
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }),
    resourceAccess: {},
    realmAccess: { roles: [] },
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let mockKeycloak: Partial<Keycloak>;
  let eventSignal: ReturnType<typeof signal<KeycloakEvent>>;

  beforeEach(() => {
    mockKeycloak = createMockKeycloak();
    eventSignal = signal<KeycloakEvent>({
      type: KeycloakEventType.KeycloakAngularNotInitialized,
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: Keycloak, useValue: mockKeycloak },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: eventSignal },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  describe('isAuthenticated', () => {
    it('should be false initially', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should be true after Ready event when keycloak is authenticated', () => {
      mockKeycloak.authenticated = true;
      eventSignal.set({ type: KeycloakEventType.Ready, args: true });
      TestBed.flushEffects();

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should be true after AuthSuccess event when keycloak is authenticated', () => {
      mockKeycloak.authenticated = true;
      eventSignal.set({ type: KeycloakEventType.AuthSuccess });
      TestBed.flushEffects();

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should be true after AuthRefreshSuccess event when keycloak is authenticated', () => {
      mockKeycloak.authenticated = true;
      eventSignal.set({ type: KeycloakEventType.AuthRefreshSuccess });
      TestBed.flushEffects();

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should be false after Ready event when keycloak is not authenticated', () => {
      mockKeycloak.authenticated = false;
      eventSignal.set({ type: KeycloakEventType.Ready, args: false });
      TestBed.flushEffects();

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('userProfile', () => {
    it('should be null initially', () => {
      expect(service.userProfile()).toBeNull();
    });

    it('should load user profile after authentication', async () => {
      mockKeycloak.authenticated = true;
      eventSignal.set({ type: KeycloakEventType.AuthSuccess });
      TestBed.flushEffects();

      // Wait for loadUserProfile promise
      await (mockKeycloak.loadUserProfile as jest.Mock).mock.results[0].value;

      expect(service.userProfile()).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
      });
    });

    it('should set null profile on load failure', async () => {
      (mockKeycloak.loadUserProfile as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      mockKeycloak.authenticated = true;
      eventSignal.set({ type: KeycloakEventType.AuthSuccess });
      TestBed.flushEffects();

      // Wait for the rejected promise
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(service.userProfile()).toBeNull();
    });

    it('should handle profile with undefined fields', async () => {
      (mockKeycloak.loadUserProfile as jest.Mock).mockResolvedValueOnce({});

      mockKeycloak.authenticated = true;
      eventSignal.set({ type: KeycloakEventType.AuthSuccess });
      TestBed.flushEffects();

      await (mockKeycloak.loadUserProfile as jest.Mock).mock.results[0].value;

      expect(service.userProfile()).toEqual({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        fullName: '',
      });
    });

    it('should handle profile with only first name', async () => {
      (mockKeycloak.loadUserProfile as jest.Mock).mockResolvedValueOnce({
        username: 'user1',
        email: 'user1@test.com',
        firstName: 'User1',
        lastName: '',
      });

      mockKeycloak.authenticated = true;
      eventSignal.set({ type: KeycloakEventType.AuthSuccess });
      TestBed.flushEffects();

      await (mockKeycloak.loadUserProfile as jest.Mock).mock.results[0].value;

      expect(service.userProfile()?.fullName).toBe('User1');
    });
  });

  describe('roles', () => {
    it('should be empty initially', () => {
      expect(service.roles()).toEqual([]);
    });

    it('should load client roles after authentication', () => {
      mockKeycloak.authenticated = true;
      mockKeycloak.resourceAccess = {
        'feature-flags-ui': { roles: ['admin', 'user'] },
      };
      mockKeycloak.realmAccess = { roles: [] };

      eventSignal.set({ type: KeycloakEventType.AuthSuccess });
      TestBed.flushEffects();

      expect(service.roles()).toContain('admin');
      expect(service.roles()).toContain('user');
    });

    it('should load realm roles after authentication', () => {
      mockKeycloak.authenticated = true;
      mockKeycloak.resourceAccess = {};
      mockKeycloak.realmAccess = { roles: ['realm-admin'] };

      eventSignal.set({ type: KeycloakEventType.AuthSuccess });
      TestBed.flushEffects();

      expect(service.roles()).toContain('realm-admin');
    });

    it('should handle undefined realmAccess', () => {
      mockKeycloak.authenticated = true;
      mockKeycloak.resourceAccess = {
        'feature-flags-ui': { roles: ['admin'] },
      };
      mockKeycloak.realmAccess = undefined;

      eventSignal.set({ type: KeycloakEventType.AuthSuccess });
      TestBed.flushEffects();

      expect(service.roles()).toEqual(['admin']);
    });

    it('should combine realm and client roles', () => {
      mockKeycloak.authenticated = true;
      mockKeycloak.resourceAccess = {
        'feature-flags-ui': { roles: ['admin'] },
      };
      mockKeycloak.realmAccess = { roles: ['realm-user'] };

      eventSignal.set({ type: KeycloakEventType.AuthSuccess });
      TestBed.flushEffects();

      expect(service.roles()).toEqual(['realm-user', 'admin']);
    });
  });

  describe('token', () => {
    it('should return keycloak token', () => {
      (mockKeycloak as { token: string }).token = 'test-token-123';
      expect(service.token()).toBe('test-token-123');
    });

    it('should return undefined when no token', () => {
      expect(service.token()).toBeUndefined();
    });
  });

  describe('login', () => {
    it('should call keycloak login', async () => {
      await service.login();
      expect(mockKeycloak.login).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should call keycloak logout with redirect URI', async () => {
      await service.logout();
      expect(mockKeycloak.logout).toHaveBeenCalledWith({
        redirectUri: window.location.origin,
      });
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the role', () => {
      mockKeycloak.authenticated = true;
      mockKeycloak.resourceAccess = {
        'feature-flags-ui': { roles: ['admin'] },
      };
      mockKeycloak.realmAccess = { roles: [] };

      eventSignal.set({ type: KeycloakEventType.AuthSuccess });
      TestBed.flushEffects();

      expect(service.hasRole('admin')).toBe(true);
    });

    it('should return false when user lacks the role', () => {
      mockKeycloak.authenticated = true;
      mockKeycloak.resourceAccess = {
        'feature-flags-ui': { roles: ['user'] },
      };
      mockKeycloak.realmAccess = { roles: [] };

      eventSignal.set({ type: KeycloakEventType.AuthSuccess });
      TestBed.flushEffects();

      expect(service.hasRole('admin')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true when user has admin role', () => {
      mockKeycloak.authenticated = true;
      mockKeycloak.resourceAccess = {
        'feature-flags-ui': { roles: ['admin'] },
      };
      mockKeycloak.realmAccess = { roles: [] };

      eventSignal.set({ type: KeycloakEventType.AuthSuccess });
      TestBed.flushEffects();

      expect(service.isAdmin()).toBe(true);
    });

    it('should return false when user lacks admin role', () => {
      mockKeycloak.authenticated = true;
      mockKeycloak.resourceAccess = {
        'feature-flags-ui': { roles: ['user'] },
      };
      mockKeycloak.realmAccess = { roles: [] };

      eventSignal.set({ type: KeycloakEventType.AuthSuccess });
      TestBed.flushEffects();

      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('AUTH_ROLES', () => {
    it('should define admin and user roles', () => {
      expect(AUTH_ROLES.ADMIN).toBe('admin');
      expect(AUTH_ROLES.USER).toBe('user');
    });
  });
});
