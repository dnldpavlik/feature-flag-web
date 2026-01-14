import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'stat-card'
  }
})
export class StatCard {
  readonly value = input.required<string | number>();
  readonly label = input.required<string>();
}
