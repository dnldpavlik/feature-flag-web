import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-user-menu',
  imports: [],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  /** User's display name */
  readonly name = input.required<string>();

  /** User's email address */
  readonly email = input.required<string>();

  /** Optional URL for user's avatar image */
  readonly avatarUrl = input<string | undefined>(undefined);

  /** Whether to display in compact mode (avatar only) */
  readonly compact = input<boolean>(false);

  /** Emits when the menu button is clicked */
  readonly menuToggle = output<void>();

  /** Emits when the logout button is clicked */
  readonly logoutClick = output<void>();

  /** Computed initials from user name */
  protected readonly initials = computed(() => {
    const nameParts = this.name().trim().split(/\s+/);
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  });

  /** Computed CSS classes for the container */
  protected readonly containerClasses = computed(() => ({
    'user-menu': true,
    'user-menu--compact': this.compact(),
  }));

  /** Handle click on the menu button */
  protected onClick(): void {
    this.menuToggle.emit();
  }

  /** Handle click on the logout button */
  protected onLogout(event: Event): void {
    event.stopPropagation();
    this.logoutClick.emit();
  }
}
