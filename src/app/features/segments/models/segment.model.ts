export interface Segment {
  id: string;
  key: string;
  name: string;
  description: string;
  ruleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSegmentInput {
  key: string;
  name: string;
  description: string;
}
