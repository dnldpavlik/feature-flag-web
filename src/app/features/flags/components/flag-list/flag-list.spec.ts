import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FlagListComponent } from './flag-list';

describe('FlagList', () => {
  let fixture: ComponentFixture<FlagListComponent>;
  let component: FlagListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlagListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlagListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the feature flags heading', () => {
    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading).toBeTruthy();
    expect(heading.nativeElement.textContent).toContain('Feature Flags');
  });

  it('should render flag rows', () => {
    const rows = fixture.debugElement.queryAll(By.css('.flags-table__row'));
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should filter flags by status', () => {
    component.onStatusChange({ target: { value: 'enabled' } } as Event);
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.flags-table__row'));
    expect(rows.length).toBe(3);
  });

  it('should show disabled flags when filtered', () => {
    component.onStatusChange({ target: { value: 'disabled' } } as Event);
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.flags-table__row'));
    expect(rows.length).toBe(2);
  });

  it('should filter flags by type', () => {
    component.onTypeChange({ target: { value: 'string' } } as Event);
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.flags-table__row'));
    expect(rows.length).toBe(1);
  });
});
