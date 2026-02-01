import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { SelectOption } from '../select/select.types';

export type { SelectOption } from '../select/select.types';

let nextId = 0;

/**
 * Select field component with label, hint, and error support.
 * Implements ControlValueAccessor for reactive forms integration.
 *
 * @example
 * ```html
 * <app-select-field
 *   label="Type"
 *   [options]="typeOptions"
 *   placeholder="Select a type..."
 *   hint="Choose the data type for this flag."
 *   [formControl]="typeControl"
 * />
 * ```
 */
@Component({
  selector: 'app-select-field',
  templateUrl: './select-field.html',
  styleUrl: './select-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectFieldComponent),
      multi: true,
    },
  ],
  host: {
    class: 'form-field',
    '[class.form-field--error]': 'error()',
    '[class.form-field--disabled]': 'isDisabled()',
  },
})
export class SelectFieldComponent implements ControlValueAccessor {
  /** Field label text */
  readonly label = input.required<string>();

  /** Available options for the select */
  readonly options = input.required<readonly SelectOption[]>();

  /** Placeholder text (shown as first disabled option) */
  readonly placeholder = input('');

  /** Help text displayed below select */
  readonly hint = input('');

  /** Error message displayed below select */
  readonly error = input<string | null>('');

  /** Whether the field is disabled */
  readonly disabled = input(false);

  /** Custom id for the select element */
  readonly id = input('');

  /** Internal value state */
  protected readonly value = signal('');

  /** Internal disabled state (from form control or input) */
  protected readonly controlDisabled = signal(false);

  /** Combined disabled state */
  protected readonly isDisabled = computed(() => this.disabled() || this.controlDisabled());

  /** Generated or provided select id */
  protected readonly selectId = computed(() => this.id() || `select-field-${nextId++}`);

  /** aria-describedby value */
  protected readonly ariaDescribedBy = computed(() => {
    const parts: string[] = [];
    const id = this.selectId();
    if (this.hint()) parts.push(`${id}-hint`);
    if (this.error()) parts.push(`${id}-error`);
    return parts.length > 0 ? parts.join(' ') : null;
  });

  // ControlValueAccessor callbacks
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onTouched: () => void = () => {};

  /** Handle selection change */
  protected onSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
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
