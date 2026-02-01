import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LogoIconComponent } from './logo-icon';

describe('LogoIcon', () => {
  let component: LogoIconComponent;
  let fixture: ComponentFixture<LogoIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogoIconComponent);
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

    it('should render the gradient rect', () => {
      const rect = fixture.debugElement.query(By.css('rect'));
      expect(rect).toBeTruthy();
      expect(rect.nativeElement.getAttribute('fill')).toBe('url(#logo-gradient)');
    });

    it('should render the checkmark path', () => {
      const path = fixture.debugElement.query(By.css('path'));
      expect(path).toBeTruthy();
      expect(path.nativeElement.getAttribute('stroke')).toBe('white');
    });

    it('should include the gradient definition', () => {
      const gradient = fixture.debugElement.query(By.css('linearGradient#logo-gradient'));
      expect(gradient).toBeTruthy();
    });
  });

  describe('size', () => {
    it('should default to 32x32 size', () => {
      const svg = fixture.debugElement.query(By.css('svg'));
      expect(svg.nativeElement.getAttribute('width')).toBe('32');
      expect(svg.nativeElement.getAttribute('height')).toBe('32');
    });

    it('should accept a custom size', () => {
      fixture.componentRef.setInput('size', 48);
      fixture.detectChanges();

      const svg = fixture.debugElement.query(By.css('svg'));
      expect(svg.nativeElement.getAttribute('width')).toBe('48');
      expect(svg.nativeElement.getAttribute('height')).toBe('48');
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
