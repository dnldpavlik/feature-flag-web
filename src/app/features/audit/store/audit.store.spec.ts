import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { ToastService } from '@watt/ui';
import { AuditApi } from '../api/audit.api';
import { AuditStore } from './audit.store';
import {
  injectService,
  expectHasItems,
  getCountBefore,
  expectItemAdded,
  MOCK_API_PROVIDERS,
} from '@/app/testing';

describe('AuditStore', () => {
  let store: AuditStore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [AuditStore, ...MOCK_API_PROVIDERS],
    });
    store = injectService(AuditStore);
    await store.loadEntries();
  });

  describe('initial state', () => {
    it('should have audit entries after loading', () => {
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

    it('should not be loading after loadEntries completes', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have no error after successful load', () => {
      expect(store.error()).toBeNull();
    });
  });

  describe('logAction', () => {
    it('should add a new entry to the beginning of the list', async () => {
      const countBefore = getCountBefore(store.entries);

      await store.logAction({
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

    it('should create entry with id from API', async () => {
      await store.logAction({
        action: 'updated',
        resourceType: 'segment',
        resourceId: 'seg_abc',
        resourceName: 'Test Segment',
        details: 'Updated segment rules',
        userId: 'user_123',
        userName: 'Test User',
      });

      expect(store.entries()[0].id).toBeDefined();
      expect(store.entries()[0].id).toContain('audit_');
    });

    it('should set timestamp from API response', async () => {
      await store.logAction({
        action: 'deleted',
        resourceType: 'project',
        resourceId: 'proj_xyz',
        resourceName: 'Test Project',
        details: 'Deleted project',
        userId: 'user_123',
        userName: 'Test User',
      });

      const entry = store.entries()[0];
      expect(entry.timestamp).toBeDefined();
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

  describe('data coverage', () => {
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

  describe('setLoading', () => {
    it('should set loading state', () => {
      store.setLoading(true);
      expect(store.loading()).toBe(true);

      store.setLoading(false);
      expect(store.loading()).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error state', () => {
      store.setError('Test error');
      expect(store.error()).toBe('Test error');

      store.setError(null);
      expect(store.error()).toBeNull();
    });
  });

  describe('error handling', () => {
    let toastService: ToastService;
    let auditApi: AuditApi;

    beforeEach(async () => {
      toastService = injectService(ToastService);
      auditApi = injectService(AuditApi);
      jest.restoreAllMocks();
      await store.loadEntries();
    });

    it('should set error state and show toast when loadEntries fails', async () => {
      jest.spyOn(toastService, 'error');
      jest.spyOn(auditApi, 'getAll').mockReturnValue(throwError(() => new Error('Load failed')));

      await store.loadEntries();

      expect(store.error()).toBe('Failed to load audit entries');
      expect(store.loading()).toBe(false);
      expect(toastService.error).toHaveBeenCalledWith('Failed to load audit entries');
    });

    it('should show toast when logAction fails', async () => {
      jest.spyOn(toastService, 'error');
      jest.spyOn(auditApi, 'create').mockReturnValue(throwError(() => new Error('Create failed')));

      await store.logAction({
        action: 'created',
        resourceType: 'flag',
        resourceId: 'flag_test',
        resourceName: 'Test Flag',
        details: 'Test',
        userId: 'user_123',
        userName: 'Test User',
      });

      expect(toastService.error).toHaveBeenCalledWith('Failed to log audit entry');
    });
  });
});
