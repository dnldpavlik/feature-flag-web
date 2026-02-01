import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-flags-empty-icon',
  templateUrl: './flags-empty-icon.html',
  styleUrl: './flags-empty-icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlagsEmptyIconComponent {
  /** The size of the icon in pixels (width and height) */
  readonly size = input<number>(48);
}
