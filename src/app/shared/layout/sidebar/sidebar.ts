import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { NavItemComponent } from '@/app/shared/ui/nav-item/nav-item';
import { NavSectionComponent } from '@/app/shared/ui/nav-section/nav-section';
import { UserMenuComponent } from '@/app/shared/ui/user-menu/user-menu';
import { SidebarEnvironment, SidebarNavItem, SidebarUser } from './sidebar.types';

@Component({
  selector: 'app-sidebar',
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
