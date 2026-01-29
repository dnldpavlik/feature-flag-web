import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { FormFieldComponent } from './form-field';

describe('FormFieldComponent', () => {
  describe('basic rendering', () => {
    it('should render with label', () => {
      const { fixture } = setup({ label: 'Email' });
      const label = fixture.nativeElement.querySelector('label');
      expect(label.textContent).toContain('Email');
    });

    it('should render input element by default', () => {
      const { fixture } = setup({ label: 'Name' });
      const input = fixture.nativeElement.querySelector('input');
      expect(input).toBeTruthy();
      expect(input.type).toBe('text');
    });

    it('should apply placeholder', () => {
      const { fixture } = setup({ label: 'Name', placeholder: 'Enter name' });
      const input = fixture.nativeElement.querySelector('input');
      expect(input.placeholder).toBe('Enter name');
    });

    it('should render hint text when provided', () => {
      const { fixture } = setup({ label: 'Key', hint: 'Auto-generated from name' });
      const hint = fixture.nativeElement.querySelector('.form-field__hint');
      expect(hint.textContent).toContain('Auto-generated from name');
    });

    it('should not render hint element when not provided', () => {
      const { fixture } = setup({ label: 'Name' });
      const hint = fixture.nativeElement.querySelector('.form-field__hint');
      expect(hint).toBeFalsy();
    });
  });

  describe('input types', () => {
    it('should render email input', () => {
      const { fixture } = setup({ label: 'Email', type: 'email' });
      const input = fixture.nativeElement.querySelector('input');
      expect(input.type).toBe('email');
    });

    it('should render password input', () => {
      const { fixture } = setup({ label: 'Password', type: 'password' });
      const input = fixture.nativeElement.querySelector('input');
      expect(input.type).toBe('password');
    });

    it('should render number input', () => {
      const { fixture } = setup({ label: 'Count', type: 'number' });
      const input = fixture.nativeElement.querySelector('input');
      expect(input.type).toBe('number');
    });

    it('should render color input', () => {
      const { fixture } = setup({ label: 'Color', type: 'color' });
      const input = fixture.nativeElement.querySelector('input');
      expect(input.type).toBe('color');
    });

    it('should render textarea when type is textarea', () => {
      const { fixture } = setup({ label: 'Description', type: 'textarea' });
      const textarea = fixture.nativeElement.querySelector('textarea');
      const input = fixture.nativeElement.querySelector('input');
      expect(textarea).toBeTruthy();
      expect(input).toBeFalsy();
    });

    it('should apply rows to textarea', () => {
      const { fixture } = setup({ label: 'Description', type: 'textarea', rows: 5 });
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.rows).toBe(5);
    });
  });

  describe('error state', () => {
    it('should render error message when provided', () => {
      const { fixture } = setup({ label: 'Email', error: 'Invalid email' });
      const error = fixture.nativeElement.querySelector('.form-field__error');
      expect(error.textContent).toContain('Invalid email');
    });

    it('should not render error element when not provided', () => {
      const { fixture } = setup({ label: 'Email' });
      const error = fixture.nativeElement.querySelector('.form-field__error');
      expect(error).toBeFalsy();
    });

    it('should add error class to host when error is present', () => {
      const { fixture } = setup({ label: 'Email', error: 'Required' });
      const host = fixture.debugElement.query(By.directive(FormFieldComponent));
      expect(host.nativeElement.classList.contains('form-field--error')).toBe(true);
    });

    it('should add error class to input when error is present', () => {
      const { fixture } = setup({ label: 'Email', error: 'Required' });
      const input = fixture.nativeElement.querySelector('input');
      expect(input.classList.contains('form-field__input--error')).toBe(true);
    });
  });

  describe('disabled state', () => {
    it('should disable input when disabled is true', () => {
      const { fixture } = setup({ label: 'Name', disabled: true });
      const input = fixture.nativeElement.querySelector('input');
      expect(input.disabled).toBe(true);
    });

    it('should disable textarea when disabled is true', () => {
      const { fixture } = setup({ label: 'Description', type: 'textarea', disabled: true });
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.disabled).toBe(true);
    });
  });

  describe('reactive forms integration', () => {
    it('should work with formControl', () => {
      const { fixture, component } = setupWithFormControl();
      const input = fixture.nativeElement.querySelector('input');

      // Initial value
      expect(input.value).toBe('initial');

      // Update from form control
      component.control.setValue('updated');
      fixture.detectChanges();
      expect(input.value).toBe('updated');

      // Update from input
      input.value = 'from input';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.control.value).toBe('from input');
    });

    it('should reflect disabled state from form control', () => {
      const { fixture, component } = setupWithFormControl();
      const input = fixture.nativeElement.querySelector('input');

      component.control.disable();
      fixture.detectChanges();
      expect(input.disabled).toBe(true);

      component.control.enable();
      fixture.detectChanges();
      expect(input.disabled).toBe(false);
    });

    it('should handle null value in writeValue', () => {
      const { fixture, component } = setupWithFormControl();
      const input = fixture.nativeElement.querySelector('input');

      component.control.setValue(null);
      fixture.detectChanges();
      expect(input.value).toBe('');
    });

    it('should call onTouched when input loses focus', () => {
      const { fixture, component } = setupWithFormControl();
      const input = fixture.nativeElement.querySelector('input');

      expect(component.control.touched).toBe(false);

      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(component.control.touched).toBe(true);
    });

    it('should call onTouched when textarea loses focus', () => {
      const { fixture, component } = setupWithFormControlTextarea();
      const textarea = fixture.nativeElement.querySelector('textarea');

      expect(component.control.touched).toBe(false);

      textarea.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(component.control.touched).toBe(true);
    });
  });

  describe('standalone usage (no form control)', () => {
    it('should handle input without form control', () => {
      const { fixture } = setup({ label: 'Name' });
      const input = fixture.nativeElement.querySelector('input');

      // Trigger input event - calls default onChange which is a no-op
      input.value = 'test value';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Value should be updated in the component
      expect(input.value).toBe('test value');
    });

    it('should handle blur without form control', () => {
      const { fixture } = setup({ label: 'Name' });
      const input = fixture.nativeElement.querySelector('input');

      // Trigger blur event - calls default onTouched which is a no-op
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      // Should not throw
      expect(input).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should associate label with input via id', () => {
      const { fixture } = setup({ label: 'Email', id: 'email-input' });
      const label = fixture.nativeElement.querySelector('label');
      const input = fixture.nativeElement.querySelector('input');
      expect(label.getAttribute('for')).toBe('email-input');
      expect(input.id).toBe('email-input');
    });

    it('should generate unique id when not provided', () => {
      const { fixture } = setup({ label: 'Name' });
      const label = fixture.nativeElement.querySelector('label');
      const input = fixture.nativeElement.querySelector('input');
      expect(label.getAttribute('for')).toBeTruthy();
      expect(input.id).toBe(label.getAttribute('for'));
    });

    it('should set aria-describedby when hint is present', () => {
      const { fixture } = setup({ label: 'Key', hint: 'Help text', id: 'key-input' });
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-describedby')).toContain('key-input-hint');
    });

    it('should set aria-describedby when error is present', () => {
      const { fixture } = setup({ label: 'Email', error: 'Required', id: 'email-input' });
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-describedby')).toContain('email-input-error');
    });

    it('should set aria-invalid when error is present', () => {
      const { fixture } = setup({ label: 'Email', error: 'Required' });
      const input = fixture.nativeElement.querySelector('input');
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });
  });
});

