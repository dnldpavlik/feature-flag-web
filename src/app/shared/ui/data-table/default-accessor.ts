export function defaultAccessor(row: unknown, key: string): unknown {
  return (row as Record<string, unknown>)?.[key];
}
