import { IconName } from '@/app/shared/ui/icon/icon.types';

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
