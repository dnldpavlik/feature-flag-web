import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@/app/core/api';
import { SegmentApi } from './segment.api';
import { Segment, CreateSegmentInput } from '../models/segment.model';
import { CreateSegmentRuleInput } from '../models/segment-rule.model';

describe('SegmentApi', () => {
  let api: SegmentApi;
  let httpTesting: HttpTestingController;
  const BASE_URL = '/api/v1';

  const mockSegment: Segment = {
    id: 'seg_beta',
    key: 'beta-testers',
    name: 'Beta Testers',
    description: 'Internal and external testers',
    ruleCount: 1,
    rules: [
      {
        id: 'rule_1',
        attribute: 'email',
        operator: 'contains',
        value: '@company.com',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SegmentApi,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
      ],
    });

    api = TestBed.inject(SegmentApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('getAll', () => {
    it('should GET /segments', () => {
      const segments: Segment[] = [mockSegment];
      api.getAll().subscribe((result) => {
        expect(result).toEqual(segments);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/segments`);
      expect(req.request.method).toBe('GET');
      req.flush(segments);
    });
  });

  describe('getById', () => {
    it('should GET /segments/:id', () => {
      api.getById('seg_beta').subscribe((result) => {
        expect(result).toEqual(mockSegment);
      });

      const req = httpTesting.expectOne(`${BASE_URL}/segments/seg_beta`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSegment);
    });
  });

  describe('create', () => {
    it('should POST /segments', () => {
      const input: CreateSegmentInput = {
        key: 'new-segment',
        name: 'New Segment',
        description: 'A new segment',
      };

      api.create(input).subscribe((result) => {
        expect(result.name).toBe('New Segment');
      });

      const req = httpTesting.expectOne(`${BASE_URL}/segments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(input);
      req.flush({ ...mockSegment, ...input, id: 'seg_new' });
    });
  });

  describe('update', () => {
    it('should PATCH /segments/:id', () => {
      const updates = { name: 'Updated Segment', description: 'Updated description' };

      api.update('seg_beta', updates).subscribe((result) => {
        expect(result.name).toBe('Updated Segment');
      });

      const req = httpTesting.expectOne(`${BASE_URL}/segments/seg_beta`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockSegment, ...updates });
    });
  });

  describe('delete', () => {
    it('should DELETE /segments/:id', () => {
      api.delete('seg_beta').subscribe();

      const req = httpTesting.expectOne(`${BASE_URL}/segments/seg_beta`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('addRule', () => {
    it('should POST /segments/:id/rules', () => {
      const input: CreateSegmentRuleInput = {
        attribute: 'country',
        operator: 'equals',
        value: 'US',
      };

      api.addRule('seg_beta', input).subscribe((result) => {
        expect(result).toBeDefined();
      });

      const req = httpTesting.expectOne(`${BASE_URL}/segments/seg_beta/rules`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(input);
      req.flush(mockSegment);
    });
  });

  describe('updateRule', () => {
    it('should PATCH /segments/:id/rules/:ruleId', () => {
      const updates = { value: '@newdomain.com' };

      api.updateRule('seg_beta', 'rule_1', updates).subscribe((result) => {
        expect(result).toBeDefined();
      });

      const req = httpTesting.expectOne(`${BASE_URL}/segments/seg_beta/rules/rule_1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush(mockSegment);
    });
  });

  describe('deleteRule', () => {
    it('should DELETE /segments/:id/rules/:ruleId', () => {
      api.deleteRule('seg_beta', 'rule_1').subscribe((result) => {
        expect(result).toBeDefined();
      });

      const req = httpTesting.expectOne(`${BASE_URL}/segments/seg_beta/rules/rule_1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockSegment);
    });
  });
});
