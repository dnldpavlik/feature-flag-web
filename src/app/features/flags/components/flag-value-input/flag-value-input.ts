import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { FormFieldComponent } from '@/app/shared/ui/form-field/form-field';
import { FlagType } from '@/app/features/flags/models/flag.model';

/**
 * Reusable component for rendering flag value inputs based on type.
 *
 * Renders the appropriate input control (checkbox, text, number, or textarea)
 * based on the flag type, with consistent styling and behavior.
 *
 * @example
 * ```html
 * <app-flag-value-input
 *   [type]="flag.type"
 *   [booleanControl]="form.controls.booleanValue"
 *   [stringControl]="form.controls.stringValue"
 *   [numberControl]="form.controls.numberValue"
 *   [jsonControl]="form.controls.jsonValue"
 *   [jsonError]="jsonError()"
 * />
 * ```
 */
@Component({
  selector: 'app-flag-value-input',
  standalone: true,
  imports: [FormFieldComponent, ReactiveFormsModule],
  template: `
    @switch (type()) {
      @case ('boolean') {
        <label class="flag-value-input__toggle">
          <input type="checkbox" [formControl]="booleanControl()" />
          <span>{{ booleanControl().value ? 'True' : 'False' }}</span>
        </label>
      }
      @case ('string') {
        <app-form-field
          label=""
          [placeholder]="stringPlaceholder()"
          [formControl]="stringControl()"
        />
      }
      @case ('number') {
        <app-form-field
          label=""
          type="number"
          [placeholder]="numberPlaceholder()"
          [formControl]="numberControl()"
        />
      }
      @case ('json') {
        <app-form-field
          label=""
          type="textarea"
          [rows]="jsonRows()"
          [placeholder]="jsonPlaceholder()"
          [error]="jsonError()"
          [formControl]="jsonControl()"
          (blur)="jsonBlur.emit()"
        />
      }
    }
  `,
  styles: `
    .flag-value-input__toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;

      input {
        width: 1rem;
        height: 1rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagValueInputComponent {
  /** The flag type determining which input to render */
  readonly type = input.required<FlagType>();

  /** Form control for boolean values */
  readonly booleanControl = input.required<FormControl<boolean>>();

  /** Form control for string values */
  readonly stringControl = input.required<FormControl<string>>();

  /** Form control for number values */
  readonly numberControl = input.required<FormControl<number>>();

  /** Form control for JSON values */
  readonly jsonControl = input.required<FormControl<string>>();

  /** Error message for JSON validation */
  readonly jsonError = input<string | null>(null);

  /** Placeholder for string input */
  readonly stringPlaceholder = input('');

  /** Placeholder for number input */
  readonly numberPlaceholder = input('0');

  /** Placeholder for JSON input */
  readonly jsonPlaceholder = input('{"key": "value"}');

  /** Number of rows for JSON textarea */
  readonly jsonRows = input(4);

  /** Emitted when JSON field loses focus (for validation) */
  readonly jsonBlur = output<void>();
}
