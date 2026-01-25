/**
 * Extracts the section label from a URL path.
 * Used for breadcrumb display and navigation context.
 */
export function getSectionLabel(url: string): string {
  const segment = url.split('?')[0].split('#')[0].split('/').filter(Boolean)[0] ?? 'dashboard';

  switch (segment) {
    case 'dashboard':
      return 'Dashboard';
    case 'flags':
      return 'Feature Flags';
    case 'environments':
      return 'Environments';
    case 'projects':
      return 'Projects';
    case 'segments':
      return 'Segments';
    case 'audit':
      return 'Audit Log';
    case 'settings':
      return 'Settings';
    default:
      return 'Dashboard';
  }
}

/**
 * Converts a display name to a URL-friendly key.
 * Example: "My Feature Flag" -> "my-feature-flag"
 */
export function toKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
