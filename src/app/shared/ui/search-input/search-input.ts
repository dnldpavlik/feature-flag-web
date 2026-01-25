import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';

import { IconComponent } from '@/app/shared/ui/icon/icon';

@Component({
  selector: 'app-search-input',
  imports: [IconComponent],
  templateUrl: './search-input.html',
  styleUrl: './search-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  /** Placeholder text for the input */
  readonly placeholder = input<string>('Search...');

  /** Current search value */
  readonly value = input<string>('');

  /** Keyboard shortcut hint to display */
  readonly shortcutHint = input<string | undefined>(undefined);

  /** Whether the input is disabled */
  readonly disabled = input<boolean>(false);

  /** Aria label for accessibility */
  readonly ariaLabel = input<string>('Search');

  /** Emits when the value changes */
  readonly valueChange = output<string>();

  /** Emits when user presses Enter to submit search */
  readonly searchSubmit = output<string>();

  /** Reference to the input element */
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputElement');

  /** Computed CSS classes for the container */
  protected readonly containerClasses = computed(() => ({
    'search-input': true,
    'search-input--disabled': this.disabled(),
  }));

  /** Handle input value changes */
  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(value);
  }

  /** Handle keydown events */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchSubmit.emit(this.value());
    }
  }

  /** Focus the input element */
  focus(): void {
    this.inputRef().nativeElement.focus();
  }
}
