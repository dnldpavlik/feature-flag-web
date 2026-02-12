import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { UserProfileStore } from '../../store/user-profile.store';
import { UserProfileTabComponent } from './user-profile-tab';

describe('UserProfileTabComponent', () => {
  let fixture: ComponentFixture<UserProfileTabComponent>;
  let component: UserProfileTabComponent;
  let userProfileStore: UserProfileStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileTabComponent],
      providers: [UserProfileStore],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileTabComponent);
    component = fixture.componentInstance;
    userProfileStore = TestBed.inject(UserProfileStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('profile form', () => {
    it('should render name input', () => {
      const input = fixture.debugElement.query(By.css('input#profile-name'));
      expect(input).toBeTruthy();
    });

    it('should render email input', () => {
      const input = fixture.debugElement.query(By.css('input#profile-email'));
      expect(input).toBeTruthy();
    });

    it('should display current name from store', () => {
      const input = fixture.debugElement.query(By.css('input#profile-name'));
      expect(input.nativeElement.value).toBe(userProfileStore.userProfile().name);
    });

    it('should display current email from store', () => {
      const input = fixture.debugElement.query(By.css('input#profile-email'));
      expect(input.nativeElement.value).toBe(userProfileStore.userProfile().email);
    });

    it('should have save button', () => {
      const button = fixture.debugElement.query(By.css('ui-button.user-profile-tab__save-btn'));
      expect(button).toBeTruthy();
    });

    it('should update store when profile form is saved', () => {
      const nameInput = fixture.debugElement.query(By.css('input#profile-name'));
      const emailInput = fixture.debugElement.query(By.css('input#profile-email'));
      const saveButton = fixture.debugElement.query(
        By.css('ui-button.user-profile-tab__save-btn button'),
      );

      nameInput.nativeElement.value = 'New Name';
      nameInput.nativeElement.dispatchEvent(new Event('input'));
      emailInput.nativeElement.value = 'new@example.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      saveButton.nativeElement.click();
      fixture.detectChanges();

      expect(userProfileStore.userProfile().name).toBe('New Name');
      expect(userProfileStore.userProfile().email).toBe('new@example.com');
    });
  });

  describe('avatar section', () => {
    it('should render avatar placeholder', () => {
      const avatar = fixture.debugElement.query(By.css('.user-profile-tab__avatar'));
      expect(avatar).toBeTruthy();
    });

    it('should show initials when no avatar', () => {
      userProfileStore.updateUserProfile({ avatarUrl: null, name: 'John Doe' });
      fixture.detectChanges();

      const initials = fixture.debugElement.query(By.css('.user-profile-tab__avatar-initials'));
      expect(initials).toBeTruthy();
      expect(initials.nativeElement.textContent.trim()).toBe('JD');
    });

    it('should show first two characters for single-word name', () => {
      userProfileStore.updateUserProfile({ avatarUrl: null, name: 'Admin' });
      fixture.detectChanges();

      const initials = fixture.debugElement.query(By.css('.user-profile-tab__avatar-initials'));
      expect(initials).toBeTruthy();
      expect(initials.nativeElement.textContent.trim()).toBe('AD');
    });
  });

  describe('password change form', () => {
    it('should render current password input', () => {
      const input = fixture.debugElement.query(By.css('input#current-password'));
      expect(input).toBeTruthy();
      expect(input.nativeElement.type).toBe('password');
    });

    it('should render new password input', () => {
      const input = fixture.debugElement.query(By.css('input#new-password'));
      expect(input).toBeTruthy();
      expect(input.nativeElement.type).toBe('password');
    });

    it('should render confirm password input', () => {
      const input = fixture.debugElement.query(By.css('input#confirm-password'));
      expect(input).toBeTruthy();
      expect(input.nativeElement.type).toBe('password');
    });

    it('should have change password button', () => {
      const button = fixture.debugElement.query(By.css('ui-button.user-profile-tab__password-btn'));
      expect(button).toBeTruthy();
    });

    it('should disable change password button when fields are empty', () => {
      const button = fixture.debugElement.query(
        By.css('ui-button.user-profile-tab__password-btn button'),
      );
      expect(button.nativeElement.disabled).toBe(true);
    });

    it('should enable change password button when all fields are filled', () => {
      const currentPassword = fixture.debugElement.query(By.css('input#current-password'));
      const newPassword = fixture.debugElement.query(By.css('input#new-password'));
      const confirmPassword = fixture.debugElement.query(By.css('input#confirm-password'));

      currentPassword.nativeElement.value = 'oldPassword123';
      currentPassword.nativeElement.dispatchEvent(new Event('input'));
      newPassword.nativeElement.value = 'newPassword456';
      newPassword.nativeElement.dispatchEvent(new Event('input'));
      confirmPassword.nativeElement.value = 'newPassword456';
      confirmPassword.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const button = fixture.debugElement.query(
        By.css('ui-button.user-profile-tab__password-btn button'),
      );
      expect(button.nativeElement.disabled).toBe(false);
    });

    it('should show error when passwords do not match', () => {
      const newPassword = fixture.debugElement.query(By.css('input#new-password'));
      const confirmPassword = fixture.debugElement.query(By.css('input#confirm-password'));

      newPassword.nativeElement.value = 'newPassword456';
      newPassword.nativeElement.dispatchEvent(new Event('input'));
      confirmPassword.nativeElement.value = 'differentPassword';
      confirmPassword.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const error = fixture.debugElement.query(By.css('.user-profile-tab__password-error'));
      expect(error).toBeTruthy();
      expect(error.nativeElement.textContent).toContain('Passwords do not match');
    });

    it('should clear form fields when password change succeeds', () => {
      const currentPassword = fixture.debugElement.query(By.css('input#current-password'));
      const newPassword = fixture.debugElement.query(By.css('input#new-password'));
      const confirmPassword = fixture.debugElement.query(By.css('input#confirm-password'));

      currentPassword.nativeElement.value = 'oldPassword123';
      currentPassword.nativeElement.dispatchEvent(new Event('input'));
      newPassword.nativeElement.value = 'newPassword456';
      newPassword.nativeElement.dispatchEvent(new Event('input'));
      confirmPassword.nativeElement.value = 'newPassword456';
      confirmPassword.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const button = fixture.debugElement.query(
        By.css('ui-button.user-profile-tab__password-btn button'),
      );
      button.nativeElement.click();
      fixture.detectChanges();

      expect(component['currentPassword']()).toBe('');
      expect(component['newPassword']()).toBe('');
      expect(component['confirmPassword']()).toBe('');
    });

    it('should not change password when validation fails', () => {
      // Call changePassword directly without valid input
      component['changePassword']();

      // Fields should remain empty (unchanged)
      expect(component['currentPassword']()).toBe('');
      expect(component['newPassword']()).toBe('');
      expect(component['confirmPassword']()).toBe('');
    });
  });

  describe('labels and descriptions', () => {
    it('should have section title for profile', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Profile Information');
    });

    it('should have section title for password', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Change Password');
    });

    it('should have label for name', () => {
      const label = fixture.debugElement.query(By.css('label[for="profile-name"]'));
      expect(label).toBeTruthy();
    });

    it('should have label for email', () => {
      const label = fixture.debugElement.query(By.css('label[for="profile-email"]'));
      expect(label).toBeTruthy();
    });
  });
});
