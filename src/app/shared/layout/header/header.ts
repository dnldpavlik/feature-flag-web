import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { BreadcrumbComponent, BreadcrumbItem } from '../../ui/breadcrumb/breadcrumb';
import { ButtonComponent } from '../../ui/button/button';
import { SearchInputComponent } from '../../ui/search-input/search-input';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [BreadcrumbComponent, ButtonComponent, SearchInputComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  /** Breadcrumb items for the current page */
  readonly breadcrumbs = input.required<ReadonlyArray<BreadcrumbItem>>();

  /** Emits when the menu toggle button is pressed */
  readonly menuToggle = output<void>();
}
