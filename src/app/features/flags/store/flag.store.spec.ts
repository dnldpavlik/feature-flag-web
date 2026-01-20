import { TestBed } from '@angular/core/testing';

import { FlagStore } from './flag.store';

describe('FlagStore', () => {
  let store: FlagStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlagStore],
    });

    store = TestBed.inject(FlagStore);
  });

  it('should seed initial flags', () => {
    expect(store.flags().length).toBeGreaterThan(0);
    expect(store.totalCount()).toBe(store.flags().length);
  });

  it('should add a new flag to the list', () => {
    const beforeCount = store.flags().length;

    store.addFlag({
      key: 'test-flag',
      name: 'Test Flag',
      description: 'A test flag',
      type: 'boolean',
      enabled: false,
      tags: ['test'],
    });

    expect(store.flags().length).toBe(beforeCount + 1);
    expect(store.flags()[0].key).toBe('test-flag');
    expect(store.flags()[0].id).toMatch(/^flag_/);
  });
});
