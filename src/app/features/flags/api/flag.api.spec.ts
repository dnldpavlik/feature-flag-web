import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@/app/core/api';
import { FlagApi } from './flag.api';
import { Flag, CreateFlagInput } from '@/app/features/flags/models/flag.model';

describe('FlagApi', () => {
  let api: FlagApi;
  let httpTesting: HttpTestingController;
  const BASE_URL = '/api/v1';

  const mockFlag: Flag = {
    id: 'flag_new_checkout',
    projectId: 'proj_default',
    key: 'new-checkout',
    name: 'New Checkout Experience',
    description: 'Enables the new checkout flow',
    type: 'boolean',
    defaultValue: false,
    tags: ['checkout', 'beta'],
    environmentValues: {
      env_development: {
        environmentId: 'env_development',
        flagId: 'flag_new_checkout',
        enabled: true,
        value: true,
        segmentKeys: [],
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlagApi,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
      ],
    });

    api = TestBed.inject(FlagApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('getAll', () => {
    it('should GET /flags', () => {
      const flags: Flag[] = [mockFlag];
      api.getAll().subscribe((result) => {
        expect(result).toEqual(flags);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/flags`);
      expect(req.request.method).toBe('GET');
      req.flush(flags);
    });
  });

  describe('getById', () => {
    it('should GET /flags/:id', () => {
      api.getById('flag_new_checkout').subscribe((result) => {
        expect(result).toEqual(mockFlag);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/flags/flag_new_checkout`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFlag);
    });
  });

  describe('getByKey', () => {
    it('should GET /flags/key/:key', () => {
      api.getByKey('new-checkout').subscribe((result) => {
        expect(result).toEqual(mockFlag);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/flags/key/new-checkout`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFlag);
    });
  });

  describe('create', () => {
    it('should POST /flags', () => {
      const input: CreateFlagInput = {
        projectId: 'proj_default',
        key: 'dark-mode',
        name: 'Dark Mode',
        description: 'Enables dark mode UI',
        type: 'boolean',
        defaultValue: false,
        tags: ['ui'],
      };

      api.create(input).subscribe((result) => {
        expect(result.name).toBe('Dark Mode');
      });

      const req = httpTesting.expectOne(`${BASE_URL}/flags`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(input);
      req.flush({ ...mockFlag, ...input, id: 'flag_dark_mode' });
    });
  });

  describe('update', () => {
    it('should PATCH /flags/:id', () => {
      const updates = { name: 'Updated Checkout', description: 'Updated description' };

      api.update('flag_new_checkout', updates).subscribe((result) => {
        expect(result.name).toBe('Updated Checkout');
      });

      const req = httpTesting.expectOne(`${BASE_URL}/flags/flag_new_checkout`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockFlag, ...updates });
    });
  });

  describe('delete', () => {
    it('should DELETE /flags/:id', () => {
      api.delete('flag_new_checkout').subscribe();

      const req = httpTesting.expectOne(`${BASE_URL}/flags/flag_new_checkout`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('updateEnvironmentValue', () => {
    it('should PATCH /flags/:id/environments/:envId', () => {
      const updates = { enabled: true, value: true };

      api
        .updateEnvironmentValue('flag_new_checkout', 'env_production', updates)
        .subscribe((result) => {
          expect(result).toBeDefined();
        });

      const req = httpTesting.expectOne(
        `${BASE_URL}/flags/flag_new_checkout/environments/env_production`,
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush(mockFlag);
    });

    it('should update only enabled state', () => {
      const updates = { enabled: false };

      api.updateEnvironmentValue('flag_new_checkout', 'env_development', updates).subscribe();

      const req = httpTesting.expectOne(
        `${BASE_URL}/flags/flag_new_checkout/environments/env_development`,
      );
      expect(req.request.body).toEqual(updates);
      req.flush(mockFlag);
    });

    it('should update only value', () => {
      const updates = { value: 'new-variant' };

      api.updateEnvironmentValue('flag_new_checkout', 'env_staging', updates).subscribe();

      const req = httpTesting.expectOne(
        `${BASE_URL}/flags/flag_new_checkout/environments/env_staging`,
      );
      expect(req.request.body).toEqual(updates);
      req.flush(mockFlag);
    });
  });
});
