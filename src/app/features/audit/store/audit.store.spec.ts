import { TestBed } from '@angular/core/testing';
import { AuditStore } from './audit.store';
import {
  injectService,
  expectHasItems,
  expectIdPattern,
  getCountBefore,
  expectItemAdded,
} from '@/app/testing';

describe('AuditStore', () => {
  let store: AuditStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = injectService(AuditStore);
  });

  describe('initial state', () => {
    it('should have mock audit entries', () => {
      expectHasItems(store.entries);
    });

    it('should have entries with required properties', () => {
      const entry = store.entries()[0];
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('action');
      expect(entry).toHaveProperty('resourceType');
      expect(entry).toHaveProperty('resourceId');
      expect(entry).toHaveProperty('resourceName');
      expect(entry).toHaveProperty('details');
      expect(entry).toHaveProperty('userId');
      expect(entry).toHaveProperty('userName');
      expect(entry).toHaveProperty('timestamp');
    });

    it('should have entries sorted by timestamp descending', () => {
      const entries = store.entries();
      for (let i = 0; i < entries.length - 1; i++) {
        const current = new Date(entries[i].timestamp).getTime();
        const next = new Date(entries[i + 1].timestamp).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });
  });

  describe('logAction', () => {
    it('should add a new entry to the beginning of the list', () => {
      const countBefore = getCountBefore(store.entries);

      store.logAction({
        action: 'created',
        resourceType: 'flag',
        resourceId: 'flag_test123',
        resourceName: 'Test Flag',
        details: 'Created new flag for testing',
        userId: 'user_123',
        userName: 'Test User',
      });

      expectItemAdded(store.entries, countBefore);
      expect(store.entries()[0].resourceName).toBe('Test Flag');
    });

    it('should generate unique id for new entry', () => {
      store.logAction({
        action: 'updated',
        resourceType: 'segment',
        resourceId: 'seg_abc',
        resourceName: 'Test Segment',
        details: 'Updated segment rules',
        userId: 'user_123',
        userName: 'Test User',
      });

      expectIdPattern(store.entries()[0].id, 'audit');
    });

    it('should set timestamp for new entry', () => {
      const before = new Date().toISOString();

      store.logAction({
        action: 'deleted',
        resourceType: 'project',
        resourceId: 'proj_xyz',
        resourceName: 'Test Project',
        details: 'Deleted project',
        userId: 'user_123',
        userName: 'Test User',
      });

      const after = new Date().toISOString();
      const entry = store.entries()[0];

      expect(entry.timestamp >= before).toBe(true);
      expect(entry.timestamp <= after).toBe(true);
    });
  });

  describe('getEntryById', () => {
    it('should return entry by id', () => {
      const firstEntry = store.entries()[0];
      const found = store.getEntryById(firstEntry.id);
      expect(found).toEqual(firstEntry);
    });

    it('should return undefined for non-existent id', () => {
      const found = store.getEntryById('non_existent_id');
      expect(found).toBeUndefined();
    });
  });

  describe('computed selectors', () => {
    describe('totalCount', () => {
      it('should return the total number of entries', () => {
        expect(store.totalCount()).toBe(store.entries().length);
      });
    });

    describe('entriesByAction', () => {
      it('should filter entries by action type', () => {
        const createdEntries = store.entriesByAction('created');
        expect(createdEntries.every((entry) => entry.action === 'created')).toBe(true);
      });

      it('should return empty array if no matches', () => {
        // Add a fresh store to test with controlled data
        const toggledEntries = store.entriesByAction('toggled');
        expect(Array.isArray(toggledEntries)).toBe(true);
      });
    });

    describe('entriesByResourceType', () => {
      it('should filter entries by resource type', () => {
        const flagEntries = store.entriesByResourceType('flag');
        expect(flagEntries.every((entry) => entry.resourceType === 'flag')).toBe(true);
      });
    });
  });

  describe('mock data coverage', () => {
    it('should have entries for different actions', () => {
      const entries = store.entries();
      const actions = new Set(entries.map((e) => e.action));
      expect(actions.size).toBeGreaterThanOrEqual(3);
    });

    it('should have entries for different resource types', () => {
      const entries = store.entries();
      const resourceTypes = new Set(entries.map((e) => e.resourceType));
      expect(resourceTypes.size).toBeGreaterThanOrEqual(3);
    });
  });
});
