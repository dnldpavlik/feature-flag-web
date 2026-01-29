import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockDocument: Document;
  let mockLocalStorage: Record<string, string>;
  let mediaQueryListeners: ((e: MediaQueryListEvent) => void)[];

  const mockMatchMedia = (matches: boolean) => {
    return (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: (_event: string, listener: (e: MediaQueryListEvent) => void) => {
        mediaQueryListeners.push(listener);
      },
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });
  };

  const flushEffects = () => TestBed.flushEffects();

  beforeEach(() => {
    mockLocalStorage = {};
    mediaQueryListeners = [];

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => mockLocalStorage[key] ?? null,
        setItem: (key: string, value: string) => {
          mockLocalStorage[key] = value;
        },
        removeItem: (key: string) => {
          delete mockLocalStorage[key];
        },
        clear: () => {
          mockLocalStorage = {};
        },
      },
      writable: true,
    });

    // Mock matchMedia - default to light
    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia(false),
      writable: true,
    });

    // Create a mock document
    mockDocument = document;

    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: DOCUMENT, useValue: mockDocument }],
    });

    service = TestBed.inject(ThemeService);
    flushEffects();
  });

  afterEach(() => {
    // Clean up data-theme attribute
    mockDocument.documentElement.removeAttribute('data-theme');
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should default to system mode when no localStorage value', () => {
      expect(service.mode()).toBe('system');
    });

    it('should load saved mode from localStorage', () => {
      mockLocalStorage['theme-mode'] = 'dark';

      // Force re-initialization to pick up localStorage value
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService, { provide: DOCUMENT, useValue: mockDocument }],
      });
      const freshService = TestBed.inject(ThemeService);

      expect(freshService.mode()).toBe('dark');
    });

    it('should apply theme to document on initialization', () => {
      expect(mockDocument.documentElement.getAttribute('data-theme')).toBeTruthy();
    });
  });

  describe('mode signal', () => {
    it('should expose current mode as readonly signal', () => {
      expect(service.mode()).toBe('system');
    });
  });

  describe('activeTheme signal', () => {
    it('should return light when mode is light', () => {
      service.setMode('light');
      expect(service.activeTheme()).toBe('light');
    });

    it('should return dark when mode is dark', () => {
      service.setMode('dark');
      expect(service.activeTheme()).toBe('dark');
    });

    it('should return system preference when mode is system (light)', () => {
      // System starts as light (mockMatchMedia(false) in beforeEach)
      service.setMode('system');
      expect(service.activeTheme()).toBe('light');
    });

    it('should return system preference when mode is system (dark)', () => {
      service.setMode('system');

      // Simulate system preference change to dark
      mediaQueryListeners.forEach((listener) => {
        listener({ matches: true } as MediaQueryListEvent);
      });

      expect(service.activeTheme()).toBe('dark');
    });
  });

  describe('setMode', () => {
    it('should update mode signal', () => {
      service.setMode('dark');
      expect(service.mode()).toBe('dark');
    });

    it('should persist mode to localStorage', () => {
      service.setMode('dark');
      expect(mockLocalStorage['theme-mode']).toBe('dark');
    });

    it('should apply theme to document', () => {
      service.setMode('dark');
      flushEffects();
      expect(mockDocument.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should apply light theme when mode is light', () => {
      service.setMode('light');
      flushEffects();
      expect(mockDocument.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should resolve system mode to actual theme', () => {
      service.setMode('system');

      // Simulate system preference change to dark
      mediaQueryListeners.forEach((listener) => {
        listener({ matches: true } as MediaQueryListEvent);
      });
      flushEffects();

      expect(mockDocument.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('system preference changes', () => {
    it('should update theme when system preference changes and mode is system', () => {
      service.setMode('system');
      flushEffects();

      // Simulate system preference change to dark
      mediaQueryListeners.forEach((listener) => {
        listener({ matches: true } as MediaQueryListEvent);
      });
      flushEffects();

      expect(service.activeTheme()).toBe('dark');
      expect(mockDocument.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should not update theme when system preference changes but mode is explicit', () => {
      service.setMode('light');
      flushEffects();

      // Simulate system preference change to dark
      mediaQueryListeners.forEach((listener) => {
        listener({ matches: true } as MediaQueryListEvent);
      });
      flushEffects();

      expect(service.activeTheme()).toBe('light');
      expect(mockDocument.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('isDark signal', () => {
    it('should return true when active theme is dark', () => {
      service.setMode('dark');
      flushEffects();
      expect(service.isDark()).toBe(true);
    });

    it('should return false when active theme is light', () => {
      service.setMode('light');
      flushEffects();
      expect(service.isDark()).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should toggle from light to dark', () => {
      service.setMode('light');
      flushEffects();
      service.toggle();
      flushEffects();
      expect(service.mode()).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      service.setMode('dark');
      flushEffects();
      service.toggle();
      flushEffects();
      expect(service.mode()).toBe('light');
    });

    it('should toggle from system to opposite of current active theme', () => {
      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia(false), // light
        writable: true,
      });

      service.setMode('system');
      flushEffects();
      service.toggle();
      flushEffects();
      expect(service.mode()).toBe('dark');
    });
  });

  describe('fallbacks when browser APIs unavailable', () => {
    it('should default to system mode when localStorage is unavailable', () => {
      // Remove localStorage
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService, { provide: DOCUMENT, useValue: mockDocument }],
      });
      const freshService = TestBed.inject(ThemeService);

      expect(freshService.mode()).toBe('system');
    });

    it('should not throw when saving mode without localStorage', () => {
      // Remove localStorage
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService, { provide: DOCUMENT, useValue: mockDocument }],
      });
      const freshService = TestBed.inject(ThemeService);

      expect(() => freshService.setMode('dark')).not.toThrow();
      expect(freshService.mode()).toBe('dark');
    });

    it('should default to light system preference when matchMedia is unavailable', () => {
      // Remove matchMedia
      Object.defineProperty(window, 'matchMedia', {
        value: undefined,
        writable: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService, { provide: DOCUMENT, useValue: mockDocument }],
      });
      const freshService = TestBed.inject(ThemeService);
      TestBed.flushEffects();

      // With system mode and no matchMedia, should default to light
      expect(freshService.activeTheme()).toBe('light');
    });

    it('should not throw when setting up listener without matchMedia', () => {
      // Remove matchMedia
      Object.defineProperty(window, 'matchMedia', {
        value: undefined,
        writable: true,
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService, { provide: DOCUMENT, useValue: mockDocument }],
      });

      expect(() => TestBed.inject(ThemeService)).not.toThrow();
    });
  });
});
