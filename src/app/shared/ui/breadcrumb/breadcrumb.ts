import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../icon/icon';

export interface BreadcrumbSelectOption {
  id: string;
  label: string;
}

/** Represents a single breadcrumb item */
export interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string;
  /** Optional route to navigate to (if omitted, item is not a link) */
  route?: string;
  /** Optional key for selection handling */
  key?: string;
  /** Optional select options for a dropdown crumb */
  selectOptions?: BreadcrumbSelectOption[];
  /** Optional selected option id */
  selectedId?: string;
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
  readonly items = input.required<readonly BreadcrumbItem[]>();

  /** Emits when a selectable breadcrumb changes */
  readonly selectionChange = output<{ key: string; value: string }>();

  /** Check if an item is the last (current) item */
  protected isLast(index: number): boolean {
    return index === this.items().length - 1;
  }

  protected onSelect(item: BreadcrumbItem, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectionChange.emit({ key: item.key ?? item.label, value });
  }
}
