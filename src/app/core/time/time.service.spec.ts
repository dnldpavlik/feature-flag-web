import { TestBed } from '@angular/core/testing';

import {
  TimeService,
  TimeProvider,
  defaultTimeProvider,
  createMockTimeProvider,
  createControllableTimeProvider,
} from './time.service';

describe('TimeService', () => {
  let service: TimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return current time as ISO string', () => {
    const before = new Date().toISOString();
    const result = service.now();
    const after = new Date().toISOString();

    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(result >= before).toBe(true);
    expect(result <= after).toBe(true);
  });

  it('should implement TimeProvider interface', () => {
    const provider: TimeProvider = service;
    expect(typeof provider.now).toBe('function');
  });
});

describe('defaultTimeProvider', () => {
  it('should return current time as ISO string', () => {
    const before = new Date().toISOString();
    const result = defaultTimeProvider.now();
    const after = new Date().toISOString();

    expect(result >= before).toBe(true);
    expect(result <= after).toBe(true);
  });
});

describe('createMockTimeProvider', () => {
  it('should return fixed time', () => {
    const fixedTime = '2024-06-15T12:00:00.000Z';
    const provider = createMockTimeProvider(fixedTime);

    expect(provider.now()).toBe(fixedTime);
    expect(provider.now()).toBe(fixedTime);
  });

  it('should use default time when not specified', () => {
    const provider = createMockTimeProvider();

    expect(provider.now()).toBe('2024-01-01T00:00:00.000Z');
  });
});

describe('createControllableTimeProvider', () => {
  it('should return initial time', () => {
    const { provider } = createControllableTimeProvider('2024-03-15T10:00:00.000Z');

    expect(provider.now()).toBe('2024-03-15T10:00:00.000Z');
  });

  it('should use default start time when not specified', () => {
    const { provider } = createControllableTimeProvider();

    expect(provider.now()).toBe('2024-01-01T00:00:00.000Z');
  });

  it('should advance time by specified milliseconds', () => {
    const { provider, advance } = createControllableTimeProvider('2024-01-01T00:00:00.000Z');

    advance(1000); // 1 second
    expect(provider.now()).toBe('2024-01-01T00:00:01.000Z');

    advance(60000); // 1 minute
    expect(provider.now()).toBe('2024-01-01T00:01:01.000Z');
  });

  it('should set time to specific value', () => {
    const { provider, setTime } = createControllableTimeProvider();

    setTime('2025-12-25T00:00:00.000Z');
    expect(provider.now()).toBe('2025-12-25T00:00:00.000Z');
  });

  it('should track number of calls', () => {
    const { provider, getCalls } = createControllableTimeProvider();

    expect(getCalls()).toBe(0);

    provider.now();
    expect(getCalls()).toBe(1);

    provider.now();
    provider.now();
    expect(getCalls()).toBe(3);
  });

  it('should support combined operations', () => {
    const { provider, advance, setTime, getCalls } = createControllableTimeProvider(
      '2024-01-01T00:00:00.000Z',
    );

    const t1 = provider.now();
    expect(t1).toBe('2024-01-01T00:00:00.000Z');

    advance(3600000); // 1 hour
    const t2 = provider.now();
    expect(t2).toBe('2024-01-01T01:00:00.000Z');

    setTime('2024-06-15T12:00:00.000Z');
    const t3 = provider.now();
    expect(t3).toBe('2024-06-15T12:00:00.000Z');

    expect(getCalls()).toBe(3);
  });
});
