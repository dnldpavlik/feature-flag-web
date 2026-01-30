import { TestBed } from '@angular/core/testing';

import { CreateSegmentRuleInput } from '../models/segment-rule.model';
import { SegmentStore } from './segment.store';
import {
  expectSignal,
  expectHasItems,
  expectIdPattern,
  expectItemAdded,
  expectItemRemoved,
  getCountBefore,
  findByKey,
  injectService,
} from '@/app/testing';

describe('SegmentStore', () => {
  let store: SegmentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SegmentStore],
    });
    store = injectService(SegmentStore);
  });

  describe('initial state', () => {
    it('should seed with pre-configured segments', () => {
      expectHasItems(store.segments);
    });

    it('should include beta testers segment by default', () => {
      const betaSegment = findByKey(store.segments, 'beta-testers');
      expect(betaSegment).toBeDefined();
      expect(betaSegment?.name).toBe('Beta Testers');
    });

    it('should include internal users segment by default', () => {
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

    it('should update when segments are added', () => {
      const countBefore = getCountBefore(store.segments);
      store.addSegment({
        key: 'new-segment',
        name: 'New Segment',
        description: 'Test segment',
      });
      expectItemAdded(store.segments, countBefore);
    });

    it('should update when segments are deleted', () => {
      const countBefore = getCountBefore(store.segments);
      const target = store.segments()[0];
      store.deleteSegment(target.id);
      expectItemRemoved(store.segments, countBefore);
    });
  });

  describe('addSegment', () => {
    it('should add a new segment to the store', () => {
      const countBefore = getCountBefore(store.segments);
      store.addSegment({
        key: 'vip-customers',
        name: 'VIP Customers',
        description: 'High-value customers for early releases.',
      });

      expectItemAdded(store.segments, countBefore);
    });

    it('should create segment with provided key', () => {
      store.addSegment({
        key: 'premium-users',
        name: 'Premium Users',
        description: 'Paying customers',
      });

      const segment = findByKey(store.segments, 'premium-users');
      expect(segment?.key).toBe('premium-users');
    });

    it('should create segment with provided name', () => {
      store.addSegment({
        key: 'test-key',
        name: 'Test Segment Name',
        description: 'Description',
      });

      const segment = findByKey(store.segments, 'test-key');
      expect(segment?.name).toBe('Test Segment Name');
    });

    it('should create segment with provided description', () => {
      store.addSegment({
        key: 'described-segment',
        name: 'Described',
        description: 'A detailed description of this segment.',
      });

      const segment = findByKey(store.segments, 'described-segment');
      expect(segment?.description).toBe('A detailed description of this segment.');
    });

    it('should generate unique id for new segment', () => {
      store.addSegment({
        key: 'unique-segment',
        name: 'Unique',
        description: 'Test',
      });

      const segment = findByKey(store.segments, 'unique-segment');
      expectIdPattern(segment!.id, 'seg');
    });

    it('should initialize new segment with zero rule count', () => {
      store.addSegment({
        key: 'no-rules-segment',
        name: 'No Rules',
        description: 'Test',
      });

      const segment = findByKey(store.segments, 'no-rules-segment');
      expect(segment?.ruleCount).toBe(0);
    });

    it('should set createdAt timestamp on new segment', () => {
      store.addSegment({
        key: 'timestamped-segment',
        name: 'Timestamped',
        description: 'Test',
      });

      const segment = findByKey(store.segments, 'timestamped-segment');
      expect(segment?.createdAt).toBeDefined();
      expect(typeof segment?.createdAt).toBe('string');
    });

    it('should set updatedAt timestamp on new segment', () => {
      store.addSegment({
        key: 'updated-segment',
        name: 'Updated',
        description: 'Test',
      });

      const segment = findByKey(store.segments, 'updated-segment');
      expect(segment?.updatedAt).toBeDefined();
      expect(segment?.updatedAt).toBe(segment?.createdAt);
    });
  });

  describe('deleteSegment', () => {
    it('should remove segment by id when more than one exists', () => {
      const target = store.segments()[0];
      store.deleteSegment(target.id);
      expect(store.segments().some((segment) => segment.id === target.id)).toBe(false);
    });

    it('should preserve other segments when deleting one', () => {
      const segments = store.segments();
      const targetId = segments[0].id;
      const preservedId = segments[1].id;

      store.deleteSegment(targetId);

      expect(store.segments().some((s) => s.id === preservedId)).toBe(true);
    });

    it('should not delete the last remaining segment', () => {
      store
        .segments()
        .slice(1)
        .forEach((segment) => store.deleteSegment(segment.id));

      expect(store.segments().length).toBe(1);
      const remaining = store.segments()[0];
      store.deleteSegment(remaining.id);
      expect(store.segments().length).toBe(1);
    });

    it('should ignore deletion of non-existent segment id', () => {
      const initialCount = store.segments().length;
      store.deleteSegment('seg_nonexistent');
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

    it('should return the latest version of the segment', () => {
      const segment = store.segments()[0];
      store.updateSegment(segment.id, { name: 'Updated Name' });
      const result = store.getSegmentById(segment.id);
      expect(result?.name).toBe('Updated Name');
    });
  });

  describe('updateSegment', () => {
    it('should update segment name', () => {
      const segment = store.segments()[0];
      store.updateSegment(segment.id, { name: 'New Name' });
      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.name).toBe('New Name');
    });

    it('should update segment key', () => {
      const segment = store.segments()[0];
      store.updateSegment(segment.id, { key: 'new-key' });
      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.key).toBe('new-key');
    });

    it('should update segment description', () => {
      const segment = store.segments()[0];
      store.updateSegment(segment.id, { description: 'New description' });
      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.description).toBe('New description');
    });

    it('should preserve unchanged properties', () => {
      const segment = store.segments()[0];
      const originalKey = segment.key;
      store.updateSegment(segment.id, { name: 'Different Name' });
      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.key).toBe(originalKey);
    });

    it('should update updatedAt timestamp', () => {
      const segment = store.segments()[0];
      const beforeUpdate = store.segments().find((s) => s.id === segment.id)!;

      store.updateSegment(segment.id, { name: 'Timestamped Update' });

      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(Date.parse(updated!.updatedAt)).toBeGreaterThanOrEqual(
        Date.parse(beforeUpdate.updatedAt),
      );
    });

    it('should not modify other segments', () => {
      const [first, second] = store.segments();
      const originalSecondName = second.name;
      store.updateSegment(first.id, { name: 'Modified' });
      const unchangedSecond = store.segments().find((s) => s.id === second.id);
      expect(unchangedSecond?.name).toBe(originalSecondName);
    });

    it('should ignore update for non-existent segment', () => {
      const before = store.segments().map((s) => ({ ...s }));
      store.updateSegment('seg_nonexistent', { name: 'Ghost' });
      const after = store.segments();
      expect(after.length).toBe(before.length);
    });
  });

  describe('addRule', () => {
    it('should add rule to segment', () => {
      const segment = store.segments()[0];
      const input: CreateSegmentRuleInput = {
        attribute: 'email',
        operator: 'contains',
        value: '@test.com',
      };

      store.addRule(segment.id, input);

      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.rules.length).toBeGreaterThan(0);
      expect(updated?.rules.some((r) => r.attribute === 'email')).toBe(true);
    });

    it('should generate rule id', () => {
      const segment = store.segments()[0];
      const initialRuleCount = segment.rules.length;

      store.addRule(segment.id, {
        attribute: 'country',
        operator: 'equals',
        value: 'US',
      });

      const updated = store.segments().find((s) => s.id === segment.id);
      const newRule = updated?.rules[initialRuleCount];
      expectIdPattern(newRule!.id, 'rule');
    });

    it('should increment ruleCount', () => {
      const segment = store.segments()[0];
      const initialCount = segment.ruleCount;

      store.addRule(segment.id, {
        attribute: 'plan',
        operator: 'equals',
        value: 'pro',
      });

      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.ruleCount).toBe(initialCount + 1);
    });

    it('should update segment updatedAt', () => {
      const segment = store.segments()[0];
      const beforeAdd = store.segments().find((s) => s.id === segment.id)!;

      store.addRule(segment.id, {
        attribute: 'role',
        operator: 'equals',
        value: 'admin',
      });

      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(Date.parse(updated!.updatedAt)).toBeGreaterThanOrEqual(
        Date.parse(beforeAdd.updatedAt),
      );
    });

    it('should not modify other segments', () => {
      const [first, second] = store.segments();
      const originalSecondRuleCount = second.ruleCount;

      store.addRule(first.id, {
        attribute: 'email',
        operator: 'contains',
        value: '@example.com',
      });

      const unchangedSecond = store.segments().find((s) => s.id === second.id);
      expect(unchangedSecond?.ruleCount).toBe(originalSecondRuleCount);
    });
  });

  describe('updateRule', () => {
    beforeEach(() => {
      const segment = store.segments()[0];
      store.addRule(segment.id, {
        attribute: 'email',
        operator: 'contains',
        value: '@original.com',
      });
    });

    it('should update rule attribute', () => {
      const segment = store.segments()[0];
      const rule = segment.rules[segment.rules.length - 1];

      store.updateRule(segment.id, rule.id, { attribute: 'country' });

      const updated = store.segments().find((s) => s.id === segment.id);
      const updatedRule = updated?.rules.find((r) => r.id === rule.id);
      expect(updatedRule?.attribute).toBe('country');
    });

    it('should update rule operator', () => {
      const segment = store.segments()[0];
      const rule = segment.rules[segment.rules.length - 1];

      store.updateRule(segment.id, rule.id, { operator: 'equals' });

      const updated = store.segments().find((s) => s.id === segment.id);
      const updatedRule = updated?.rules.find((r) => r.id === rule.id);
      expect(updatedRule?.operator).toBe('equals');
    });

    it('should update rule value', () => {
      const segment = store.segments()[0];
      const rule = segment.rules[segment.rules.length - 1];

      store.updateRule(segment.id, rule.id, { value: '@new.com' });

      const updated = store.segments().find((s) => s.id === segment.id);
      const updatedRule = updated?.rules.find((r) => r.id === rule.id);
      expect(updatedRule?.value).toBe('@new.com');
    });

    it('should preserve unchanged rule properties', () => {
      const segment = store.segments()[0];
      const rule = segment.rules[segment.rules.length - 1];
      const originalOperator = rule.operator;

      store.updateRule(segment.id, rule.id, { value: '@changed.com' });

      const updated = store.segments().find((s) => s.id === segment.id);
      const updatedRule = updated?.rules.find((r) => r.id === rule.id);
      expect(updatedRule?.operator).toBe(originalOperator);
    });

    it('should update segment updatedAt', () => {
      const segment = store.segments()[0];
      const rule = segment.rules[segment.rules.length - 1];
      const beforeUpdate = store.segments().find((s) => s.id === segment.id)!;

      store.updateRule(segment.id, rule.id, { value: '@updated.com' });

      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(Date.parse(updated!.updatedAt)).toBeGreaterThanOrEqual(
        Date.parse(beforeUpdate.updatedAt),
      );
    });

    it('should not modify other rules', () => {
      const segment = store.segments()[0];
      store.addRule(segment.id, {
        attribute: 'country',
        operator: 'equals',
        value: 'US',
      });

      const segmentWithTwoRules = store.segments().find((s) => s.id === segment.id)!;
      const [firstRule, secondRule] = segmentWithTwoRules.rules.slice(-2);

      store.updateRule(segment.id, secondRule.id, { value: 'UK' });

      const updated = store.segments().find((s) => s.id === segment.id);
      const unchangedRule = updated?.rules.find((r) => r.id === firstRule.id);
      expect(unchangedRule?.value).toBe(firstRule.value);
    });
  });

  describe('removeRule', () => {
    beforeEach(() => {
      const segment = store.segments()[0];
      store.addRule(segment.id, {
        attribute: 'email',
        operator: 'contains',
        value: '@toremove.com',
      });
    });

    it('should remove rule from segment', () => {
      const segment = store.segments()[0];
      const rule = segment.rules[segment.rules.length - 1];
      const initialRuleCount = segment.rules.length;

      store.removeRule(segment.id, rule.id);

      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.rules.length).toBe(initialRuleCount - 1);
      expect(updated?.rules.some((r) => r.id === rule.id)).toBe(false);
    });

    it('should decrement ruleCount', () => {
      const segment = store.segments()[0];
      const rule = segment.rules[segment.rules.length - 1];
      const initialCount = segment.ruleCount;

      store.removeRule(segment.id, rule.id);

      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.ruleCount).toBe(initialCount - 1);
    });

    it('should update segment updatedAt', () => {
      const segment = store.segments()[0];
      const rule = segment.rules[segment.rules.length - 1];
      const beforeRemove = store.segments().find((s) => s.id === segment.id)!;

      store.removeRule(segment.id, rule.id);

      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(Date.parse(updated!.updatedAt)).toBeGreaterThanOrEqual(
        Date.parse(beforeRemove.updatedAt),
      );
    });

    it('should preserve other rules', () => {
      const segment = store.segments()[0];
      store.addRule(segment.id, {
        attribute: 'country',
        operator: 'equals',
        value: 'US',
      });

      const segmentWithTwoRules = store.segments().find((s) => s.id === segment.id)!;
      const [firstRule, secondRule] = segmentWithTwoRules.rules.slice(-2);

      store.removeRule(segment.id, secondRule.id);

      const updated = store.segments().find((s) => s.id === segment.id);
      expect(updated?.rules.some((r) => r.id === firstRule.id)).toBe(true);
    });

    it('should not modify other segments', () => {
      const [first, second] = store.segments();
      const rule = first.rules[first.rules.length - 1];
      const originalSecondRuleCount = second.ruleCount;

      store.removeRule(first.id, rule.id);

      const unchangedSecond = store.segments().find((s) => s.id === second.id);
      expect(unchangedSecond?.ruleCount).toBe(originalSecondRuleCount);
    });
  });
});
