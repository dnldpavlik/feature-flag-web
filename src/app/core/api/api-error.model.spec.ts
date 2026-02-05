import { isApiError } from './api-error.model';

describe('isApiError', () => {
  it('should return true for valid ApiError', () => {
    expect(
      isApiError({
        error: 'NOT_FOUND',
        message: 'Project not found',
      }),
    ).toBe(true);
  });

  it('should return true for ApiError with details', () => {
    expect(
      isApiError({
        error: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: [{ field: 'name', message: 'Name is required' }],
      }),
    ).toBe(true);
  });

  it('should return false for null', () => {
    expect(isApiError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isApiError(undefined)).toBe(false);
  });

  it('should return false for string', () => {
    expect(isApiError('error')).toBe(false);
  });

  it('should return false for number', () => {
    expect(isApiError(42)).toBe(false);
  });

  it('should return false for object missing error field', () => {
    expect(isApiError({ message: 'Only message' })).toBe(false);
  });

  it('should return false for object missing message field', () => {
    expect(isApiError({ error: 'Only error' })).toBe(false);
  });

  it('should return false for object with non-string fields', () => {
    expect(isApiError({ error: 123, message: 'msg' })).toBe(false);
  });
});
