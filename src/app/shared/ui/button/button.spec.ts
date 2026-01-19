import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ButtonComponent } from './button';

describe('Button', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render a button element', () => {
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button).toBeTruthy();
    });

    it('should project content into the button', () => {
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button).toBeTruthy();
    });
  });

  describe('variants', () => {
    it('should default to primary variant', () => {
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.classList.contains('btn')).toBe(true);
      expect(button.nativeElement.classList.contains('btn--primary')).toBe(true);
    });

    it('should apply primary variant class', () => {
      fixture.componentRef.setInput('variant', 'primary');
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.classList.contains('btn--primary')).toBe(true);
    });

    it('should apply secondary variant class', () => {
      fixture.componentRef.setInput('variant', 'secondary');
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.classList.contains('btn--secondary')).toBe(true);
    });

    it('should apply ghost variant class', () => {
      fixture.componentRef.setInput('variant', 'ghost');
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.classList.contains('btn--ghost')).toBe(true);
    });
  });

  describe('icon', () => {
    it('should not render icon when not provided', () => {
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon).toBeFalsy();
    });

    it('should render icon when provided', () => {
      fixture.componentRef.setInput('icon', 'plus');
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon).toBeTruthy();
    });

    it('should pass icon name to app-icon component', () => {
      fixture.componentRef.setInput('icon', 'search');
      fixture.detectChanges();

      const svg = fixture.debugElement.query(By.css('app-icon svg'));
      expect(svg).toBeTruthy();
      // The search icon has a specific path that includes '11.5 7'
      const path = svg.query(By.css('path'));
      expect(path.nativeElement.getAttribute('d')).toContain('11.5 7');
    });

    it('should use default icon size of 16', () => {
      fixture.componentRef.setInput('icon', 'plus');
      fixture.detectChanges();

      const svg = fixture.debugElement.query(By.css('app-icon svg'));
      expect(svg.nativeElement.getAttribute('width')).toBe('16');
      expect(svg.nativeElement.getAttribute('height')).toBe('16');
    });

    it('should apply custom icon size', () => {
      fixture.componentRef.setInput('icon', 'plus');
      fixture.componentRef.setInput('iconSize', 20);
      fixture.detectChanges();

      const svg = fixture.debugElement.query(By.css('app-icon svg'));
      expect(svg.nativeElement.getAttribute('width')).toBe('20');
      expect(svg.nativeElement.getAttribute('height')).toBe('20');
    });
  });

  describe('disabled state', () => {
    it('should not be disabled by default', () => {
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.disabled).toBe(false);
    });

    it('should be disabled when disabled input is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.disabled).toBe(true);
    });

    it('should not be disabled when disabled input is false', () => {
      fixture.componentRef.setInput('disabled', false);
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.disabled).toBe(false);
    });
  });

  describe('button type', () => {
    it('should default to button type', () => {
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.type).toBe('button');
    });

    it('should accept submit type', () => {
      fixture.componentRef.setInput('type', 'submit');
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.type).toBe('submit');
    });

    it('should accept reset type', () => {
      fixture.componentRef.setInput('type', 'reset');
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.type).toBe('reset');
    });
  });

  describe('size', () => {
    it('should default to medium size', () => {
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.classList.contains('btn--md')).toBe(true);
    });

    it('should apply small size class', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.classList.contains('btn--sm')).toBe(true);
    });

    it('should apply medium size class', () => {
      fixture.componentRef.setInput('size', 'md');
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.classList.contains('btn--md')).toBe(true);
    });

    it('should apply large size class', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.classList.contains('btn--lg')).toBe(true);
    });
  });

  describe('loading state', () => {
    it('should not be loading by default', () => {
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.classList.contains('btn--loading')).toBe(false);
    });

    it('should apply loading class when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.classList.contains('btn--loading')).toBe(true);
    });

    it('should be disabled when loading', () => {
      fixture.componentRef.setInput('loading', false);
      fixture.componentRef.setInput('disabled', false);
      fixture.detectChanges();

      // Button should not be disabled initially
      let button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.disabled).toBe(false);

      // Set loading to true
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.disabled).toBe(true);
    });

    it('should show loading spinner when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.btn__spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should hide icon when loading', () => {
      fixture.componentRef.setInput('icon', 'plus');
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon).toBeFalsy();
    });
  });

  describe('accessibility', () => {
    it('should have aria-disabled when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should have aria-busy when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.getAttribute('aria-busy')).toBe('true');
    });
  });
});
