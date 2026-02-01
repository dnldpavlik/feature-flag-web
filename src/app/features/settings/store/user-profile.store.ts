import { Injectable, signal } from '@angular/core';

import { UserProfile } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class UserProfileStore {
  private readonly _userProfile = signal<UserProfile>({
    id: 'user_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatarUrl: null,
  });

  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly userProfile = this._userProfile.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  updateUserProfile(updates: Partial<Omit<UserProfile, 'id'>>): void {
    this._userProfile.update((profile) => ({
      ...profile,
      ...updates,
    }));
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  clearError(): void {
    this._error.set(null);
  }
}
