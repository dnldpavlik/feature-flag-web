import { getSectionLabel, toKey } from './url.utils';

describe('url.utils', () => {
  describe('getSectionLabel', () => {
    describe('standard routes', () => {
      it('should return Dashboard for dashboard URL', () => {
        expect(getSectionLabel('/dashboard')).toBe('Dashboard');
      });

      it('should return Feature Flags for flags URL', () => {
        expect(getSectionLabel('/flags')).toBe('Feature Flags');
      });

      it('should return Environments for environments URL', () => {
        expect(getSectionLabel('/environments')).toBe('Environments');
      });

      it('should return Projects for projects URL', () => {
        expect(getSectionLabel('/projects')).toBe('Projects');
      });

      it('should return Segments for segments URL', () => {
        expect(getSectionLabel('/segments')).toBe('Segments');
      });

      it('should return Audit Log for audit URL', () => {
        expect(getSectionLabel('/audit')).toBe('Audit Log');
      });

      it('should return Settings for settings URL', () => {
        expect(getSectionLabel('/settings')).toBe('Settings');
      });
    });

    describe('edge cases', () => {
      it('should return Dashboard for unknown URLs', () => {
        expect(getSectionLabel('/unknown-route')).toBe('Dashboard');
      });

      it('should return Dashboard for root URL', () => {
        expect(getSectionLabel('/')).toBe('Dashboard');
      });

      it('should return Dashboard for empty string', () => {
        expect(getSectionLabel('')).toBe('Dashboard');
      });

      it('should handle URLs with query parameters', () => {
        expect(getSectionLabel('/flags?filter=active')).toBe('Feature Flags');
      });

      it('should handle URLs with hash fragments', () => {
        expect(getSectionLabel('/flags#section')).toBe('Feature Flags');
      });

      it('should handle nested URLs', () => {
        expect(getSectionLabel('/flags/new')).toBe('Feature Flags');
      });

      it('should handle deeply nested URLs', () => {
        expect(getSectionLabel('/environments/prod/settings')).toBe('Environments');
      });

      it('should handle URLs with both query and hash', () => {
        expect(getSectionLabel('/settings?tab=general#notifications')).toBe('Settings');
      });
    });
  });

  describe('toKey', () => {
    describe('basic transformations', () => {
      it('should convert simple name to lowercase key', () => {
        expect(toKey('Feature')).toBe('feature');
      });

      it('should convert multi-word name to kebab-case', () => {
        expect(toKey('My Feature Flag')).toBe('my-feature-flag');
      });

      it('should handle already lowercase input', () => {
        expect(toKey('simple')).toBe('simple');
      });

      it('should handle numbers in the name', () => {
        expect(toKey('Feature 123')).toBe('feature-123');
      });
    });

    describe('whitespace handling', () => {
      it('should trim leading and trailing whitespace', () => {
        expect(toKey('  Feature  ')).toBe('feature');
      });

      it('should collapse multiple spaces into single dash', () => {
        expect(toKey('Feature    Flag')).toBe('feature-flag');
      });

      it('should handle tabs and newlines', () => {
        expect(toKey('Feature\tFlag\nTest')).toBe('feature-flag-test');
      });
    });

    describe('special character handling', () => {
      it('should remove special characters', () => {
        expect(toKey('Feature!@#$%Flag')).toBe('feature-flag');
      });

      it('should handle underscores', () => {
        expect(toKey('feature_flag')).toBe('feature-flag');
      });

      it('should handle dots', () => {
        expect(toKey('feature.flag')).toBe('feature-flag');
      });

      it('should not start or end with dashes', () => {
        expect(toKey('---Feature---')).toBe('feature');
      });

      it('should handle consecutive special characters', () => {
        expect(toKey('Feature!!!Flag')).toBe('feature-flag');
      });
    });

    describe('edge cases', () => {
      it('should return empty string for empty input', () => {
        expect(toKey('')).toBe('');
      });

      it('should return empty string for whitespace only', () => {
        expect(toKey('   ')).toBe('');
      });

      it('should return empty string for special characters only', () => {
        expect(toKey('!@#$%')).toBe('');
      });

      it('should handle unicode characters', () => {
        expect(toKey('Café Feature')).toBe('caf-feature');
      });
    });
  });
});
