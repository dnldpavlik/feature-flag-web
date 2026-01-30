import { ComponentFixture } from '@angular/core/testing';

import { SearchInputComponent } from './search-input';
import {
  createComponentFixture,
  query,
  expectExists,
  expectNotExists,
  getText,
  expectHasClass,
  getComponent,
} from '@/app/testing';

describe('SearchInput', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  beforeEach(async () => {
    fixture = await createComponentFixture(SearchInputComponent);
    component = getComponent(fixture);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render the container with search-input class', () => {
      fixture.detectChanges();
      expectExists(fixture, '.search-input');
    });

    it('should render a search icon', () => {
      fixture.detectChanges();
      expectExists(fixture, 'app-icon');
    });

    it('should render an input element', () => {
      fixture.detectChanges();
      expectExists(fixture, 'input');
      const input = query(fixture, 'input');
      expect(input?.nativeElement.type).toBe('text');
    });
  });

  describe('placeholder', () => {
    it('should use default placeholder', () => {
      fixture.detectChanges();

      const input = query(fixture, 'input');
      expect(input?.nativeElement.placeholder).toBe('Search...');
    });

    it('should use custom placeholder', () => {
      fixture.componentRef.setInput('placeholder', 'Search flags...');
      fixture.detectChanges();

      const input = query(fixture, 'input');
      expect(input?.nativeElement.placeholder).toBe('Search flags...');
    });
  });

  describe('keyboard shortcut hint', () => {
    it('should not show shortcut hint by default', () => {
      fixture.detectChanges();
      expectNotExists(fixture, '.search-input__shortcut');
    });

    it('should show shortcut hint when provided', () => {
      fixture.componentRef.setInput('shortcutHint', '/');
      fixture.detectChanges();

      expectExists(fixture, '.search-input__shortcut');
      expect(getText(fixture, '.search-input__shortcut')).toBe('/');
    });

    it('should show custom shortcut hint', () => {
      fixture.componentRef.setInput('shortcutHint', 'Ctrl+K');
      fixture.detectChanges();

      expect(getText(fixture, '.search-input__shortcut')).toBe('Ctrl+K');
    });
  });

  describe('value binding', () => {
    it('should have empty value by default', () => {
      fixture.detectChanges();

      const input = query(fixture, 'input');
      expect(input?.nativeElement.value).toBe('');
    });

    it('should accept initial value', () => {
      fixture.componentRef.setInput('value', 'test query');
      fixture.detectChanges();

      const input = query(fixture, 'input');
      expect(input?.nativeElement.value).toBe('test query');
    });

    it('should emit valueChange on input', () => {
      fixture.detectChanges();
      const spy = jest.fn();
      component.valueChange.subscribe(spy);

      const input = query(fixture, 'input');
      input!.nativeElement.value = 'new value';
      input!.nativeElement.dispatchEvent(new Event('input'));

      expect(spy).toHaveBeenCalledWith('new value');
    });
  });

  describe('search event', () => {
    it('should emit searchSubmit event on enter key', () => {
      fixture.componentRef.setInput('value', 'search term');
      fixture.detectChanges();
      const spy = jest.fn();
      component.searchSubmit.subscribe(spy);

      const input = query(fixture, 'input');
      input!.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(spy).toHaveBeenCalledWith('search term');
    });

    it('should not emit searchSubmit for other keys', () => {
      fixture.componentRef.setInput('value', 'search term');
      fixture.detectChanges();
      const spy = jest.fn();
      component.searchSubmit.subscribe(spy);

      const input = query(fixture, 'input');
      input!.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('focus method', () => {
    it('should focus the input when focus() is called', () => {
      fixture.detectChanges();

      const input = query(fixture, 'input');
      const focusSpy = jest.spyOn(input!.nativeElement, 'focus');

      component.focus();

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should not be disabled by default', () => {
      fixture.detectChanges();

      const input = query(fixture, 'input');
      expect(input?.nativeElement.disabled).toBe(false);
    });

    it('should be disabled when disabled input is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const input = query(fixture, 'input');
      expect(input?.nativeElement.disabled).toBe(true);
    });

    it('should apply disabled class to container', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expectHasClass(fixture, '.search-input', 'search-input--disabled');
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on input', () => {
      fixture.detectChanges();

      const input = query(fixture, 'input');
      expect(input?.nativeElement.getAttribute('aria-label')).toBe('Search');
    });

    it('should use custom aria-label', () => {
      fixture.componentRef.setInput('ariaLabel', 'Search feature flags');
      fixture.detectChanges();

      const input = query(fixture, 'input');
      expect(input?.nativeElement.getAttribute('aria-label')).toBe('Search feature flags');
    });
  });
});
