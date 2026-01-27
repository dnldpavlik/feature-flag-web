import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ButtonComponent } from '@/app/shared/ui/button/button';
import { SettingsStore } from '../../store/settings.store';

@Component({
  selector: 'app-user-profile-tab',
  imports: [ButtonComponent],
  templateUrl: './user-profile-tab.html',
  styleUrl: './user-profile-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileTabComponent {
  private readonly settingsStore = inject(SettingsStore);

  protected readonly userProfile = computed(() =>
    this.settingsStore.userProfile()
  );

  // Profile form state
  protected readonly profileName = signal(this.settingsStore.userProfile().name);
  protected readonly profileEmail = signal(this.settingsStore.userProfile().email);

  // Password form state
  protected readonly currentPassword = signal('');
  protected readonly newPassword = signal('');
  protected readonly confirmPassword = signal('');

  // Computed values
  protected readonly initials = computed(() => {
    const name = this.userProfile().name;
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  protected readonly passwordsMatch = computed(() => {
    const newPwd = this.newPassword();
    const confirmPwd = this.confirmPassword();
    return !newPwd || !confirmPwd || newPwd === confirmPwd;
  });

  protected readonly canChangePassword = computed(() => {
    return (
      this.currentPassword().length > 0 &&
      this.newPassword().length > 0 &&
      this.confirmPassword().length > 0 &&
      this.passwordsMatch()
    );
  });

  protected readonly showPasswordError = computed(() => {
    return (
      this.newPassword().length > 0 &&
      this.confirmPassword().length > 0 &&
      !this.passwordsMatch()
    );
  });

  protected onNameInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.profileName.set(value);
  }

  protected onEmailInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.profileEmail.set(value);
  }

  protected onCurrentPasswordInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.currentPassword.set(value);
  }

  protected onNewPasswordInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.newPassword.set(value);
  }

  protected onConfirmPasswordInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.confirmPassword.set(value);
  }

  protected saveProfile(): void {
    this.settingsStore.updateUserProfile({
      name: this.profileName(),
      email: this.profileEmail(),
    });
  }

  protected changePassword(): void {
    if (!this.canChangePassword()) {
      return;
    }
    // In a real app, this would call an API
    // For now, just clear the form
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
  }
}
