import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Icon } from './icon';

describe('Icon', () => {
  let component: Icon;
  let fixture: ComponentFixture<Icon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Icon]
    }).compileComponents();

    fixture = TestBed.createComponent(Icon);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('name', 'plus');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render an SVG element', () => {
      fixture.componentRef.setInput('name', 'plus');
      fixture.detectChanges();

      const svg = fixture.debugElement.query(By.css('svg'));
      expect(svg).toBeTruthy();
    });

    it('should render the correct icon path for "plus"', () => {
      fixture.componentRef.setInput('name', 'plus');
      fixture.detectChanges();

      const path = fixture.debugElement.query(By.css('svg path'));
      expect(path).toBeTruthy();
      expect(path.nativeElement.getAttribute('d')).toContain('M8 2');
    });

    it('should render the correct icon path for "search"', () => {
      fixture.componentRef.setInput('name', 'search');
      fixture.detectChanges();

      const path = fixture.debugElement.query(By.css('svg path'));
      expect(path).toBeTruthy();
      expect(path.nativeElement.getAttribute('d')).toContain('11.5 7');
    });

    it('should render the correct icon path for "menu"', () => {
      fixture.componentRef.setInput('name', 'menu');
      fixture.detectChanges();

      const path = fixture.debugElement.query(By.css('svg path'));
      expect(path).toBeTruthy();
    });
  });

  describe('size', () => {
    it('should default to 20x20 size', () => {
      fixture.componentRef.setInput('name', 'plus');
      fixture.detectChanges();

      const svg = fixture.debugElement.query(By.css('svg'));
      expect(svg.nativeElement.getAttribute('width')).toBe('20');
      expect(svg.nativeElement.getAttribute('height')).toBe('20');
    });

    it('should accept a custom size', () => {
      fixture.componentRef.setInput('name', 'plus');
      fixture.componentRef.setInput('size', 16);
      fixture.detectChanges();

      const svg = fixture.debugElement.query(By.css('svg'));
      expect(svg.nativeElement.getAttribute('width')).toBe('16');
      expect(svg.nativeElement.getAttribute('height')).toBe('16');
    });

    it('should accept size as string', () => {
      fixture.componentRef.setInput('name', 'plus');
      fixture.componentRef.setInput('size', '24');
      fixture.detectChanges();

      const svg = fixture.debugElement.query(By.css('svg'));
      expect(svg.nativeElement.getAttribute('width')).toBe('24');
      expect(svg.nativeElement.getAttribute('height')).toBe('24');
    });
  });

  describe('accessibility', () => {
    it('should have aria-hidden attribute', () => {
      fixture.componentRef.setInput('name', 'plus');
      fixture.detectChanges();

      const svg = fixture.debugElement.query(By.css('svg'));
      expect(svg.nativeElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have focusable set to false', () => {
      fixture.componentRef.setInput('name', 'plus');
      fixture.detectChanges();

      const svg = fixture.debugElement.query(By.css('svg'));
      expect(svg.nativeElement.getAttribute('focusable')).toBe('false');
    });
  });

  describe('host element', () => {
    it('should have the icon class on host', () => {
      fixture.componentRef.setInput('name', 'plus');
      fixture.detectChanges();

      const host = fixture.debugElement.nativeElement;
      expect(host.classList.contains('icon')).toBe(true);
    });
  });

  describe('all icons', () => {
    const iconNames = [
      'menu',
      'chevron-right',
      'search',
      'plus',
      'home',
      'flag',
      'folder',
      'users',
      'list',
      'settings'
    ];

    iconNames.forEach(iconName => {
      it(`should render "${iconName}" icon without error`, () => {
        fixture.componentRef.setInput('name', iconName);
        fixture.detectChanges();

        const svg = fixture.debugElement.query(By.css('svg'));
        expect(svg).toBeTruthy();
        const path = fixture.debugElement.query(By.css('svg path'));
        expect(path).toBeTruthy();
      });
    });
  });
});
