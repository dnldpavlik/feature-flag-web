import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.html',
  styleUrl: './toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.toggle--disabled]': 'disabled()',
  },
})
export class ToggleComponent {
  readonly checked = input(false);
  readonly label = input<string>();
  readonly disabled = input(false);

  readonly toggled = output<boolean>();

  protected onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.toggled.emit(target.checked);
  }
}
