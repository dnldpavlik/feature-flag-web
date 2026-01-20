import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-nav-section',
  standalone: true,
  templateUrl: './nav-section.html',
  styleUrl: './nav-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavSectionComponent {
  /** Title displayed above the section content */
  readonly title = input.required<string>();
}
