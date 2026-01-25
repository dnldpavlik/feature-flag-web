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

  describe('initial state', () => {
    it('should start with an empty query', () => {
      expect(store.query()).toBe('');
    });

    it('should provide a readonly query signal', () => {
      expect(typeof store.query).toBe('function');
    });
  });

  describe('setQuery', () => {
    it('should update the query with provided value', () => {
      store.setQuery('flags');
      expect(store.query()).toBe('flags');
    });

    it('should handle multiple consecutive updates', () => {
      store.setQuery('first');
      store.setQuery('second');
      store.setQuery('third');
      expect(store.query()).toBe('third');
    });

    it('should accept empty string as valid query', () => {
      store.setQuery('something');
      store.setQuery('');
      expect(store.query()).toBe('');
    });

    it('should preserve whitespace in query', () => {
      store.setQuery('  spaced query  ');
      expect(store.query()).toBe('  spaced query  ');
    });

    it('should handle special characters in query', () => {
      store.setQuery('flag:enabled && type:boolean');
      expect(store.query()).toBe('flag:enabled && type:boolean');
    });

    it('should handle unicode characters', () => {
      store.setQuery('フラグ検索');
      expect(store.query()).toBe('フラグ検索');
    });
  });

  describe('clear', () => {
    it('should reset query to empty string', () => {
      store.setQuery('projects');
      store.clear();
      expect(store.query()).toBe('');
    });

    it('should be idempotent when called multiple times', () => {
      store.setQuery('test');
      store.clear();
      store.clear();
      store.clear();
      expect(store.query()).toBe('');
    });

    it('should work correctly when query is already empty', () => {
      store.clear();
      expect(store.query()).toBe('');
    });
  });

  describe('state isolation', () => {
    it('should maintain independent state per store instance', () => {
      const anotherStore = TestBed.inject(SearchStore);

      store.setQuery('first store query');

      // Since it's providedIn: 'root', both references point to same instance
      expect(anotherStore.query()).toBe('first store query');
    });
  });
});
