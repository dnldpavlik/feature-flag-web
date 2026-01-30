import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Supported input types */
export type FormFieldType = 'text' | 'email' | 'password' | 'number' | 'color' | 'textarea';

let nextId = 0;

/**
 * Form field component with label, input, hint, and error support.
 * Implements ControlValueAccessor for reactive forms integration.
 *
 * @example
 * ```html
 * <app-form-field
 *   label="Email"
 *   type="email"
 *   placeholder="you@example.com"
 *   hint="We'll never share your email."
 *   [formControl]="emailControl"
 * />
 * ```
 */
@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true,
    },
  ],
  host: {
    class: 'form-field',
    '[class.form-field--error]': 'error()',
    '[class.form-field--disabled]': 'isDisabled()',
  },
})
export class FormFieldComponent implements ControlValueAccessor {
  /** Field label text */
  readonly label = input.required<string>();

  /** Input type */
  readonly type = input<FormFieldType>('text');

  /** Placeholder text */
  readonly placeholder = input('');

  /** Help text displayed below input */
  readonly hint = input('');

  /** Error message displayed below input */
  readonly error = input<string | null>('');

  /** Whether the field is disabled */
  readonly disabled = input(false);

  /** Number of rows for textarea */
  readonly rows = input(3);

  /** Custom id for the input element */
  readonly id = input('');

  /** Whether the field is required */
  readonly required = input(false);

  /** Internal value state */
  protected readonly value = signal('');

  /** Internal disabled state (from form control or input) */
  protected readonly controlDisabled = signal(false);

  /** Combined disabled state */
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  /** Generated or provided input id */
  protected readonly inputId = computed(() => this.id() || `form-field-${nextId++}`);

  /** aria-describedby value */
  protected readonly ariaDescribedBy = computed(() => {
    const parts: string[] = [];
    const id = this.inputId();
    if (this.hint()) parts.push(`${id}-hint`);
    if (this.error()) parts.push(`${id}-error`);
    return parts.length > 0 ? parts.join(' ') : null;
  });

  // ControlValueAccessor callbacks - initialized as no-ops, replaced by registerOnChange/registerOnTouched
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onTouched: () => void = () => {};

  /** Handle input events */
  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.controlDisabled.set(isDisabled);
  }
}