// Test helpers
interface SetupOptions {
  label: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  rows?: number;
  id?: string;
}

function setup(options: SetupOptions) {
  @Component({
    imports: [FormFieldComponent],
    template: `
      <app-form-field
        [label]="label"
        [type]="type"
        [placeholder]="placeholder"
        [hint]="hint"
        [error]="error"
        [disabled]="disabled"
        [rows]="rows"
        [id]="id"
      />
    `,
  })
  class TestHostComponent {
    label = options.label;
    type = options.type ?? 'text';
    placeholder = options.placeholder ?? '';
    hint = options.hint ?? '';
    error = options.error ?? '';
    disabled = options.disabled ?? false;
    rows = options.rows ?? 3;
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
  @Component({
    imports: [FormFieldComponent, ReactiveFormsModule],
    template: ` <app-form-field label="Test" [formControl]="control" /> `,
  })
  class TestHostComponent {
    control = new FormControl('initial');
  }

  TestBed.configureTestingModule({
    imports: [TestHostComponent],
  });

  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}

function setupWithFormControlTextarea() {
  @Component({
    imports: [FormFieldComponent, ReactiveFormsModule],
    template: ` <app-form-field label="Test" type="textarea" [formControl]="control" /> `,
  })
  class TestHostComponent {
    control = new FormControl('initial');
  }

  TestBed.configureTestingModule({
    imports: [TestHostComponent],
  });

  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}
