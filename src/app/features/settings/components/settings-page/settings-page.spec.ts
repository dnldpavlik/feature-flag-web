import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EnvironmentStore } from '@/app/shared/store/environment.store';
import { SettingsPageComponent } from './settings-page';
import { MOCK_API_PROVIDERS, injectService } from '@/app/testing';

describe('SettingsPageComponent', () => {
  let fixture: ComponentFixture<SettingsPageComponent>;
  let component: SettingsPageComponent;
  let environmentStore: EnvironmentStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPageComponent],
      providers: [...MOCK_API_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPageComponent);
    component = fixture.componentInstance;
    environmentStore = injectService(EnvironmentStore);
    await environmentStore.loadEnvironments();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render the settings heading', () => {
      const heading = fixture.debugElement.query(By.css('h1'));
      expect(heading).toBeTruthy();
      expect(heading.nativeElement.textContent).toContain('Settings');
    });

    it('should render the tabs component', () => {
      const tabs = fixture.debugElement.query(By.css('app-tabs'));
      expect(tabs).toBeTruthy();
    });

    it('should have 4 tabs', () => {
      expect(component.tabs.length).toBe(4);
    });

    it('should have profile tab', () => {
      const profileTab = component.tabs.find((t) => t.id === 'profile');
      expect(profileTab).toBeDefined();
      expect(profileTab?.label).toBe('Profile');
    });

    it('should have preferences tab', () => {
      const prefsTab = component.tabs.find((t) => t.id === 'preferences');
      expect(prefsTab).toBeDefined();
      expect(prefsTab?.label).toBe('Preferences');
    });

    it('should have api-keys tab', () => {
      const keysTab = component.tabs.find((t) => t.id === 'api-keys');
      expect(keysTab).toBeDefined();
      expect(keysTab?.label).toBe('API Keys');
    });

    it('should have theme tab', () => {
      const themeTab = component.tabs.find((t) => t.id === 'theme');
      expect(themeTab).toBeDefined();
      expect(themeTab?.label).toBe('Appearance');
    });
  });

  describe('tab switching', () => {
    it('should default to profile tab', () => {
      expect(component.activeTab()).toBe('profile');
    });

    it('should switch to preferences tab', () => {
      component.onTabChange('preferences');
      fixture.detectChanges();
      expect(component.activeTab()).toBe('preferences');
    });

    it('should switch to api-keys tab', () => {
      component.onTabChange('api-keys');
      fixture.detectChanges();
      expect(component.activeTab()).toBe('api-keys');
    });

    it('should switch to theme tab', () => {
      component.onTabChange('theme');
      fixture.detectChanges();
      expect(component.activeTab()).toBe('theme');
    });
  });

  describe('tab content', () => {
    it('should show profile tab content by default', () => {
      const profileTab = fixture.debugElement.query(By.css('app-user-profile-tab'));
      expect(profileTab).toBeTruthy();
    });

    it('should show preferences tab content when selected', () => {
      component.onTabChange('preferences');
      fixture.detectChanges();

      const prefsTab = fixture.debugElement.query(By.css('app-preferences-tab'));
      expect(prefsTab).toBeTruthy();
    });

    it('should show api-keys tab content when selected', () => {
      component.onTabChange('api-keys');
      fixture.detectChanges();

      const keysTab = fixture.debugElement.query(By.css('app-api-keys-tab'));
      expect(keysTab).toBeTruthy();
    });

    it('should show theme tab content when selected', () => {
      component.onTabChange('theme');
      fixture.detectChanges();

      const themeTab = fixture.debugElement.query(By.css('app-theme-tab'));
      expect(themeTab).toBeTruthy();
    });

    it('should hide other tab content when switching', () => {
      // Start on profile
      expect(fixture.debugElement.query(By.css('app-user-profile-tab'))).toBeTruthy();

      // Switch to preferences
      component.onTabChange('preferences');
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('app-user-profile-tab'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('app-preferences-tab'))).toBeTruthy();
    });
  });
});
