import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '@/app/core/api/api.tokens';
import { AuditEntry, LogActionInput } from '../models/audit.model';

@Injectable({ providedIn: 'root' })
export class AuditApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getAll(): Observable<AuditEntry[]> {
    return this.http.get<AuditEntry[]>(`${this.baseUrl}/audit`);
  }

  create(input: LogActionInput): Observable<AuditEntry> {
    return this.http.post<AuditEntry>(`${this.baseUrl}/audit`, input);
  }
}
