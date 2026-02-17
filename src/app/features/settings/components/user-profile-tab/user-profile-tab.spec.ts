import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, KeycloakEvent } from 'keycloak-angular';

import { UserProfileStore } from '../../store/user-profile.store';
import { UserProfileTabComponent } from './user-profile-tab';

describe('UserProfileTabComponent', () => {
  let fixture: ComponentFixture<UserProfileTabComponent>;
  let component: UserProfileTabComponent;
  let userProfileStore: UserProfileStore;

  beforeEach(async () => {
    const mockKeycloak: Partial<Keycloak> = {
      authenticated: false,
      login: jest.fn().mockResolvedValue(undefined),
      logout: jest.fn().mockResolvedValue(undefined),
      loadUserProfile: jest.fn().mockResolvedValue({}),
      resourceAccess: {},
      realmAccess: { roles: [] },
    };
    const eventSignal = signal<KeycloakEvent>({
      type: KeycloakEventType.KeycloakAngularNotInitialized,
    });

    await TestBed.configureTestingModule({
      imports: [UserProfileTabComponent],
      providers: [
        UserProfileStore,
        { provide: Keycloak, useValue: mockKeycloak },
        { provide: KEYCLOAK_EVENT_SIGNAL, useValue: eventSignal },
      ],
    }).compileComponents();

    userProfileStore = TestBed.inject(UserProfileStore);
    userProfileStore.updateUserProfile({ name: 'John Doe', email: 'john.doe@example.com' });

    fixture = TestBed.createComponent(UserProfileTabComponent);
    component = fixture.componentInstance;
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

  describe('account security section', () => {
    it('should render manage account link', () => {
      const link = fixture.debugElement.query(By.css('.user-profile-tab__account-link'));
      expect(link).toBeTruthy();
      expect(link.nativeElement.href).toContain('/realms/homelab/account');
    });

    it('should open manage account in new tab', () => {
      const link = fixture.debugElement.query(By.css('.user-profile-tab__account-link'));
      expect(link.nativeElement.target).toBe('_blank');
      expect(link.nativeElement.rel).toContain('noopener');
    });

    it('should have manage account button', () => {
      const button = fixture.debugElement.query(By.css('ui-button.user-profile-tab__account-btn'));
      expect(button).toBeTruthy();
    });

    it('should show account security section title', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Account Security');
    });
  });

  describe('labels and descriptions', () => {
    it('should have section title for profile', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Profile Information');
    });

    it('should have section title for account security', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Account Security');
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
