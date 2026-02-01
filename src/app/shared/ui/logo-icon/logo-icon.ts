import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-logo-icon',
  templateUrl: './logo-icon.html',
  styleUrl: './logo-icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoIconComponent {
  /** The size of the logo in pixels (width and height) */
  readonly size = input<number>(32);
}
