export interface Channel {
  id: string; // Unique client identifier
  name: string;
  url: string;
  groupTitle: string;
  tvgId?: string;
  tvgName?: string;
  tvgLogo?: string;
  tvgCountry?: string;
  tvgLanguage?: string;
  rawAttributes?: Record<string, string>;
  extraLines?: string[]; // E.g., #EXTVLCOPT or #KODIPROP
}

export interface GroupSummary {
  name: string;
  channelCount: number;
  originalIndex: number;
}

export type SortOrder = 'alpha-asc' | 'alpha-desc' | 'count-desc' | 'count-asc' | 'custom';

export interface HistoryState {
  channels: Channel[];
  groupOrder: string[];
  description: string;
  timestamp: number;
}
