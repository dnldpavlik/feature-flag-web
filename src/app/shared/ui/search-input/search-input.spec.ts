import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SearchInputComponent } from './search-input';

describe('SearchInput', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should render the container with search-input class', () => {
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.search-input'));
      expect(container).toBeTruthy();
    });

    it('should render a search icon', () => {
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('app-icon'));
      expect(icon).toBeTruthy();
    });

    it('should render an input element', () => {
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      expect(input).toBeTruthy();
      expect(input.nativeElement.type).toBe('text');
    });
  });

  describe('placeholder', () => {
    it('should use default placeholder', () => {
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.placeholder).toBe('Search...');
    });

    it('should use custom placeholder', () => {
      fixture.componentRef.setInput('placeholder', 'Search flags...');
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.placeholder).toBe('Search flags...');
    });
  });

  describe('keyboard shortcut hint', () => {
    it('should not show shortcut hint by default', () => {
      fixture.detectChanges();

      const shortcut = fixture.debugElement.query(By.css('.search-input__shortcut'));
      expect(shortcut).toBeFalsy();
    });

    it('should show shortcut hint when provided', () => {
      fixture.componentRef.setInput('shortcutHint', '/');
      fixture.detectChanges();

      const shortcut = fixture.debugElement.query(By.css('.search-input__shortcut'));
      expect(shortcut).toBeTruthy();
      expect(shortcut.nativeElement.textContent.trim()).toBe('/');
    });

    it('should show custom shortcut hint', () => {
      fixture.componentRef.setInput('shortcutHint', 'Ctrl+K');
      fixture.detectChanges();

      const shortcut = fixture.debugElement.query(By.css('.search-input__shortcut'));
      expect(shortcut.nativeElement.textContent.trim()).toBe('Ctrl+K');
    });
  });

  describe('value binding', () => {
    it('should have empty value by default', () => {
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.value).toBe('');
    });

    it('should accept initial value', () => {
      fixture.componentRef.setInput('value', 'test query');
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.value).toBe('test query');
    });

    it('should emit valueChange on input', () => {
      fixture.detectChanges();
      const spy = jest.fn();
      component.valueChange.subscribe(spy);

      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = 'new value';
      input.nativeElement.dispatchEvent(new Event('input'));

      expect(spy).toHaveBeenCalledWith('new value');
    });
  });

  describe('search event', () => {
    it('should emit searchSubmit event on enter key', () => {
      fixture.componentRef.setInput('value', 'search term');
      fixture.detectChanges();
      const spy = jest.fn();
      component.searchSubmit.subscribe(spy);

      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(spy).toHaveBeenCalledWith('search term');
    });
  });

  describe('focus method', () => {
    it('should focus the input when focus() is called', () => {
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      const focusSpy = jest.spyOn(input.nativeElement, 'focus');

      component.focus();

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should not be disabled by default', () => {
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.disabled).toBe(false);
    });

    it('should be disabled when disabled input is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.disabled).toBe(true);
    });

    it('should apply disabled class to container', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.search-input'));
      expect(container.nativeElement.classList.contains('search-input--disabled')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on input', () => {
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.getAttribute('aria-label')).toBe('Search');
    });

    it('should use custom aria-label', () => {
      fixture.componentRef.setInput('ariaLabel', 'Search feature flags');
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.getAttribute('aria-label')).toBe('Search feature flags');
    });
  });
});
