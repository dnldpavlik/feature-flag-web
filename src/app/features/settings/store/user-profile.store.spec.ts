import { TestBed } from '@angular/core/testing';

import { UserProfileStore } from './user-profile.store';
import { injectService } from '@/app/testing';

describe('UserProfileStore', () => {
  let store: UserProfileStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserProfileStore],
    });

    store = injectService(UserProfileStore);
  });

  describe('initial state', () => {
    it('should have default user profile', () => {
      const profile = store.userProfile();
      expect(profile).toBeDefined();
      expect(profile.id).toBeDefined();
      expect(profile.name).toBeDefined();
      expect(profile.email).toBeDefined();
    });

    it('should not be loading initially', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have no error initially', () => {
      expect(store.error()).toBeNull();
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
