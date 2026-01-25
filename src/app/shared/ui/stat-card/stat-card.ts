import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'stat-card',
  },
})
export class StatCardComponent {
  readonly value = input.required<string | number>();
  readonly label = input.required<string>();
}
