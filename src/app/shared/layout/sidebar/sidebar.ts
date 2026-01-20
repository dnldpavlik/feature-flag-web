import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconName } from '../../ui/icon/icon';
import { NavItemComponent } from '../../ui/nav-item/nav-item';
import { NavSectionComponent } from '../../ui/nav-section/nav-section';
import { UserMenuComponent } from '../../ui/user-menu/user-menu';

export interface SidebarNavItem {
  label: string;
  route: string;
  icon: IconName;
}

export interface SidebarEnvironment {
  name: string;
  color: string;
  route: string;
}

export interface SidebarUser {
  name: string;
  email: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NavItemComponent, NavSectionComponent, UserMenuComponent],
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
}
