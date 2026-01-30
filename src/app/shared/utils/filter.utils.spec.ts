import {
  textFilter,
  propertyEquals,
  matchesAll,
  matchesAny,
  isTruthy,
  isFalsy,
  not,
} from './filter.utils';

interface TestItem {
  name: string;
  key: string;
  description: string;
  status: string;
  enabled: boolean;
}

const testItems: TestItem[] = [
  { name: 'Alpha', key: 'alpha', description: 'First item', status: 'active', enabled: true },
  { name: 'Beta', key: 'beta', description: 'Second item', status: 'active', enabled: false },
  { name: 'Gamma', key: 'gamma', description: 'Third item', status: 'inactive', enabled: true },
  { name: 'Delta', key: 'delta', description: 'Fourth item', status: 'inactive', enabled: false },
];

describe('filter.utils', () => {
  describe('textFilter', () => {
    it('should match items containing query in specified fields', () => {
      const filter = textFilter<TestItem>(['name', 'key'], 'alpha');
      const results = testItems.filter(filter);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Alpha');
    });

    it('should be case-insensitive', () => {
      const filter = textFilter<TestItem>(['name'], 'ALPHA');
      const results = testItems.filter(filter);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Alpha');
    });

    it('should search across multiple fields', () => {
      const filter = textFilter<TestItem>(['name', 'description'], 'item');
      const results = testItems.filter(filter);

      expect(results).toHaveLength(4);
    });

    it('should return all items when query is empty', () => {
      const filter = textFilter<TestItem>(['name'], '');
      const results = testItems.filter(filter);

      expect(results).toHaveLength(4);
    });

    it('should handle partial matches', () => {
      const filter = textFilter<TestItem>(['name'], 'ta');
      const results = testItems.filter(filter);

      expect(results).toHaveLength(2); // Beta, Delta
    });

    it('should handle undefined field values', () => {
      const itemsWithUndefined = [{ name: 'Test', value: undefined }] as unknown as TestItem[];

      const filter = textFilter<TestItem>(['name', 'value' as keyof TestItem & string], 'test');
      expect(() => itemsWithUndefined.filter(filter)).not.toThrow();
    });
  });

  describe('propertyEquals', () => {
    it('should match items with exact property value', () => {
      const filter = propertyEquals<TestItem>('status', 'active');
      const results = testItems.filter(filter);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.status === 'active')).toBe(true);
    });

    it('should return all items when value is "all"', () => {
      const filter = propertyEquals<TestItem>('status', 'all');
      const results = testItems.filter(filter);

      expect(results).toHaveLength(4);
    });

    it('should return empty array when no items match', () => {
      const filter = propertyEquals<TestItem>('status', 'nonexistent');
      const results = testItems.filter(filter);

      expect(results).toHaveLength(0);
    });
  });

  describe('matchesAll', () => {
    it('should combine predicates with AND logic', () => {
      const filter = matchesAll<TestItem>([
        propertyEquals('status', 'active'),
        (item) => item.enabled,
      ]);
      const results = testItems.filter(filter);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Alpha');
    });

    it('should return all items when all predicates pass', () => {
      const filter = matchesAll<TestItem>([() => true, () => true]);
      const results = testItems.filter(filter);

      expect(results).toHaveLength(4);
    });

    it('should return no items when any predicate fails for all', () => {
      const filter = matchesAll<TestItem>([() => true, () => false]);
      const results = testItems.filter(filter);

      expect(results).toHaveLength(0);
    });
  });

  describe('matchesAny', () => {
    it('should combine predicates with OR logic', () => {
      const filter = matchesAny<TestItem>([
        (item) => item.name === 'Alpha',
        (item) => item.name === 'Gamma',
      ]);
      const results = testItems.filter(filter);

      expect(results).toHaveLength(2);
    });

    it('should return all items when empty predicates array', () => {
      const filter = matchesAny<TestItem>([]);
      const results = testItems.filter(filter);

      expect(results).toHaveLength(4);
    });

    it('should return matching items when at least one predicate passes', () => {
      const filter = matchesAny<TestItem>([() => false, (item) => item.name === 'Beta']);
      const results = testItems.filter(filter);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Beta');
    });
  });

  describe('isTruthy', () => {
    it('should match items with truthy field value', () => {
      const filter = isTruthy<TestItem>('enabled');
      const results = testItems.filter(filter);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.enabled)).toBe(true);
    });
  });

  describe('isFalsy', () => {
    it('should match items with falsy field value', () => {
      const filter = isFalsy<TestItem>('enabled');
      const results = testItems.filter(filter);

      expect(results).toHaveLength(2);
      expect(results.every((r) => !r.enabled)).toBe(true);
    });
  });

  describe('not', () => {
    it('should negate a predicate', () => {
      const isActive = propertyEquals<TestItem>('status', 'active');
      const isNotActive = not(isActive);
      const results = testItems.filter(isNotActive);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.status !== 'active')).toBe(true);
    });
  });

  describe('composition', () => {
    it('should support complex filter compositions', () => {
      // Active AND (enabled OR name contains "Delta")
      const filter = matchesAll<TestItem>([
        propertyEquals('status', 'active'),
        matchesAny([isTruthy('enabled'), textFilter(['name'], 'Delta')]),
      ]);
      const results = testItems.filter(filter);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Alpha');
    });
  });
});
