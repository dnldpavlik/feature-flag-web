import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { SelectOption } from '../select/select.types';

export type { SelectOption } from '../select/select.types';

let nextId = 0;

@Component({
  selector: 'app-labeled-select',
  templateUrl: './labeled-select.html',
  styleUrl: './labeled-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabeledSelectComponent {
  /** The label text displayed above the select */
  readonly label = input.required<string>();

  /** The options to display in the select dropdown */
  readonly options = input.required<SelectOption[]>();

  /** The currently selected value */
  readonly value = input<string>('');

  /** Minimum width for the select element */
  readonly minWidth = input<string>('140px');

  /** Whether the select is disabled */
  readonly disabled = input<boolean>(false);

  /** Emits the new value when the selection changes */
  readonly valueChange = output<string>();

  /** Unique ID for accessibility */
  protected readonly selectId = `labeled-select-${nextId++}`;

  /** Computed CSS classes for the container */
  protected readonly containerClasses = computed(() => ({
    'labeled-select': true,
    'labeled-select--disabled': this.disabled(),
  }));

  /** Handle selection change */
  protected onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.valueChange.emit(value);
  }
}
