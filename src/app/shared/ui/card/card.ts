import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-card',
  template: '<ng-content />',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class CardComponent {
  readonly padding = input<CardPadding>('md');

  protected readonly hostClasses = computed(() => {
    const classes = ['card'];
    const p = this.padding();
    if (p !== 'md') {
      classes.push(`card--padding-${p}`);
    }
    return classes.join(' ');
  });
}
