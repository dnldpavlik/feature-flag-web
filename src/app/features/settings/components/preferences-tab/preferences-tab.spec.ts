import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { SettingsStore } from '../../store/settings.store';
import { PreferencesTabComponent } from './preferences-tab';

describe('PreferencesTabComponent', () => {
  let fixture: ComponentFixture<PreferencesTabComponent>;
  let component: PreferencesTabComponent;
  let settingsStore: SettingsStore;
  let environmentStore: EnvironmentStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreferencesTabComponent],
      providers: [SettingsStore, EnvironmentStore],
    }).compileComponents();

    fixture = TestBed.createComponent(PreferencesTabComponent);
    component = fixture.componentInstance;
    settingsStore = TestBed.inject(SettingsStore);
    environmentStore = TestBed.inject(EnvironmentStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default environment selector', () => {
    it('should render environment select', () => {
      const select = fixture.debugElement.query(
        By.css('app-labeled-select')
      );
      expect(select).toBeTruthy();
    });

    it('should display environment options', () => {
      const environments = environmentStore.environments();
      expect(component.environmentOptions().length).toBe(environments.length);
    });

    it('should reflect current default environment', () => {
      settingsStore.updateProjectPreferences({
        defaultEnvironmentId: 'env_staging',
      });
      fixture.detectChanges();

      expect(component.currentDefaultEnvId()).toBe('env_staging');
    });

    it('should update store when default environment changes', () => {
      component.onDefaultEnvironmentChange('env_production');
      expect(settingsStore.projectPreferences().defaultEnvironmentId).toBe(
        'env_production'
      );
    });
  });

  describe('notification toggles', () => {
    it('should render email on flag change checkbox', () => {
      const checkbox = fixture.debugElement.query(
        By.css('input#email-flag-change')
      );
      expect(checkbox).toBeTruthy();
    });

    it('should render email on API key created checkbox', () => {
      const checkbox = fixture.debugElement.query(
        By.css('input#email-api-key')
      );
      expect(checkbox).toBeTruthy();
    });

    it('should reflect current notification settings', () => {
      settingsStore.updateProjectPreferences({
        notifications: {
          emailOnFlagChange: false,
          emailOnApiKeyCreated: true,
          emailDigest: 'daily',
        },
      });
      fixture.detectChanges();

      const flagChangeCheckbox = fixture.debugElement.query(
        By.css('input#email-flag-change')
      );
      const apiKeyCheckbox = fixture.debugElement.query(
        By.css('input#email-api-key')
      );

      expect(flagChangeCheckbox.nativeElement.checked).toBe(false);
      expect(apiKeyCheckbox.nativeElement.checked).toBe(true);
    });

    it('should update flag change notification setting', () => {
      const checkbox = fixture.debugElement.query(
        By.css('input#email-flag-change')
      );
      const currentValue =
        settingsStore.projectPreferences().notifications.emailOnFlagChange;

      checkbox.nativeElement.click();
      fixture.detectChanges();

      expect(
        settingsStore.projectPreferences().notifications.emailOnFlagChange
      ).toBe(!currentValue);
    });

    it('should update API key notification setting', () => {
      const checkbox = fixture.debugElement.query(By.css('input#email-api-key'));
      const currentValue =
        settingsStore.projectPreferences().notifications.emailOnApiKeyCreated;

      checkbox.nativeElement.click();
      fixture.detectChanges();

      expect(
        settingsStore.projectPreferences().notifications.emailOnApiKeyCreated
      ).toBe(!currentValue);
    });
  });

  describe('email digest frequency', () => {
    it('should render email digest options', () => {
      const radios = fixture.debugElement.queryAll(
        By.css('input[name="email-digest"]')
      );
      expect(radios.length).toBe(3);
    });

    it('should have none option', () => {
      const radio = fixture.debugElement.query(
        By.css('input[name="email-digest"][value="none"]')
      );
      expect(radio).toBeTruthy();
    });

    it('should have daily option', () => {
      const radio = fixture.debugElement.query(
        By.css('input[name="email-digest"][value="daily"]')
      );
      expect(radio).toBeTruthy();
    });

    it('should have weekly option', () => {
      const radio = fixture.debugElement.query(
        By.css('input[name="email-digest"][value="weekly"]')
      );
      expect(radio).toBeTruthy();
    });

    it('should reflect current email digest setting', () => {
      settingsStore.updateProjectPreferences({
        notifications: {
          ...settingsStore.projectPreferences().notifications,
          emailDigest: 'daily',
        },
      });
      fixture.detectChanges();

      const dailyRadio = fixture.debugElement.query(
        By.css('input[name="email-digest"][value="daily"]')
      );
      expect(dailyRadio.nativeElement.checked).toBe(true);
    });

    it('should update email digest setting', () => {
      const noneRadio = fixture.debugElement.query(
        By.css('input[name="email-digest"][value="none"]')
      );
      noneRadio.nativeElement.click();
      fixture.detectChanges();

      expect(
        settingsStore.projectPreferences().notifications.emailDigest
      ).toBe('none');
    });
  });

  describe('labels and descriptions', () => {
    it('should have section title for default environment', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Default Environment');
    });

    it('should have section title for notifications', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Notifications');
    });

    it('should have section title for email digest', () => {
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Email Digest');
    });
  });
});
