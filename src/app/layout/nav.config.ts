import { IconName } from '@watt/ui';

export interface NavItem {
  label: string;
  route: string;
  icon: IconName;
  adminOnly?: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: 'Dashboard',
    route: '/dashboard',
    icon: 'home',
  },
  {
    label: 'Feature Flags',
    route: '/flags',
    icon: 'flag',
  },
  {
    label: 'Environments',
    route: '/environments',
    icon: 'list',
    adminOnly: true,
  },
  {
    label: 'Projects',
    route: '/projects',
    icon: 'folder',
  },
  {
    label: 'Segments',
    route: '/segments',
    icon: 'users',
  },
  {
    label: 'Audit Log',
    route: '/audit',
    icon: 'list',
  },
  {
    label: 'Settings',
    route: '/settings',
    icon: 'settings',
    adminOnly: true,
  },
] as const;
