/** Represents an item that can be searched */
export interface Searchable {
  name: string;
  key: string;
  description: string;
  type?: string;
  tags: string[];
}

/** Represents a part of text with highlight information */
export interface HighlightPart {
  text: string;
  match: boolean;
}
