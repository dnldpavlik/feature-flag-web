import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ToolbarComponent } from './toolbar';

@Component({
  imports: [ToolbarComponent],
  template: `
    <app-toolbar>
      <div toolbar-filters class="test-filters">Filter Controls</div>
      <div toolbar-meta class="test-meta">Meta Info</div>
    </app-toolbar>
  `,
})
class TestHostComponent {}

describe('Toolbar', () => {
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarComponent);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should apply the toolbar class to the host element', () => {
    expect(fixture.nativeElement.classList.contains('toolbar')).toBe(true);
  });

  it('should render filters and meta containers', () => {
    const filters = fixture.debugElement.query(By.css('.toolbar__filters'));
    const meta = fixture.debugElement.query(By.css('.toolbar__meta'));

    expect(filters).toBeTruthy();
    expect(meta).toBeTruthy();
  });
});

describe('Toolbar with content projection', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should project filters content into the filters slot', () => {
    const filters = fixture.debugElement.query(By.css('.toolbar__filters .test-filters'));
    expect(filters).toBeTruthy();
    expect(filters.nativeElement.textContent).toBe('Filter Controls');
  });

  it('should project meta content into the meta slot', () => {
    const meta = fixture.debugElement.query(By.css('.toolbar__meta .test-meta'));
    expect(meta).toBeTruthy();
    expect(meta.nativeElement.textContent).toBe('Meta Info');
  });
});
