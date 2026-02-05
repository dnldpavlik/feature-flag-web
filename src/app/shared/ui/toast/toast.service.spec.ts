import { ToastService } from './toast.service';
import { MAX_VISIBLE_TOASTS } from './toast.model';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new ToastService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('show', () => {
    it('should add a toast to the list', () => {
      service.show('Hello', 'info');

      expect(service.toasts()).toHaveLength(1);
      expect(service.toasts()[0].message).toBe('Hello');
      expect(service.toasts()[0].variant).toBe('info');
    });

    it('should return the toast id', () => {
      const id = service.show('Test', 'success');

      expect(id).toMatch(/^toast_/);
    });

    it('should auto-dismiss after default duration', () => {
      service.show('Auto dismiss', 'info');

      expect(service.toasts()).toHaveLength(1);

      jest.advanceTimersByTime(5000);

      expect(service.toasts()).toHaveLength(0);
    });

    it('should auto-dismiss after custom duration', () => {
      service.show('Custom', 'info', { duration: 3000 });

      jest.advanceTimersByTime(2999);
      expect(service.toasts()).toHaveLength(1);

      jest.advanceTimersByTime(1);
      expect(service.toasts()).toHaveLength(0);
    });

    it('should not auto-dismiss when duration is 0', () => {
      service.show('Sticky', 'error', { duration: 0 });

      jest.advanceTimersByTime(60000);

      expect(service.toasts()).toHaveLength(1);
    });

    it('should limit visible toasts to MAX_VISIBLE_TOASTS', () => {
      for (let i = 0; i < MAX_VISIBLE_TOASTS + 3; i++) {
        service.show(`Toast ${i}`, 'info', { duration: 0 });
      }

      expect(service.toasts()).toHaveLength(MAX_VISIBLE_TOASTS);
      expect(service.toasts()[0].message).toBe('Toast 3');
    });
  });

  describe('convenience methods', () => {
    it('should create a success toast', () => {
      service.success('Done!');

      expect(service.toasts()[0].variant).toBe('success');
    });

    it('should create an error toast that does not auto-dismiss', () => {
      service.error('Failed!');

      jest.advanceTimersByTime(60000);

      expect(service.toasts()).toHaveLength(1);
      expect(service.toasts()[0].variant).toBe('error');
    });

    it('should allow overriding error toast duration', () => {
      service.error('Temporary error', { duration: 3000 });

      jest.advanceTimersByTime(3000);

      expect(service.toasts()).toHaveLength(0);
    });

    it('should create a warning toast', () => {
      service.warning('Watch out!');

      expect(service.toasts()[0].variant).toBe('warning');
    });

    it('should create an info toast', () => {
      service.info('FYI');

      expect(service.toasts()[0].variant).toBe('info');
    });
  });

  describe('dismiss', () => {
    it('should remove a toast by id', () => {
      const id = service.show('Remove me', 'info', { duration: 0 });

      service.dismiss(id);

      expect(service.toasts()).toHaveLength(0);
    });

    it('should only remove the targeted toast', () => {
      service.show('Keep me', 'info', { duration: 0 });
      const id = service.show('Remove me', 'info', { duration: 0 });

      service.dismiss(id);

      expect(service.toasts()).toHaveLength(1);
      expect(service.toasts()[0].message).toBe('Keep me');
    });

    it('should clear the auto-dismiss timer', () => {
      const id = service.show('Clear timer', 'info');

      service.dismiss(id);
      jest.advanceTimersByTime(10000);

      expect(service.toasts()).toHaveLength(0);
    });

    it('should handle dismissing non-existent id gracefully', () => {
      expect(() => service.dismiss('nonexistent')).not.toThrow();
    });
  });
});
