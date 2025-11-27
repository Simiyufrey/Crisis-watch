
export interface NewsItem {
  id: string; // Unique identifier for the database
  headline: string;
  summary: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  location: string;
  timestamp: string;
  category: string;
  impact_score: number; // 1-100
  sources?: Source[];
  imageUrl?: string; // Specific image for the news item
}

export interface Source {
  title: string;
  url: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  keywords: string[];
  color: string; // Tailwind color class prefix (e.g., 'cyan', 'emerald')
}

export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR
}

export interface VoiceConfig {
  voiceName: string;
  isMuted: boolean;
}

export interface StoredCategoryData {
  lastUpdated: number;
  items: NewsItem[];
}
