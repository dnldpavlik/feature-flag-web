import { createId } from './id.utils';

describe('id.utils', () => {
  describe('createId', () => {
    it('should include the prefix', () => {
      const id = createId('test');
      expect(id).toMatch(/^test_/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => createId('flag')));
      expect(ids.size).toBe(100);
    });

    it('should generate IDs with expected format', () => {
      const id = createId('env');
      expect(id).toMatch(/^env_[a-z0-9]{6,8}$/);
    });

    it('should work with different prefixes', () => {
      expect(createId('flag')).toMatch(/^flag_/);
      expect(createId('env')).toMatch(/^env_/);
      expect(createId('proj')).toMatch(/^proj_/);
      expect(createId('seg')).toMatch(/^seg_/);
    });
  });
});
