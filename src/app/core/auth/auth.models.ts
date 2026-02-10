export interface UserProfile {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export const AUTH_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];
