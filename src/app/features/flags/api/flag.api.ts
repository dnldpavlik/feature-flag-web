import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { CrudApi } from '@/app/core/api';
import { Flag, CreateFlagInput } from '@/app/features/flags/models/flag.model';
import { FlagTypeMap } from '@/app/features/flags/models/flag-value.model';

export interface UpdateFlagInput {
  name?: string;
  description?: string;
  tags?: string[];
  defaultValue?: FlagTypeMap[keyof FlagTypeMap];
}

export interface UpdateEnvironmentValuePayload {
  value?: FlagTypeMap[keyof FlagTypeMap];
  enabled?: boolean;
}

/** Raw flag shape from the backend (uses resourceName instead of name) */
interface RawFlag extends Omit<Flag, 'name'> {
  resourceName: string;
  name?: string;
}

/** Map backend resourceName to frontend name */
function normalizeFlag(raw: RawFlag): Flag {
  return { ...raw, name: raw.name ?? raw.resourceName };
}

@Injectable({ providedIn: 'root' })
export class FlagApi extends CrudApi<Flag, CreateFlagInput, UpdateFlagInput> {
  protected override resourcePath = 'flags';

  override getAll(): Observable<Flag[]> {
    return super.getAll().pipe(map((flags) => (flags as unknown as RawFlag[]).map(normalizeFlag)));
  }

  override getById(id: string): Observable<Flag> {
    return super.getById(id).pipe(map((flag) => normalizeFlag(flag as unknown as RawFlag)));
  }

  override create(input: CreateFlagInput): Observable<Flag> {
    return super.create(input).pipe(map((flag) => normalizeFlag(flag as unknown as RawFlag)));
  }

  override update(id: string, updates: UpdateFlagInput): Observable<Flag> {
    return super.update(id, updates).pipe(map((flag) => normalizeFlag(flag as unknown as RawFlag)));
  }

  getByKey(key: string): Observable<Flag> {
    return this.http.get<RawFlag>(`${this.resourceUrl}/key/${key}`).pipe(map(normalizeFlag));
  }

  updateEnvironmentValue(
    flagId: string,
    environmentId: string,
    updates: UpdateEnvironmentValuePayload,
  ): Observable<Flag> {
    return this.http
      .patch<RawFlag>(`${this.resourceUrl}/${flagId}/environments/${environmentId}`, updates)
      .pipe(map(normalizeFlag));
  }
}
