import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../icon/icon';

/** Represents a single breadcrumb item */
export interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string;
  /** Optional route to navigate to (if omitted, item is not a link) */
  route?: string;
}

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink, IconComponent],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  /** Array of breadcrumb items to display */
  readonly items = input.required<BreadcrumbItem[]>();

  /** Check if an item is the last (current) item */
  protected isLast(index: number): boolean {
    return index === this.items().length - 1;
  }
}
