import { TestBed } from '@angular/core/testing';

import { SearchStore } from './search.store';

describe('SearchStore', () => {
  let store: SearchStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchStore],
    });
    store = TestBed.inject(SearchStore);
  });

  it('should start with an empty query', () => {
    expect(store.query()).toBe('');
  });

  it('should update the query', () => {
    store.setQuery('flags');
    expect(store.query()).toBe('flags');
  });

  it('should clear the query', () => {
    store.setQuery('projects');
    store.clear();
    expect(store.query()).toBe('');
  });
});
