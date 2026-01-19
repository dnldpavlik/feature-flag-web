/**
 * Jest Setup File
 * 
 * This file is run before each test file.
 */

import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import '@testing-library/jest-dom';

setupZoneTestEnv();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Suppress specific Angular warnings in tests
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  // Filter out known Angular warnings that don't affect tests
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('NG0') || message.includes('Angular'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      ngJest: {
        skipNgcc: boolean;
        tsconfig: string;
      };
    }
  }
}
