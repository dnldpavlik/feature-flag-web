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

  it('should seed with segments', () => {
    expect(store.segments().length).toBeGreaterThan(0);
    expect(store.segmentCount()).toBe(store.segments().length);
  });

  it('should add a segment', () => {
    const initial = store.segments().length;
    store.addSegment({
      key: 'vip-customers',
      name: 'VIP Customers',
      description: 'High-value customers for early releases.',
    });

    expect(store.segments().length).toBe(initial + 1);
    expect(store.segments().some((segment) => segment.key === 'vip-customers')).toBe(true);
  });

  it('should delete a segment when more than one exists', () => {
    const target = store.segments()[0];
    store.deleteSegment(target.id);
    expect(store.segments().some((segment) => segment.id === target.id)).toBe(false);
  });

  it('should not delete the last segment', () => {
    store
      .segments()
      .slice(1)
      .forEach((segment) => store.deleteSegment(segment.id));

    expect(store.segments().length).toBe(1);
    const remaining = store.segments()[0];
    store.deleteSegment(remaining.id);
    expect(store.segments().length).toBe(1);
  });
});
