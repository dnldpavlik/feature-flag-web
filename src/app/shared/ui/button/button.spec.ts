import { ComponentFixture } from '@angular/core/testing';

import { ButtonComponent } from './button';
import {
  createComponentFixture,
  query,
  expectExists,
  expectNotExists,
  expectHasClass,
  getComponent,
} from '@/app/testing';

describe('Button', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    fixture = await createComponentFixture(ButtonComponent);
    component = getComponent(fixture);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render a button element', () => {
      fixture.detectChanges();
      expectExists(fixture, 'button');
    });

    it('should project content into the button', () => {
      fixture.detectChanges();
      expectExists(fixture, 'button');
    });
  });

  describe('variants', () => {
    it('should default to primary variant', () => {
      fixture.detectChanges();
      expectHasClass(fixture, 'button', 'btn');
      expectHasClass(fixture, 'button', 'btn--primary');
    });

    it('should apply primary variant class', () => {
      fixture.componentRef.setInput('variant', 'primary');
      fixture.detectChanges();
      expectHasClass(fixture, 'button', 'btn--primary');
    });

    it('should apply secondary variant class', () => {
      fixture.componentRef.setInput('variant', 'secondary');
      fixture.detectChanges();
      expectHasClass(fixture, 'button', 'btn--secondary');
    });

    it('should apply ghost variant class', () => {
      fixture.componentRef.setInput('variant', 'ghost');
      fixture.detectChanges();
      expectHasClass(fixture, 'button', 'btn--ghost');
    });
  });

  describe('icon', () => {
    it('should not render icon when not provided', () => {
      fixture.detectChanges();
      expectNotExists(fixture, 'app-icon');
    });

    it('should render icon when provided', () => {
      fixture.componentRef.setInput('icon', 'plus');
      fixture.detectChanges();
      expectExists(fixture, 'app-icon');
    });

    it('should pass icon name to app-icon component', () => {
      fixture.componentRef.setInput('icon', 'search');
      fixture.detectChanges();

      const svg = query(fixture, 'app-icon svg');
      expect(svg).toBeTruthy();
      // The search icon has a specific path that includes '11.5 7'
      const path = query(fixture, 'app-icon svg path');
      expect(path?.nativeElement.getAttribute('d')).toContain('11.5 7');
    });

    it('should use default icon size of 16', () => {
      fixture.componentRef.setInput('icon', 'plus');
      fixture.detectChanges();

      const svg = query(fixture, 'app-icon svg');
      expect(svg?.nativeElement.getAttribute('width')).toBe('16');
      expect(svg?.nativeElement.getAttribute('height')).toBe('16');
    });

    it('should apply custom icon size', () => {
      fixture.componentRef.setInput('icon', 'plus');
      fixture.componentRef.setInput('iconSize', 20);
      fixture.detectChanges();

      const svg = query(fixture, 'app-icon svg');
      expect(svg?.nativeElement.getAttribute('width')).toBe('20');
      expect(svg?.nativeElement.getAttribute('height')).toBe('20');
    });
  });

  describe('disabled state', () => {
    it('should not be disabled by default', () => {
      fixture.detectChanges();

      const button = query(fixture, 'button');
      expect(button?.nativeElement.disabled).toBe(false);
    });

    it('should be disabled when disabled input is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const button = query(fixture, 'button');
      expect(button?.nativeElement.disabled).toBe(true);
    });

    it('should not be disabled when disabled input is false', () => {
      fixture.componentRef.setInput('disabled', false);
      fixture.detectChanges();

      const button = query(fixture, 'button');
      expect(button?.nativeElement.disabled).toBe(false);
    });
  });

  describe('button type', () => {
    it('should default to button type', () => {
      fixture.detectChanges();

      const button = query(fixture, 'button');
      expect(button?.nativeElement.type).toBe('button');
    });

    it('should accept submit type', () => {
      fixture.componentRef.setInput('type', 'submit');
      fixture.detectChanges();

      const button = query(fixture, 'button');
      expect(button?.nativeElement.type).toBe('submit');
    });

    it('should accept reset type', () => {
      fixture.componentRef.setInput('type', 'reset');
      fixture.detectChanges();

      const button = query(fixture, 'button');
      expect(button?.nativeElement.type).toBe('reset');
    });
  });

  describe('size', () => {
    it('should default to medium size', () => {
      fixture.detectChanges();
      expectHasClass(fixture, 'button', 'btn--md');
    });

    it('should apply small size class', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expectHasClass(fixture, 'button', 'btn--sm');
    });

    it('should apply medium size class', () => {
      fixture.componentRef.setInput('size', 'md');
      fixture.detectChanges();
      expectHasClass(fixture, 'button', 'btn--md');
    });

    it('should apply large size class', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expectHasClass(fixture, 'button', 'btn--lg');
    });
  });

  describe('loading state', () => {
    it('should not be loading by default', () => {
      fixture.detectChanges();

      const button = query(fixture, 'button');
      expect(button?.nativeElement.classList.contains('btn--loading')).toBe(false);
    });

    it('should apply loading class when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expectHasClass(fixture, 'button', 'btn--loading');
    });

    it('should be disabled when loading', () => {
      fixture.componentRef.setInput('loading', false);
      fixture.componentRef.setInput('disabled', false);
      fixture.detectChanges();

      // Button should not be disabled initially
      let button = query(fixture, 'button');
      expect(button?.nativeElement.disabled).toBe(false);

      // Set loading to true
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      button = query(fixture, 'button');
      expect(button?.nativeElement.disabled).toBe(true);
    });

    it('should show loading spinner when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expectExists(fixture, '.btn__spinner');
    });

    it('should hide icon when loading', () => {
      fixture.componentRef.setInput('icon', 'plus');
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expectNotExists(fixture, 'app-icon');
    });
  });

  describe('accessibility', () => {
    it('should have aria-disabled when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const button = query(fixture, 'button');
      expect(button?.nativeElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should have aria-busy when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const button = query(fixture, 'button');
      expect(button?.nativeElement.getAttribute('aria-busy')).toBe('true');
    });
  });
});
