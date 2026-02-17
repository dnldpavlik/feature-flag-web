import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import { ButtonComponent } from '@watt/ui';
import { AuthService } from '@/app/core/auth/auth.service';
import { UserProfileStore } from '../../store/user-profile.store';

@Component({
  selector: 'app-user-profile-tab',
  imports: [ButtonComponent],
  templateUrl: './user-profile-tab.html',
  styleUrl: './user-profile-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileTabComponent {
  private readonly userProfileStore = inject(UserProfileStore);
  private readonly authService = inject(AuthService);

  protected readonly userProfile = computed(() => this.userProfileStore.userProfile());
  protected readonly accountUrl = computed(() => this.authService.getAccountUrl());

  // Profile form state (synced from store via effect)
  protected readonly profileName = signal('');
  protected readonly profileEmail = signal('');

  constructor() {
    effect(() => {
      const profile = this.userProfileStore.userProfile();
      this.profileName.set(profile.name);
      this.profileEmail.set(profile.email);
    });
  }

  // Computed values
  protected readonly initials = computed(() => {
    const name = this.userProfile().name;
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  protected onNameInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.profileName.set(value);
  }

  protected onEmailInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.profileEmail.set(value);
  }

  protected saveProfile(): void {
    this.userProfileStore.updateUserProfile({
      name: this.profileName(),
      email: this.profileEmail(),
    });
  }
}
