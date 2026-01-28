export interface ColLike<T = unknown> {
  key(): string;
  sortable(): boolean;
  sortAccessor(): ((row: T) => unknown) | null;
  sortCompare(): ((a: unknown, b: unknown) => number) | null;
}
