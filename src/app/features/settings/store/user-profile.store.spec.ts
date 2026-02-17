import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, KeycloakEvent } from 'keycloak-angular';

import { UserProfileStore } from './user-profile.store';
import { injectService } from '@/app/testing';

describe('UserProfileStore', () => {
  let store: UserProfileStore;
  let mockKeycloak: Partial<Keycloak>;
  let eventSignal: ReturnType<typeof signal<KeycloakEvent>>;

  beforeEach(() => {
    mockKeycloak = {
      authenticated: false,
      token: 'mock-token',
      login: jest.fn().mockResolvedValue(undefined),
      logout: jest.fn().mockResolvedValue(undefined),
      loadUserProfile: jest.fn().mockResolvedValue({
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      }),
      resourceAccess: { 'feature-flags-ui': { roles: ['admin'] } },
      realmAccess: { roles: [] },
    };
    eventSignal = signal<KeycloakEvent>({
      type: KeycloakEventType.KeycloakAngularNotInitialized,
    });

    TestBed.configureTestingModule({
      providers: [
        UserProfileStore,
        { provide: Keycloak, useValue: mockKeycloak },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: eventSignal },
      ],
    });

    store = injectService(UserProfileStore);
  });

  describe('initial state', () => {
    it('should have empty profile before auth loads', () => {
      const profile = store.userProfile();
      expect(profile).toBeDefined();
      expect(profile.id).toBe('');
      expect(profile.name).toBe('');
      expect(profile.email).toBe('');
    });

    it('should not be loading initially', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have no error initially', () => {
      expect(store.error()).toBeNull();
    });
  });

  describe('auth sync', () => {
    it('should sync profile from AuthService after authentication', async () => {
      mockKeycloak.authenticated = true;
      eventSignal.set({ type: KeycloakEventType.AuthSuccess });
      TestBed.flushEffects();

      await (mockKeycloak.loadUserProfile as jest.Mock).mock.results[0].value;
      TestBed.flushEffects();

      const profile = store.userProfile();
      expect(profile.id).toBe('testuser');
      expect(profile.name).toBe('Test User');
      expect(profile.email).toBe('test@example.com');
      expect(profile.avatarUrl).toBeNull();
    });

    it('should not sync when auth profile is null', () => {
      TestBed.flushEffects();

      const profile = store.userProfile();
      expect(profile.id).toBe('');
      expect(profile.name).toBe('');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user name', () => {
      store.updateUserProfile({ name: 'Updated Name' });
      expect(store.userProfile().name).toBe('Updated Name');
    });

    it('should update user email', () => {
      store.updateUserProfile({ email: 'new@example.com' });
      expect(store.userProfile().email).toBe('new@example.com');
    });

    it('should update avatar URL', () => {
      store.updateUserProfile({ avatarUrl: 'https://example.com/avatar.png' });
      expect(store.userProfile().avatarUrl).toBe('https://example.com/avatar.png');
    });

    it('should only update provided fields', () => {
      store.updateUserProfile({ email: 'initial@test.com' });
      const originalEmail = store.userProfile().email;
      store.updateUserProfile({ name: 'New Name' });
      expect(store.userProfile().email).toBe(originalEmail);
    });
  });

  describe('loading state', () => {
    it('should set loading state', () => {
      store.setLoading(true);
      expect(store.loading()).toBe(true);
    });

    it('should clear loading state', () => {
      store.setLoading(true);
      store.setLoading(false);
      expect(store.loading()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should set error state', () => {
      store.setError('Something went wrong');
      expect(store.error()).toBe('Something went wrong');
    });

    it('should clear error state', () => {
      store.setError('An error');
      store.clearError();
      expect(store.error()).toBeNull();
    });
  });
});
