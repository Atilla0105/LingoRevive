export interface TranslationRecord {
  id: string;
  original: string;
  translation: string;
  context?: string;
  importance: number;
  nextReviewDate: number;
  createdAt: number;
  lastReviewedAt: number;
  stability?: number; // For SRS algorithm
  history?: number[]; // Store a history of past ratings
}

export type AIProvider = 'openai' | 'gemini' | 'claude' | 'deepseek';

export interface AppSettings {
  activeProvider: AIProvider;
  apiKeys: {
    openai?: string;
    gemini?: string;
    claude?: string;
    deepseek?: string;
  };
}
