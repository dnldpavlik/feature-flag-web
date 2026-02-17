import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CrudApi } from '@/app/core/api';
import { CreateSegmentInput, Segment, UpdateSegmentInput } from '../models/segment.model';
import { CreateSegmentRuleInput, UpdateSegmentRuleInput } from '../models/segment-rule.model';

@Injectable({ providedIn: 'root' })
export class SegmentApi extends CrudApi<Segment, CreateSegmentInput, UpdateSegmentInput> {
  protected override resourcePath = 'segments';

  addRule(segmentId: string, input: CreateSegmentRuleInput): Observable<Segment> {
    return this.http.post<Segment>(`${this.resourceUrl}/${segmentId}/rules`, input);
  }

  updateRule(
    segmentId: string,
    ruleId: string,
    updates: UpdateSegmentRuleInput,
  ): Observable<Segment> {
    return this.http.patch<Segment>(`${this.resourceUrl}/${segmentId}/rules/${ruleId}`, updates);
  }

  deleteRule(segmentId: string, ruleId: string): Observable<Segment> {
    return this.http.delete<Segment>(`${this.resourceUrl}/${segmentId}/rules/${ruleId}`);
  }
}
