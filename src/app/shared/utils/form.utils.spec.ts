import { FormControl, FormGroup } from '@angular/forms';

import { hasRequiredFields, getTrimmedValues, createFormFieldAccessors } from './form.utils';

describe('form.utils', () => {
  describe('hasRequiredFields', () => {
    it('should return true when all required fields have values', () => {
      const form = new FormGroup({
        name: new FormControl('Test Name'),
        key: new FormControl('test-key'),
      });

      expect(hasRequiredFields(form, ['name', 'key'])).toBe(true);
    });

    it('should return false when a required field is empty', () => {
      const form = new FormGroup({
        name: new FormControl('Test Name'),
        key: new FormControl(''),
      });

      expect(hasRequiredFields(form, ['name', 'key'])).toBe(false);
    });

    it('should return false when a required field contains only whitespace', () => {
      const form = new FormGroup({
        name: new FormControl('Test Name'),
        key: new FormControl('   '),
      });

      expect(hasRequiredFields(form, ['name', 'key'])).toBe(false);
    });

    it('should return true when checking a subset of fields', () => {
      const form = new FormGroup({
        name: new FormControl('Test'),
        key: new FormControl(''),
        description: new FormControl(''),
      });

      expect(hasRequiredFields(form, ['name'])).toBe(true);
    });

    it('should handle non-existent fields gracefully', () => {
      const form = new FormGroup({
        name: new FormControl('Test'),
      });

      expect(hasRequiredFields(form, ['name', 'nonexistent'])).toBe(false);
    });

    it('should return true for empty fields array', () => {
      const form = new FormGroup({
        name: new FormControl(''),
      });

      expect(hasRequiredFields(form, [])).toBe(true);
    });
  });

  describe('getTrimmedValues', () => {
    it('should return trimmed values for specified fields', () => {
      const form = new FormGroup({
        name: new FormControl('  Test Name  '),
        key: new FormControl('test-key'),
        description: new FormControl('  description  '),
      });

      const result = getTrimmedValues(form, ['name', 'key', 'description']);

      expect(result).toEqual({
        name: 'Test Name',
        key: 'test-key',
        description: 'description',
      });
    });

    it('should handle empty strings', () => {
      const form = new FormGroup({
        name: new FormControl(''),
        key: new FormControl('   '),
      });

      const result = getTrimmedValues(form, ['name', 'key']);

      expect(result).toEqual({
        name: '',
        key: '',
      });
    });

    it('should convert non-string values to strings', () => {
      const form = new FormGroup({
        count: new FormControl(42),
        enabled: new FormControl(true),
      });

      const result = getTrimmedValues(form, ['count', 'enabled']);

      expect(result).toEqual({
        count: '42',
        enabled: 'true',
      });
    });

    it('should handle null/undefined values', () => {
      const form = new FormGroup({
        name: new FormControl(null),
        key: new FormControl(undefined),
      });

      const result = getTrimmedValues(form, ['name', 'key']);

      expect(result).toEqual({
        name: '',
        key: '',
      });
    });

    it('should return empty object for empty fields array', () => {
      const form = new FormGroup({
        name: new FormControl('Test'),
      });

      const result = getTrimmedValues(form, []);

      expect(result).toEqual({});
    });
  });

  describe('createFormFieldAccessors', () => {
    it('should allow getting form values via property access', () => {
      const form = new FormGroup({
        name: new FormControl('Test Name'),
        key: new FormControl('test-key'),
      });

      const accessors = createFormFieldAccessors<{ name: string; key: string }>(form);

      expect(accessors.name).toBe('Test Name');
      expect(accessors.key).toBe('test-key');
    });

    it('should allow setting form values via property assignment', () => {
      const form = new FormGroup({
        name: new FormControl(''),
        key: new FormControl(''),
      });

      const accessors = createFormFieldAccessors<{ name: string; key: string }>(form);
      accessors.name = 'New Name';
      accessors.key = 'new-key';

      expect(form.get('name')?.value).toBe('New Name');
      expect(form.get('key')?.value).toBe('new-key');
    });

    it('should return empty string for non-existent fields', () => {
      const form = new FormGroup({
        name: new FormControl('Test'),
      });

      const accessors = createFormFieldAccessors<{ name: string; other: string }>(form);

      expect(accessors.other).toBe('');
    });

    it('should reflect form changes', () => {
      const form = new FormGroup({
        name: new FormControl('Initial'),
      });

      const accessors = createFormFieldAccessors<{ name: string }>(form);
      expect(accessors.name).toBe('Initial');

      form.get('name')?.setValue('Changed');
      expect(accessors.name).toBe('Changed');
    });
  });
});
