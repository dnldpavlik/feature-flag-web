import { Injectable } from '@angular/core';

/**
 * Interface for time providers.
 * Allows injection of custom time sources for testing.
 */
export interface TimeProvider {
  /** Returns the current timestamp as an ISO 8601 string */
  now(): string;
}

/**
 * Default time provider using the system clock.
 * This is the production implementation.
 */
export const defaultTimeProvider: TimeProvider = {
  now: () => new Date().toISOString(),
};

/**
 * Injectable time service for providing current timestamps.
 *
 * In production, this uses the system clock. In tests, it can be
 * replaced with a mock that returns controlled timestamps.
 *
 * @example
 * ```typescript
 * // In a component or service
 * private readonly time = inject(TimeService);
 * const timestamp = this.time.now();
 *
 * // In tests
 * { provide: TimeService, useValue: { now: () => '2024-01-01T00:00:00.000Z' } }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class TimeService implements TimeProvider {
  /**
   * Returns the current timestamp as an ISO 8601 string.
   */
  now(): string {
    return new Date().toISOString();
  }
}

/**
 * Creates a mock time provider for testing.
 *
 * @param fixedTime - Optional fixed time to return, defaults to a test timestamp
 * @returns A TimeProvider that returns the fixed time
 *
 * @example
 * ```typescript
 * const mockTime = createMockTimeProvider('2024-06-15T12:00:00.000Z');
 * const store = new TestStore({ timeProvider: mockTime });
 * ```
 */
export function createMockTimeProvider(fixedTime = '2024-01-01T00:00:00.000Z'): TimeProvider {
  return { now: () => fixedTime };
}

/**
 * Creates a time provider that tracks calls and allows advancing time.
 *
 * @param startTime - Initial time, defaults to a test timestamp
 * @returns An object with the provider and control methods
 *
 * @example
 * ```typescript
 * const { provider, advance, setTime, getCalls } = createControllableTimeProvider();
 * store.add(item);
 * advance(1000); // advance by 1 second
 * store.update(id, updates);
 * expect(getCalls()).toBe(2);
 * ```
 */
export function createControllableTimeProvider(startTime = '2024-01-01T00:00:00.000Z'): {
  provider: TimeProvider;
  advance: (ms: number) => void;
  setTime: (time: string) => void;
  getCalls: () => number;
} {
  let currentTime = new Date(startTime);
  let calls = 0;

  return {
    provider: {
      now: () => {
        calls++;
        return currentTime.toISOString();
      },
    },
    advance: (ms: number) => {
      currentTime = new Date(currentTime.getTime() + ms);
    },
    setTime: (time: string) => {
      currentTime = new Date(time);
    },
    getCalls: () => calls,
  };
}
