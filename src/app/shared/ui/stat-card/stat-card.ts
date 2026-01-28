import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CardComponent } from '@/app/shared/ui/card/card';

@Component({
  selector: 'app-stat-card',
  imports: [CardComponent],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  readonly value = input.required<string | number>();
  readonly label = input.required<string>();
}
