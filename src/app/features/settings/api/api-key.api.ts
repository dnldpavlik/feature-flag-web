import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '@/app/core/api/api.tokens';
import { ApiKey, CreateApiKeyInput, CreateApiKeyResult } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class ApiKeyApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getAll(): Observable<ApiKey[]> {
    return this.http.get<ApiKey[]>(`${this.baseUrl}/api-keys`);
  }

  create(input: CreateApiKeyInput): Observable<CreateApiKeyResult> {
    return this.http.post<CreateApiKeyResult>(`${this.baseUrl}/api-keys`, input);
  }

  revoke(keyId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api-keys/${keyId}`);
  }
}
