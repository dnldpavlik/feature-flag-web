import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DashboardComponent } from './dashboard';

describe('Dashboard', () => {
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });

  it('should render the welcome heading', () => {
    const heading = fixture.debugElement.query(By.css('h1'));
    expect(heading).toBeTruthy();
    expect(heading.nativeElement.textContent).toContain('Feature Flags');
  });

  it('should render stat cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('app-stat-card'));
    expect(cards.length).toBe(4);
  });

  it('should render the empty state', () => {
    const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
    expect(emptyState).toBeTruthy();
  });
});
