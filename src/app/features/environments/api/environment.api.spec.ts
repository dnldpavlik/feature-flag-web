import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@/app/core/api';
import { EnvironmentApi } from './environment.api';
import {
  Environment,
  CreateEnvironmentInput,
} from '@/app/features/environments/models/environment.model';

describe('EnvironmentApi', () => {
  let api: EnvironmentApi;
  let httpTesting: HttpTestingController;
  const BASE_URL = '/api/v1';

  const mockEnvironment: Environment = {
    id: 'env_dev',
    key: 'development',
    name: 'Development',
    color: '#10B981',
    order: 0,
    isDefault: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EnvironmentApi,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
      ],
    });

    api = TestBed.inject(EnvironmentApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('getAll', () => {
    it('should GET /environments', () => {
      const environments: Environment[] = [mockEnvironment];
      api.getAll().subscribe((result) => {
        expect(result).toEqual(environments);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/environments`);
      expect(req.request.method).toBe('GET');
      req.flush(environments);
    });
  });

  describe('getById', () => {
    it('should GET /environments/:id', () => {
      api.getById('env_dev').subscribe((result) => {
        expect(result).toEqual(mockEnvironment);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/environments/env_dev`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEnvironment);
    });
  });

  describe('create', () => {
    it('should POST /environments', () => {
      const input: CreateEnvironmentInput = {
        key: 'qa',
        name: 'QA',
        color: '#8B5CF6',
        order: 3,
      };

      api.create(input).subscribe((result) => {
        expect(result.name).toBe('QA');
      });

      const req = httpTesting.expectOne(`${BASE_URL}/environments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(input);
      req.flush({ ...mockEnvironment, ...input, id: 'env_qa' });
    });
  });

  describe('update', () => {
    it('should PATCH /environments/:id', () => {
      const updates = { name: 'Dev Environment' };

      api.update('env_dev', updates).subscribe((result) => {
        expect(result.name).toBe('Dev Environment');
      });

      const req = httpTesting.expectOne(`${BASE_URL}/environments/env_dev`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockEnvironment, name: 'Dev Environment' });
    });
  });

  describe('delete', () => {
    it('should DELETE /environments/:id', () => {
      api.delete('env_dev').subscribe();

      const req = httpTesting.expectOne(`${BASE_URL}/environments/env_dev`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('setDefault', () => {
    it('should POST /environments/:id/default', () => {
      api.setDefault('env_dev').subscribe((result) => {
        expect(result).toEqual(mockEnvironment);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/environments/env_dev/default`);
      expect(req.request.method).toBe('POST');
      req.flush(mockEnvironment);
    });
  });
});
