import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'page-header',
  },
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
}
