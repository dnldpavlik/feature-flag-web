export type FlagType = 'boolean' | 'string' | 'number' | 'json';

export interface Flag {
  id: string;
  key: string;
  name: string;
  description: string;
  type: FlagType;
  enabled: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlagInput {
  key: string;
  name: string;
  description: string;
  type: FlagType;
  enabled: boolean;
  tags: string[];
}
