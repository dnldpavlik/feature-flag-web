/** User profile information */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

/** API key scope permissions */
export type ApiKeyScope = 'read:flags' | 'write:flags' | 'admin';

/**
 * Available API key scope options for selection.
 */
export const API_KEY_SCOPE_OPTIONS: readonly { value: ApiKeyScope; label: string }[] = [
  { value: 'read:flags', label: 'Read Flags' },
  { value: 'write:flags', label: 'Write Flags' },
  { value: 'admin', label: 'Admin' },
] as const;

/** API key information */
export interface ApiKey {
  id: string;
  name: string;
  /** Masked key prefix, e.g., "sk_live_xxxx" */
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
  scopes: ApiKeyScope[];
}

/** Input for creating a new API key */
export interface CreateApiKeyInput {
  name: string;
  scopes: ApiKeyScope[];
  expiresAt?: string | null;
}

/** Result of creating an API key - includes the full secret once */
export interface CreateApiKeyResult {
  key: ApiKey;
  /** Full secret - only shown once at creation time */
  secret: string;
}

/** Email digest frequency options */
export type EmailDigestFrequency = 'none' | 'daily' | 'weekly';

/** Notification preferences */
export interface NotificationPreferences {
  emailOnFlagChange: boolean;
  emailOnApiKeyCreated: boolean;
  emailDigest: EmailDigestFrequency;
}

/** Project-level preferences */
export interface ProjectPreferences {
  defaultEnvironmentId: string;
  notifications: NotificationPreferences;
}

/** Theme mode options */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Theme and appearance preferences */
export interface ThemePreferences {
  mode: ThemeMode;
  reducedMotion: boolean;
  compactMode: boolean;
}

/** Combined settings state */
export interface SettingsState {
  userProfile: UserProfile;
  projectPreferences: ProjectPreferences;
  themePreferences: ThemePreferences;
  apiKeys: ApiKey[];
  loading: boolean;
  error: string | null;
}
