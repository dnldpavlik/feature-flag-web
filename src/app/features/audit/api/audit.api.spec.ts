import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_BASE_URL } from '@/app/core/api/api.tokens';
import { AuditApi } from './audit.api';
import { AuditEntry, LogActionInput } from '../models/audit.model';

describe('AuditApi', () => {
  let api: AuditApi;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:3000/api/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: baseUrl },
        AuditApi,
      ],
    });

    api = TestBed.inject(AuditApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll', () => {
    it('should GET all audit entries', () => {
      const mockEntries: AuditEntry[] = [
        {
          id: 'audit_001',
          action: 'created',
          resourceType: 'flag',
          resourceId: 'flag_123',
          resourceName: 'Test Flag',
          details: 'Created new flag',
          userId: 'user_1',
          userName: 'Test User',
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      ];

      api.getAll().subscribe((entries) => {
        expect(entries).toEqual(mockEntries);
      });

      const req = httpMock.expectOne(`${baseUrl}/audit`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEntries);
    });
  });

  describe('create', () => {
    it('should POST a new audit entry', () => {
      const input: LogActionInput = {
        action: 'created',
        resourceType: 'flag',
        resourceId: 'flag_123',
        resourceName: 'Test Flag',
        details: 'Created new flag',
        userId: 'user_1',
        userName: 'Test User',
      };

      const mockResponse: AuditEntry = {
        ...input,
        id: 'audit_new',
        timestamp: '2025-01-01T00:00:00.000Z',
      };

      api.create(input).subscribe((entry) => {
        expect(entry).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/audit`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(input);
      req.flush(mockResponse);
    });
  });
});
