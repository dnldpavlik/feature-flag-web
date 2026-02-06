import { TestBed } from '@angular/core/testing';

import { AuditLogger } from './audit-logger.service';
import { AuditStore } from '../store/audit.store';
import { UserProfileStore } from '@/app/features/settings/store/user-profile.store';
import { MOCK_API_PROVIDERS } from '@/app/testing';

describe('AuditLogger', () => {
  let logger: AuditLogger;
  let auditStore: AuditStore;
  let userProfileStore: UserProfileStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuditLogger, AuditStore, UserProfileStore, ...MOCK_API_PROVIDERS],
    });

    logger = TestBed.inject(AuditLogger);
    auditStore = TestBed.inject(AuditStore);
    userProfileStore = TestBed.inject(UserProfileStore);
  });

  describe('log', () => {
    it('should call auditStore.logAction with correct parameters', () => {
      const logSpy = jest.spyOn(auditStore, 'logAction');

      logger.log('flag', {
        action: 'created',
        resourceId: 'flag_123',
        resourceName: 'Test Flag',
        details: 'Created boolean flag',
      });

      const user = userProfileStore.userProfile();
      expect(logSpy).toHaveBeenCalledWith({
        action: 'created',
        resourceType: 'flag',
        resourceId: 'flag_123',
        resourceName: 'Test Flag',
        details: 'Created boolean flag',
        userId: user.id,
        userName: user.name,
      });
    });

    it('should use current user profile for userId and userName', () => {
      const logSpy = jest.spyOn(auditStore, 'logAction');

      logger.log('project', {
        action: 'updated',
        resourceId: 'proj_1',
        resourceName: 'My Project',
        details: 'Updated name',
      });

      const user = userProfileStore.userProfile();
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          userName: user.name,
        }),
      );
    });

    it('should support all resource types', () => {
      const logSpy = jest.spyOn(auditStore, 'logAction');
      const resourceTypes = ['flag', 'environment', 'project', 'segment'] as const;

      resourceTypes.forEach((resourceType) => {
        logger.log(resourceType, {
          action: 'created',
          resourceId: `${resourceType}_1`,
          resourceName: `Test ${resourceType}`,
          details: 'Created',
        });

        expect(logSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            resourceType,
          }),
        );
      });
    });

    it('should support all action types', () => {
      const logSpy = jest.spyOn(auditStore, 'logAction');
      const actions = ['created', 'updated', 'deleted', 'toggled'] as const;

      actions.forEach((action) => {
        logger.log('flag', {
          action,
          resourceId: 'flag_1',
          resourceName: 'Test',
          details: 'Action performed',
        });

        expect(logSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            action,
          }),
        );
      });
    });
  });

  describe('forResource', () => {
    it('should return a function that logs with preset resourceType', () => {
      const logSpy = jest.spyOn(auditStore, 'logAction');
      const flagLogger = logger.forResource('flag');

      flagLogger({
        action: 'deleted',
        resourceId: 'flag_456',
        resourceName: 'Deleted Flag',
        details: 'Flag was removed',
      });

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceType: 'flag',
          action: 'deleted',
          resourceId: 'flag_456',
        }),
      );
    });

    it('should create independent loggers for different resource types', () => {
      const logSpy = jest.spyOn(auditStore, 'logAction');
      const flagLogger = logger.forResource('flag');
      const envLogger = logger.forResource('environment');

      flagLogger({
        action: 'created',
        resourceId: 'flag_1',
        resourceName: 'Flag',
        details: '',
      });

      envLogger({
        action: 'updated',
        resourceId: 'env_1',
        resourceName: 'Environment',
        details: '',
      });

      expect(logSpy).toHaveBeenNthCalledWith(1, expect.objectContaining({ resourceType: 'flag' }));
      expect(logSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ resourceType: 'environment' }),
      );
    });
  });
});
