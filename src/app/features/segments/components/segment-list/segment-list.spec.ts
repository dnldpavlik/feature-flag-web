import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SearchStore } from '@/app/shared/store/search.store';
import { SegmentStore } from '@/app/features/segments/store/segment.store';
import { SegmentListComponent } from './segment-list';
import {
  expectHeading,
  expectEmptyState,
  expectExists,
  getTableRows,
  getRowCount,
  queryAll,
  injectService,
  getComponent,
  MOCK_API_PROVIDERS,
} from '@/app/testing';

describe('SegmentList', () => {
  let fixture: ComponentFixture<SegmentListComponent>;
  let component: SegmentListComponent;
  let store: SegmentStore;
  let searchStore: SearchStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegmentListComponent],
      providers: [provideRouter([]), SegmentStore, SearchStore, ...MOCK_API_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(SegmentListComponent);
    component = getComponent(fixture);
    store = injectService(SegmentStore);
    searchStore = injectService(SearchStore);
    await store.loadSegments();
    fixture.detectChanges();
  });

  it('should render the segments heading', () => {
    expectHeading(fixture, 'Segments');
  });

  it('should render segment rows', () => {
    const rows = getTableRows(fixture);
    expect(rows.length).toBe(store.segments().length);
  });

  it('should add a segment', async () => {
    component.form.controls.name.setValue('VIP Customers');
    component.form.controls.key.setValue('vip-customers');
    component.form.controls.description.setValue('High-value customers.');
    component.addSegment();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = getTableRows(fixture);
    expect(rows.length).toBe(store.segments().length);
  });

  it('should not add a segment when required fields are missing', async () => {
    const initialCount = store.segments().length;
    component.form.controls.name.setValue('');
    component.form.controls.key.setValue('');
    component.addSegment();
    await fixture.whenStable();
    expect(store.segments().length).toBe(initialCount);
  });

  it('should delete a segment', async () => {
    const deleteSpy = jest.spyOn(store, 'deleteSegment');
    component.deleteSegment('seg_beta');
    await fixture.whenStable();
    expect(deleteSpy).toHaveBeenCalledWith('seg_beta');
  });

  it('should filter segments by the search query', () => {
    searchStore.setQuery('zzzz-no-match');
    fixture.detectChanges();

    expect(getRowCount(fixture)).toBe(0);
    expectEmptyState(fixture);
  });

  describe('segment name links', () => {
    it('should render segment name as a link', () => {
      expectExists(fixture, '.segment-name--link');
    });

    it('should link to segment detail page', () => {
      const links = queryAll(fixture, '.segment-name--link');
      const firstLink = links[0];
      expect(firstLink.attributes['href']).toContain('/segments/seg_');
    });
  });
});
