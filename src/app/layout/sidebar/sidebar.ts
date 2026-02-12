import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { LogoIconComponent } from '@/app/shared/ui/logo-icon/logo-icon';
import { NavItemComponent, NavSectionComponent, UserMenuComponent } from '@watt/ui';
import { SidebarEnvironment, SidebarNavItem, SidebarUser } from './sidebar.types';

@Component({
  selector: 'app-sidebar',
  imports: [LogoIconComponent, NavItemComponent, NavSectionComponent, UserMenuComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  /** Primary navigation items */
  readonly navItems = input.required<readonly SidebarNavItem[]>();

  /** Environment links shown in the section list */
  readonly environments = input.required<readonly SidebarEnvironment[]>();

  /** User identity for the footer menu */
  readonly currentUser = input.required<SidebarUser>();

  /** Emits when the user clicks logout */
  readonly logout = output<void>();
}
