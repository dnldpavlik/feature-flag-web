import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { SearchStore } from '@/app/shared/store/search.store';
import { SegmentStore } from '@/app/features/segments/store/segment.store';
import { SegmentListComponent } from './segment-list';

describe('SegmentList', () => {
  let fixture: ComponentFixture<SegmentListComponent>;
  let store: SegmentStore;
  let searchStore: SearchStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegmentListComponent],
      providers: [provideRouter([]), SegmentStore, SearchStore],
    }).compileComponents();

    fixture = TestBed.createComponent(SegmentListComponent);
    store = TestBed.inject(SegmentStore);
    searchStore = TestBed.inject(SearchStore);
    fixture.detectChanges();
  });

  it('should render the segments heading', () => {
    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading.nativeElement.textContent).toContain('Segments');
  });

  it('should render segment rows', () => {
    const rows = fixture.debugElement.queryAll(By.css('.segments-table__row'));
    expect(rows.length).toBe(store.segments().length + 1);
  });

  it('should add a segment', () => {
    fixture.componentInstance.name = 'VIP Customers';
    fixture.componentInstance.key = 'vip-customers';
    fixture.componentInstance.description = 'High-value customers.';
    fixture.componentInstance.addSegment();
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.segments-table__row'));
    expect(rows.length).toBe(store.segments().length + 1);
  });

  it('should not add a segment when required fields are missing', () => {
    const initialCount = store.segments().length;
    fixture.componentInstance.name = '';
    fixture.componentInstance.key = '';
    fixture.componentInstance.addSegment();
    expect(store.segments().length).toBe(initialCount);
  });

  it('should delete a segment', () => {
    const deleteSpy = jest.spyOn(store, 'deleteSegment');
    fixture.componentInstance.deleteSegment('seg_beta');
    expect(deleteSpy).toHaveBeenCalledWith('seg_beta');
  });

  it('should filter segments by the search query', () => {
    searchStore.setQuery('zzzz-no-match');
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.segments-table__row'));
    expect(rows.length).toBe(0);
    const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
    expect(emptyState).toBeTruthy();
  });

  describe('form field accessors', () => {
    it('should get and set name field', () => {
      fixture.componentInstance.name = 'Test Segment';
      expect(fixture.componentInstance.name).toBe('Test Segment');
    });

    it('should get and set key field', () => {
      fixture.componentInstance.key = 'test-key';
      expect(fixture.componentInstance.key).toBe('test-key');
    });

    it('should get and set description field', () => {
      fixture.componentInstance.description = 'Test description';
      expect(fixture.componentInstance.description).toBe('Test description');
    });
  });

  describe('segment name links', () => {
    it('should render segment name as a link', () => {
      const link = fixture.debugElement.query(By.css('.segment-name--link'));
      expect(link).toBeTruthy();
    });

    it('should link to segment detail page', () => {
      const links = fixture.debugElement.queryAll(By.css('.segment-name--link'));
      const firstLink = links[0];
      expect(firstLink.attributes['href']).toContain('/segments/seg_');
    });
  });
});
