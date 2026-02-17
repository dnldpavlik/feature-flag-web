import { effect, inject, Injectable, signal } from '@angular/core';

import { AuthService } from '@/app/core/auth/auth.service';
import { SettingsUserProfile } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class UserProfileStore {
  private readonly authService = inject(AuthService);

  private readonly _userProfile = signal<SettingsUserProfile>({
    id: '',
    name: '',
    email: '',
    avatarUrl: null,
  });

  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly userProfile = this._userProfile.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    effect(() => {
      const authProfile = this.authService.userProfile();
      if (authProfile) {
        this._userProfile.set({
          id: authProfile.username,
          name: authProfile.fullName,
          email: authProfile.email,
          avatarUrl: null,
        });
      }
    });
  }

  updateUserProfile(updates: Partial<Omit<SettingsUserProfile, 'id'>>): void {
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
