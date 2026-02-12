import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { AuditStore } from '@/app/features/audit/store/audit.store';
import { ToastService } from '@watt/ui';
import { SegmentApi } from '../api/segment.api';
import { CreateSegmentRuleInput } from '../models/segment-rule.model';
import { SegmentStore } from './segment.store';
import {
  expectSignal,
  expectHasItems,
  expectItemAdded,
  expectItemRemoved,
  getCountBefore,
  findByKey,
  injectService,
  MOCK_API_PROVIDERS,
  MOCK_SEGMENTS,
} from '@/app/testing';

describe('SegmentStore', () => {
  let store: SegmentStore;
  let auditStore: AuditStore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [SegmentStore, AuditStore, ...MOCK_API_PROVIDERS],
    });
    store = injectService(SegmentStore);
    auditStore = injectService(AuditStore);
    await store.loadSegments();
  });

  describe('initial state', () => {
    it('should load segments from API', () => {
      expectHasItems(store.segments);
    });

    it('should include beta testers segment', () => {
      const betaSegment = findByKey(store.segments, 'beta-testers');
      expect(betaSegment).toBeDefined();
      expect(betaSegment?.name).toBe('Beta Testers');
    });

    it('should include internal users segment', () => {
      const internalSegment = findByKey(store.segments, 'internal-users');
      expect(internalSegment).toBeDefined();
      expect(internalSegment?.name).toBe('Internal Users');
    });

    it('should provide readonly segments signal', () => {
      expectSignal(store.segments);
    });
  });

  describe('segmentCount', () => {
    it('should reflect the current number of segments', () => {
      expect(store.segmentCount()).toBe(store.segments().length);
    });

    it('should update when segments are added', async () => {
      const countBefore = getCountBefore(store.segments);
      await store.addSegment({
        key: 'new-segment',
        name: 'New Segment',
        description: 'Test segment',
      });
      expectItemAdded(store.segments, countBefore);
    });

    it('should update when segments are deleted', async () => {
      const countBefore = getCountBefore(store.segments);
      const target = store.segments()[0];
      await store.deleteSegment(target.id);
      expectItemRemoved(store.segments, countBefore);
    });
  });

  describe('addSegment', () => {
    it('should add a new segment to the store via API', async () => {
      const countBefore = getCountBefore(store.segments);
      await store.addSegment({
        key: 'vip-customers',
        name: 'VIP Customers',
        description: 'High-value customers for early releases.',
      });

      expectItemAdded(store.segments, countBefore);
    });

    it('should create segment with provided key via API', async () => {
      await store.addSegment({
        key: 'premium-users',
        name: 'Premium Users',
        description: 'Paying customers',
      });

      const segment = findByKey(store.segments, 'premium-users');
      expect(segment?.key).toBe('premium-users');
    });

    it('should create segment with provided name via API', async () => {
      await store.addSegment({
        key: 'test-key',
        name: 'Test Segment Name',
        description: 'Description',
      });

      const segment = findByKey(store.segments, 'test-key');
      expect(segment?.name).toBe('Test Segment Name');
    });

    it('should create segment with provided description via API', async () => {
      await store.addSegment({
        key: 'described-segment',
        name: 'Described',
        description: 'A detailed description of this segment.',
      });

      const segment = findByKey(store.segments, 'described-segment');
      expect(segment?.description).toBe('A detailed description of this segment.');
    });

    it('should initialize new segment with zero rule count via API', async () => {
      await store.addSegment({
        key: 'no-rules-segment',
        name: 'No Rules',
        description: 'Test',
      });

      const segment = findByKey(store.segments, 'no-rules-segment');
      expect(segment?.ruleCount).toBe(0);
    });

    it('should set timestamps on new segment via API', async () => {
      await store.addSegment({
        key: 'timestamped-segment',
        name: 'Timestamped',
        description: 'Test',
      });

      const segment = findByKey(store.segments, 'timestamped-segment');
      expect(segment?.createdAt).toBeDefined();
      expect(segment?.updatedAt).toBeDefined();
    });
  });

  describe('deleteSegment', () => {
    it('should remove segment by id via API when more than one exists', async () => {
      const target = store.segments()[0];
      await store.deleteSegment(target.id);
      expect(store.segments().some((segment) => segment.id === target.id)).toBe(false);
    });

    it('should preserve other segments when deleting one via API', async () => {
      const segments = store.segments();
      const targetId = segments[0].id;
      const preservedId = segments[1].id;

      await store.deleteSegment(targetId);

      expect(store.segments().some((s) => s.id === preservedId)).toBe(true);
    });

    it('should not delete the last remaining segment', async () => {
      const segments = store.segments();
      for (let i = 0; i < segments.length - 1; i++) {
        await store.deleteSegment(segments[i].id);
      }

      expect(store.segments().length).toBe(1);
      const remaining = store.segments()[0];
      await store.deleteSegment(remaining.id);
      expect(store.segments().length).toBe(1);
    });

    it('should ignore deletion of non-existent segment id', async () => {
      const initialCount = store.segments().length;
      await store.deleteSegment('seg_nonexistent');
      expect(store.segments().length).toBe(initialCount);
    });
  });

  describe('getSegmentById', () => {
    it('should return segment with matching id', () => {
      const expected = store.segments()[0];
      const result = store.getSegmentById(expected.id);
      expect(result).toEqual(expected);
    });

    it('should return undefined for non-existent id', () => {
      const result = store.getSegmentById('seg_nonexistent');
      expect(result).toBeUndefined();
    });

    it('should return the latest version of the segment', async () => {
      const segment = store.segments()[0];
      await store.updateSegment(segment.id, { name: 'Updated Name' });
      const result = store.getSegmentById(segment.id);
      expect(result?.name).toBe('Updated Name');
    });
  });

  describe('updateSegment', () => {
    it('should update segment name via API', async () => {
      const segment = store.segments()[0];
      await store.updateSegment(segment.id, { name: 'New Name' });
      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.name).toBe('New Name');
    });

    it('should update segment key via API', async () => {
      const segment = store.segments()[0];
      await store.updateSegment(segment.id, { key: 'new-key' });
      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.key).toBe('new-key');
    });

    it('should update segment description via API', async () => {
      const segment = store.segments()[0];
      await store.updateSegment(segment.id, { description: 'New description' });
      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.description).toBe('New description');
    });

    it('should not modify other segments', async () => {
      const [first, second] = store.segments();
      const originalSecondName = second.name;
      await store.updateSegment(first.id, { name: 'Modified' });
      const unchangedSecond = store.segments().find((s) => s.id === second.id);
      expect(unchangedSecond?.name).toBe(originalSecondName);
    });
  });

  describe('addRule', () => {
    it('should add rule to segment via API', async () => {
      const segment = store.segments()[0];
      const initialRuleCount = segment.rules.length;
      const input: CreateSegmentRuleInput = {
        attribute: 'country',
        operator: 'equals',
        value: 'US',
      };

      await store.addRule(segment.id, input);

      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.rules.length).toBe(initialRuleCount + 1);
    });

    it('should increment ruleCount via API', async () => {
      const segment = store.segments()[0];
      const initialCount = segment.ruleCount;

      await store.addRule(segment.id, {
        attribute: 'plan',
        operator: 'equals',
        value: 'pro',
      });

      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.ruleCount).toBe(initialCount + 1);
    });

    it('should not modify other segments', async () => {
      const [first, second] = store.segments();
      const originalSecondRuleCount = second.ruleCount;

      await store.addRule(first.id, {
        attribute: 'email',
        operator: 'contains',
        value: '@example.com',
      });

      const unchangedSecond = store.segments().find((s) => s.id === second.id);
      expect(unchangedSecond?.ruleCount).toBe(originalSecondRuleCount);
    });
  });

  describe('updateRule', () => {
    it('should update rule value via API', async () => {
      const segment = store.segments()[0];
      const rule = segment.rules[0];

      await store.updateRule(segment.id, rule.id, { value: '@newdomain.com' });

      const updated = store.segments().find((s) => s.id === segment.id);
      const updatedRule = updated?.rules.find((r) => r.id === rule.id);
      expect(updatedRule?.value).toBe('@newdomain.com');
    });

    it('should update rule operator via API', async () => {
      const segment = store.segments()[0];
      const rule = segment.rules[0];

      await store.updateRule(segment.id, rule.id, { operator: 'equals' });

      const updated = store.segments().find((s) => s.id === segment.id);
      const updatedRule = updated?.rules.find((r) => r.id === rule.id);
      expect(updatedRule?.operator).toBe('equals');
    });

    it('should not modify other rules', async () => {
      const segment = store.segments()[0];
      if (segment.rules.length < 2) {
        await store.addRule(segment.id, {
          attribute: 'country',
          operator: 'equals',
          value: 'US',
        });
      }

      const segmentWithRules = store.segments().find((s) => s.id === segment.id)!;
      const [firstRule, secondRule] = segmentWithRules.rules;

      await store.updateRule(segment.id, secondRule.id, { value: 'UK' });

      const updated = store.segments().find((s) => s.id === segment.id);
      const unchangedRule = updated?.rules.find((r) => r.id === firstRule.id);
      expect(unchangedRule?.value).toBe(firstRule.value);
    });
  });

  describe('removeRule', () => {
    it('should remove rule from segment via API', async () => {
      const segment = store.segments()[0];
      const rule = segment.rules[0];
      const initialRuleCount = segment.rules.length;

      await store.removeRule(segment.id, rule.id);

      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.rules.length).toBe(initialRuleCount - 1);
      expect(updated?.rules.some((r) => r.id === rule.id)).toBe(false);
    });

    it('should decrement ruleCount via API', async () => {
      const segment = store.segments()[0];
      const rule = segment.rules[0];
      const initialCount = segment.ruleCount;

      await store.removeRule(segment.id, rule.id);

      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.ruleCount).toBe(initialCount - 1);
    });

    it('should not modify other segments', async () => {
      const [first, second] = store.segments();
      const rule = first.rules[0];
      const originalSecondRuleCount = second.ruleCount;

      await store.removeRule(first.id, rule.id);

      const unchangedSecond = store.segments().find((s) => s.id === second.id);
      expect(unchangedSecond?.ruleCount).toBe(originalSecondRuleCount);
    });
  });

  describe('audit logging', () => {
    beforeEach(() => {
      jest.spyOn(auditStore, 'logAction');
    });

    it('should log audit entry when segment is created', async () => {
      await store.addSegment({
        key: 'audit-test-segment',
        name: 'Audit Test Segment',
        description: 'Testing audit logging',
      });

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'created',
          resourceType: 'segment',
          resourceName: 'Audit Test Segment',
        }),
      );
    });

    it('should log audit entry when segment is updated', async () => {
      const segment = store.segments()[0];

      await store.updateSegment(segment.id, {
        name: 'Updated Segment Name',
      });

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'updated',
          resourceType: 'segment',
          resourceId: segment.id,
          resourceName: 'Updated Segment Name',
        }),
      );
    });

    it('should log audit entry when segment is deleted', async () => {
      const segment = store.segments()[0];
      const segmentName = segment.name;

      await store.deleteSegment(segment.id);

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'deleted',
          resourceType: 'segment',
          resourceId: segment.id,
          resourceName: segmentName,
        }),
      );
    });

    it('should include user info in audit entry', async () => {
      await store.addSegment({
        key: 'user-audit-segment',
        name: 'User Audit Segment',
        description: 'Testing user info',
      });

      expect(auditStore.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(String),
          userName: expect.any(String),
        }),
      );
    });
  });

  describe('error handling', () => {
    let toastService: ToastService;
    let segmentApi: SegmentApi;

    beforeEach(async () => {
      toastService = injectService(ToastService);
      segmentApi = injectService(SegmentApi);
      // Ensure segments are loaded before each error test
      jest.restoreAllMocks();
      await store.loadSegments();
    });

    it('should show toast when addSegment fails', async () => {
      jest.spyOn(toastService, 'error');
      jest
        .spyOn(segmentApi, 'create')
        .mockReturnValue(throwError(() => new Error('Create failed')));

      await store.addSegment({
        key: 'fail-segment',
        name: 'Fail Segment',
        description: 'Will fail',
      });

      expect(toastService.error).toHaveBeenCalledWith('Failed to create segment');
    });

    it('should show toast when updateSegment fails', async () => {
      jest.spyOn(toastService, 'error');
      jest
        .spyOn(segmentApi, 'update')
        .mockReturnValue(throwError(() => new Error('Update failed')));
      const segmentId = MOCK_SEGMENTS[0].id;

      await store.updateSegment(segmentId, { name: 'New Name' });

      expect(toastService.error).toHaveBeenCalledWith('Failed to update segment');
    });

    it('should show toast when deleteSegment fails', async () => {
      jest.spyOn(toastService, 'error');
      jest
        .spyOn(segmentApi, 'delete')
        .mockReturnValue(throwError(() => new Error('Delete failed')));
      const segmentId = MOCK_SEGMENTS[0].id;

      await store.deleteSegment(segmentId);

      expect(toastService.error).toHaveBeenCalledWith('Failed to delete segment');
    });

    it('should show toast when addRule fails', async () => {
      jest.spyOn(toastService, 'error');
      jest
        .spyOn(segmentApi, 'addRule')
        .mockReturnValue(throwError(() => new Error('Add rule failed')));
      const segmentId = MOCK_SEGMENTS[0].id;

      await store.addRule(segmentId, {
        attribute: 'email',
        operator: 'contains',
        value: '@test.com',
      });

      expect(toastService.error).toHaveBeenCalledWith('Failed to add rule');
    });

    it('should show toast when updateRule fails', async () => {
      jest.spyOn(toastService, 'error');
      jest
        .spyOn(segmentApi, 'updateRule')
        .mockReturnValue(throwError(() => new Error('Update rule failed')));
      const segment = MOCK_SEGMENTS[0];
      const ruleId = segment.rules[0].id;

      await store.updateRule(segment.id, ruleId, { value: 'new-value' });

      expect(toastService.error).toHaveBeenCalledWith('Failed to update rule');
    });

    it('should show toast when removeRule fails', async () => {
      jest.spyOn(toastService, 'error');
      jest
        .spyOn(segmentApi, 'deleteRule')
        .mockReturnValue(throwError(() => new Error('Remove rule failed')));
      const segment = MOCK_SEGMENTS[0];
      const ruleId = segment.rules[0].id;

      await store.removeRule(segment.id, ruleId);

      expect(toastService.error).toHaveBeenCalledWith('Failed to remove rule');
    });
  });
});
