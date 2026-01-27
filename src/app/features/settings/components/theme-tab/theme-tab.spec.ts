import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SettingsStore } from '../../store/settings.store';
import { ThemeTabComponent } from './theme-tab';

describe('ThemeTabComponent', () => {
  let fixture: ComponentFixture<ThemeTabComponent>;
  let component: ThemeTabComponent;
  let settingsStore: SettingsStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeTabComponent],
      providers: [SettingsStore],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeTabComponent);
    component = fixture.componentInstance;
    settingsStore = TestBed.inject(SettingsStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('theme mode selector', () => {
    it('should render theme mode options', () => {
      const radios = fixture.debugElement.queryAll(
        By.css('input[name="theme-mode"]')
      );
      expect(radios.length).toBe(3);
    });

    it('should have light option', () => {
      const lightRadio = fixture.debugElement.query(
        By.css('input[value="light"]')
      );
      expect(lightRadio).toBeTruthy();
    });

    it('should have dark option', () => {
      const darkRadio = fixture.debugElement.query(
        By.css('input[value="dark"]')
      );
      expect(darkRadio).toBeTruthy();
    });

    it('should have system option', () => {
      const systemRadio = fixture.debugElement.query(
        By.css('input[value="system"]')
      );
      expect(systemRadio).toBeTruthy();
    });

    it('should reflect current theme mode from store', () => {
      settingsStore.updateThemePreferences({ mode: 'dark' });
      fixture.detectChanges();

      const darkRadio = fixture.debugElement.query(
        By.css('input[value="dark"]')
      );
      expect(darkRadio.nativeElement.checked).toBe(true);
    });

    it('should update store when theme mode changes', () => {
      const lightRadio = fixture.debugElement.query(
        By.css('input[value="light"]')
      );
      lightRadio.nativeElement.click();
      fixture.detectChanges();

      expect(settingsStore.themePreferences().mode).toBe('light');
    });
  });

  describe('reduced motion toggle', () => {
    it('should render reduced motion checkbox', () => {
      const checkbox = fixture.debugElement.query(
        By.css('input[type="checkbox"]#reduced-motion')
      );
      expect(checkbox).toBeTruthy();
    });

    it('should reflect current reduced motion state', () => {
      settingsStore.updateThemePreferences({ reducedMotion: true });
      fixture.detectChanges();

      const checkbox = fixture.debugElement.query(
        By.css('input#reduced-motion')
      );
      expect(checkbox.nativeElement.checked).toBe(true);
    });

    it('should update store when reduced motion toggles', () => {
      const checkbox = fixture.debugElement.query(
        By.css('input#reduced-motion')
      );
      checkbox.nativeElement.click();
      fixture.detectChanges();

      expect(settingsStore.themePreferences().reducedMotion).toBe(true);
    });
  });

  describe('compact mode toggle', () => {
    it('should render compact mode checkbox', () => {
      const checkbox = fixture.debugElement.query(
        By.css('input[type="checkbox"]#compact-mode')
      );
      expect(checkbox).toBeTruthy();
    });

    it('should reflect current compact mode state', () => {
      settingsStore.updateThemePreferences({ compactMode: true });
      fixture.detectChanges();

      const checkbox = fixture.debugElement.query(By.css('input#compact-mode'));
      expect(checkbox.nativeElement.checked).toBe(true);
    });

    it('should update store when compact mode toggles', () => {
      const checkbox = fixture.debugElement.query(By.css('input#compact-mode'));
      checkbox.nativeElement.click();
      fixture.detectChanges();

      expect(settingsStore.themePreferences().compactMode).toBe(true);
    });
  });

  describe('labels and descriptions', () => {
    it('should have label for theme mode section', () => {
      const label = fixture.debugElement.query(By.css('.theme-tab__section-title'));
      expect(label.nativeElement.textContent).toContain('Theme');
    });

    it('should have label for reduced motion option', () => {
      const label = fixture.debugElement.query(
        By.css('label[for="reduced-motion"]')
      );
      expect(label).toBeTruthy();
      expect(label.nativeElement.textContent).toContain('Reduce motion');
    });

    it('should have label for compact mode option', () => {
      const label = fixture.debugElement.query(
        By.css('label[for="compact-mode"]')
      );
      expect(label).toBeTruthy();
      expect(label.nativeElement.textContent).toContain('Compact mode');
    });
  });
});
