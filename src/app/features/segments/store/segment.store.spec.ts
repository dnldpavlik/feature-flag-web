import { TestBed } from '@angular/core/testing';

import { SegmentStore } from './segment.store';

describe('SegmentStore', () => {
  let store: SegmentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SegmentStore],
    });
    store = TestBed.inject(SegmentStore);
  });

  describe('initial state', () => {
    it('should seed with pre-configured segments', () => {
      expect(store.segments().length).toBeGreaterThan(0);
    });

    it('should include beta testers segment by default', () => {
      const betaSegment = store.segments().find((s) => s.key === 'beta-testers');
      expect(betaSegment).toBeDefined();
      expect(betaSegment?.name).toBe('Beta Testers');
    });

    it('should include internal users segment by default', () => {
      const internalSegment = store.segments().find((s) => s.key === 'internal-users');
      expect(internalSegment).toBeDefined();
      expect(internalSegment?.name).toBe('Internal Users');
    });

    it('should provide readonly segments signal', () => {
      expect(typeof store.segments).toBe('function');
    });
  });

  describe('segmentCount', () => {
    it('should reflect the current number of segments', () => {
      expect(store.segmentCount()).toBe(store.segments().length);
    });

    it('should update when segments are added', () => {
      const initialCount = store.segmentCount();
      store.addSegment({
        key: 'new-segment',
        name: 'New Segment',
        description: 'Test segment',
      });
      expect(store.segmentCount()).toBe(initialCount + 1);
    });

    it('should update when segments are deleted', () => {
      const initialCount = store.segmentCount();
      const target = store.segments()[0];
      store.deleteSegment(target.id);
      expect(store.segmentCount()).toBe(initialCount - 1);
    });
  });

  describe('addSegment', () => {
    it('should add a new segment to the store', () => {
      const initial = store.segments().length;
      store.addSegment({
        key: 'vip-customers',
        name: 'VIP Customers',
        description: 'High-value customers for early releases.',
      });

      expect(store.segments().length).toBe(initial + 1);
    });

    it('should create segment with provided key', () => {
      store.addSegment({
        key: 'premium-users',
        name: 'Premium Users',
        description: 'Paying customers',
      });

      const segment = store.segments().find((s) => s.key === 'premium-users');
      expect(segment?.key).toBe('premium-users');
    });

    it('should create segment with provided name', () => {
      store.addSegment({
        key: 'test-key',
        name: 'Test Segment Name',
        description: 'Description',
      });

      const segment = store.segments().find((s) => s.key === 'test-key');
      expect(segment?.name).toBe('Test Segment Name');
    });

    it('should create segment with provided description', () => {
      store.addSegment({
        key: 'described-segment',
        name: 'Described',
        description: 'A detailed description of this segment.',
      });

      const segment = store.segments().find((s) => s.key === 'described-segment');
      expect(segment?.description).toBe('A detailed description of this segment.');
    });

    it('should generate unique id for new segment', () => {
      store.addSegment({
        key: 'unique-segment',
        name: 'Unique',
        description: 'Test',
      });

      const segment = store.segments().find((s) => s.key === 'unique-segment');
      expect(segment?.id).toMatch(/^seg_/);
    });

    it('should initialize new segment with zero rule count', () => {
      store.addSegment({
        key: 'no-rules-segment',
        name: 'No Rules',
        description: 'Test',
      });

      const segment = store.segments().find((s) => s.key === 'no-rules-segment');
      expect(segment?.ruleCount).toBe(0);
    });

    it('should set createdAt timestamp on new segment', () => {
      store.addSegment({
        key: 'timestamped-segment',
        name: 'Timestamped',
        description: 'Test',
      });

      const segment = store.segments().find((s) => s.key === 'timestamped-segment');
      expect(segment?.createdAt).toBeDefined();
      expect(typeof segment?.createdAt).toBe('string');
    });

    it('should set updatedAt timestamp on new segment', () => {
      store.addSegment({
        key: 'updated-segment',
        name: 'Updated',
        description: 'Test',
      });

      const segment = store.segments().find((s) => s.key === 'updated-segment');
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
});
