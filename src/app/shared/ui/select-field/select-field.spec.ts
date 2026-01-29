import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { SelectFieldComponent, SelectOption } from './select-field';

describe('SelectFieldComponent', () => {
  const defaultOptions: SelectOption[] = [
    { value: 'boolean', label: 'Boolean' },
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'json', label: 'JSON' },
  ];

  describe('basic rendering', () => {
    it('should render with label', () => {
      const { fixture } = setup({ label: 'Type', options: defaultOptions });
      const label = fixture.nativeElement.querySelector('label');
      expect(label.textContent).toContain('Type');
    });

    it('should render select element', () => {
      const { fixture } = setup({ label: 'Type', options: defaultOptions });
      const select = fixture.nativeElement.querySelector('select');
      expect(select).toBeTruthy();
    });

    it('should render all options', () => {
      const { fixture } = setup({ label: 'Type', options: defaultOptions });
      const options = fixture.nativeElement.querySelectorAll('option');
      expect(options.length).toBe(4);
      expect(options[0].textContent).toContain('Boolean');
      expect(options[1].textContent).toContain('String');
      expect(options[2].textContent).toContain('Number');
      expect(options[3].textContent).toContain('JSON');
    });

    it('should render placeholder as disabled option when provided', () => {
      const { fixture } = setup({
        label: 'Type',
        options: defaultOptions,
        placeholder: 'Select a type...',
      });
      const options = fixture.nativeElement.querySelectorAll('option');
      expect(options[0].textContent).toContain('Select a type...');
      expect(options[0].value).toBe('');
      expect(options[0].disabled).toBe(true);
    });

    it('should render hint text when provided', () => {
      const { fixture } = setup({
        label: 'Type',
        options: defaultOptions,
        hint: 'Choose the data type',
      });
      const hint = fixture.nativeElement.querySelector('.form-field__hint');
      expect(hint.textContent).toContain('Choose the data type');
    });

    it('should not render hint element when not provided', () => {
      const { fixture } = setup({ label: 'Type', options: defaultOptions });
      const hint = fixture.nativeElement.querySelector('.form-field__hint');
      expect(hint).toBeFalsy();
    });
  });

  describe('error state', () => {
    it('should render error message when provided', () => {
      const { fixture } = setup({
        label: 'Type',
        options: defaultOptions,
        error: 'Type is required',
      });
      const error = fixture.nativeElement.querySelector('.form-field__error');
      expect(error.textContent).toContain('Type is required');
    });

    it('should not render error element when not provided', () => {
      const { fixture } = setup({ label: 'Type', options: defaultOptions });
      const error = fixture.nativeElement.querySelector('.form-field__error');
      expect(error).toBeFalsy();
    });

    it('should add error class to host when error is present', () => {
      const { fixture } = setup({
        label: 'Type',
        options: defaultOptions,
        error: 'Required',
      });
      const host = fixture.debugElement.query(By.directive(SelectFieldComponent));
      expect(host.nativeElement.classList.contains('form-field--error')).toBe(true);
    });

    it('should add error class to select when error is present', () => {
      const { fixture } = setup({
        label: 'Type',
        options: defaultOptions,
        error: 'Required',
      });
      const select = fixture.nativeElement.querySelector('select');
      expect(select.classList.contains('form-field__select--error')).toBe(true);
    });

    it('should set aria-invalid when error is present', () => {
      const { fixture } = setup({
        label: 'Type',
        options: defaultOptions,
        error: 'Required',
      });
      const select = fixture.nativeElement.querySelector('select');
      expect(select.getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('disabled state', () => {
    it('should disable select when disabled is true', () => {
      const { fixture } = setup({
        label: 'Type',
        options: defaultOptions,
        disabled: true,
      });
      const select = fixture.nativeElement.querySelector('select');
      expect(select.disabled).toBe(true);
    });

    it('should add disabled class to host when disabled', () => {
      const { fixture } = setup({
        label: 'Type',
        options: defaultOptions,
        disabled: true,
      });
      const host = fixture.debugElement.query(By.directive(SelectFieldComponent));
      expect(host.nativeElement.classList.contains('form-field--disabled')).toBe(true);
    });
  });

  describe('options with disabled state', () => {
    it('should render disabled options', () => {
      const optionsWithDisabled: SelectOption[] = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B', disabled: true },
        { value: 'c', label: 'Option C' },
      ];
      const { fixture } = setup({ label: 'Choice', options: optionsWithDisabled });
      const options = fixture.nativeElement.querySelectorAll('option');
      expect(options[0].disabled).toBe(false);
      expect(options[1].disabled).toBe(true);
      expect(options[2].disabled).toBe(false);
    });
  });

  describe('reactive forms integration', () => {
    it('should work with formControl', () => {
      const { fixture, component } = setupWithFormControl();
      const select = fixture.nativeElement.querySelector('select');

      // Initial value
      expect(select.value).toBe('boolean');

      // Update from form control
      component.control.setValue('string');
      fixture.detectChanges();
      expect(select.value).toBe('string');

      // Update from select
      select.value = 'json';
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(component.control.value).toBe('json');
    });

    it('should reflect disabled state from form control', () => {
      const { fixture, component } = setupWithFormControl();
      const select = fixture.nativeElement.querySelector('select');

      component.control.disable();
      fixture.detectChanges();
      expect(select.disabled).toBe(true);

      component.control.enable();
      fixture.detectChanges();
      expect(select.disabled).toBe(false);
    });

    it('should handle null value in writeValue', () => {
      const { fixture, component } = setupWithFormControl();

      // Setting null should not throw and should set internal value to ''
      expect(() => {
        component.control.setValue(null);
        fixture.detectChanges();
      }).not.toThrow();

      // The form control value should be null
      expect(component.control.value).toBeNull();
    });

    it('should call onTouched when select loses focus', () => {
      const { fixture, component } = setupWithFormControl();
      const select = fixture.nativeElement.querySelector('select');

      expect(component.control.touched).toBe(false);

      select.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(component.control.touched).toBe(true);
    });

    it('should register onChange and onTouched callbacks', () => {
      const { fixture, component } = setupWithFormControl();
      const select = fixture.nativeElement.querySelector('select');

      // These callbacks are registered when the form control binds
      // Change triggers onChange
      select.value = 'json';
      select.dispatchEvent(new Event('change'));

      // Blur triggers onTouched
      select.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(component.control.value).toBe('json');
      expect(component.control.touched).toBe(true);
    });
  });

  describe('standalone usage (no form control)', () => {
    it('should handle selection without form control', () => {
      const { fixture } = setup({ label: 'Type', options: defaultOptions });
      const select = fixture.nativeElement.querySelector('select');

      select.value = 'number';
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(select.value).toBe('number');
    });

    it('should handle blur without form control', () => {
      const { fixture } = setup({ label: 'Type', options: defaultOptions });
      const select = fixture.nativeElement.querySelector('select');

      select.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      // Should not throw
      expect(select).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should associate label with select via id', () => {
      const { fixture } = setup({
        label: 'Type',
        options: defaultOptions,
        id: 'type-select',
      });
      const label = fixture.nativeElement.querySelector('label');
      const select = fixture.nativeElement.querySelector('select');
      expect(label.getAttribute('for')).toBe('type-select');
      expect(select.id).toBe('type-select');
    });

    it('should generate unique id when not provided', () => {
      const { fixture } = setup({ label: 'Type', options: defaultOptions });
      const label = fixture.nativeElement.querySelector('label');
      const select = fixture.nativeElement.querySelector('select');
      expect(label.getAttribute('for')).toBeTruthy();
      expect(select.id).toBe(label.getAttribute('for'));
    });

    it('should set aria-describedby when hint is present', () => {
      const { fixture } = setup({
        label: 'Type',
        options: defaultOptions,
        hint: 'Help text',
        id: 'type-select',
      });
      const select = fixture.nativeElement.querySelector('select');
      expect(select.getAttribute('aria-describedby')).toContain('type-select-hint');
    });

    it('should set aria-describedby when error is present', () => {
      const { fixture } = setup({
        label: 'Type',
        options: defaultOptions,
        error: 'Required',
        id: 'type-select',
      });
      const select = fixture.nativeElement.querySelector('select');
      expect(select.getAttribute('aria-describedby')).toContain('type-select-error');
    });
  });
});

// Test helpers
interface SetupOptions {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
}

function setup(options: SetupOptions) {
  @Component({
    imports: [SelectFieldComponent],
    template: `
      <app-select-field
        [label]="label"
        [options]="options"
        [placeholder]="placeholder"
        [hint]="hint"
        [error]="error"
        [disabled]="disabled"
        [id]="id"
      />
    `,
  })
  class TestHostComponent {
    label = options.label;
    options = options.options;
    placeholder = options.placeholder ?? '';
    hint = options.hint ?? '';
    error = options.error ?? '';
    disabled = options.disabled ?? false;
    id = options.id ?? '';
  }

  TestBed.configureTestingModule({
    imports: [TestHostComponent],
  });

  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}

function setupWithFormControl() {
  const options: SelectOption[] = [
    { value: 'boolean', label: 'Boolean' },
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'json', label: 'JSON' },
  ];

  @Component({
    imports: [SelectFieldComponent, ReactiveFormsModule],
    template: `<app-select-field label="Type" [options]="options" [formControl]="control" />`,
  })
  class TestHostComponent {
    options = options;
    control = new FormControl('boolean');
  }

  TestBed.configureTestingModule({
    imports: [TestHostComponent],
  });

  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}
