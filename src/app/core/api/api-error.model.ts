export interface ApiErrorDetail {
  readonly field: string;
  readonly message: string;
}

export interface ApiError {
  readonly error: string;
  readonly message: string;
  readonly details?: ApiErrorDetail[];
}

export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return typeof obj['error'] === 'string' && typeof obj['message'] === 'string';
}
