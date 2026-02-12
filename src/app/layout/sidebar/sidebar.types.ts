import { IconName } from '@watt/ui';

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
