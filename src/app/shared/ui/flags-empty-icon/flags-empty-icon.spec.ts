import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FlagsEmptyIconComponent } from './flags-empty-icon';

describe('FlagsEmptyIcon', () => {
  let component: FlagsEmptyIconComponent;
  let fixture: ComponentFixture<FlagsEmptyIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlagsEmptyIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlagsEmptyIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render an SVG element', () => {
      const svg = fixture.debugElement.query(By.css('svg'));
      expect(svg).toBeTruthy();
    });

    it('should render the window frame rect', () => {
      const rect = fixture.debugElement.query(By.css('rect'));
      expect(rect).toBeTruthy();
      expect(rect.nativeElement.getAttribute('stroke')).toBe('currentColor');
    });

    it('should render the three window dots', () => {
      const circles = fixture.debugElement.queryAll(By.css('circle'));
      expect(circles.length).toBe(3);
    });

    it('should render content lines', () => {
      const paths = fixture.debugElement.queryAll(By.css('path'));
      expect(paths.length).toBe(2); // header line and content lines
    });
  });

  describe('size', () => {
    it('should default to 48x48 size', () => {
      const svg = fixture.debugElement.query(By.css('svg'));
      expect(svg.nativeElement.getAttribute('width')).toBe('48');
      expect(svg.nativeElement.getAttribute('height')).toBe('48');
    });

    it('should accept a custom size', () => {
      fixture.componentRef.setInput('size', 64);
      fixture.detectChanges();

      const svg = fixture.debugElement.query(By.css('svg'));
      expect(svg.nativeElement.getAttribute('width')).toBe('64');
      expect(svg.nativeElement.getAttribute('height')).toBe('64');
    });
  });

  describe('accessibility', () => {
    it('should have aria-hidden attribute', () => {
      const svg = fixture.debugElement.query(By.css('svg'));
      expect(svg.nativeElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have focusable set to false', () => {
      const svg = fixture.debugElement.query(By.css('svg'));
      expect(svg.nativeElement.getAttribute('focusable')).toBe('false');
    });
  });
});
