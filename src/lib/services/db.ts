import { TranslationRecord } from '../types';

// Simple LocalStorage Wrapper for MVP Data Management
// In a full production app (e.g., Supabase/Prisma), this would act as the adapter layer.

const DB_KEY = 'lingorevive_records';

export const db = {
  getRecords: async (): Promise<TranslationRecord[]> => {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Failed to parse DB records', err);
      return [];
    }
  },

  saveTranslation: async (original: string, translation: string): Promise<{ record: TranslationRecord, isDuplicate: boolean }> => {
    const rawData = localStorage.getItem(DB_KEY);
    const records: TranslationRecord[] = rawData ? JSON.parse(rawData) : [];
    
    // Check for duplicate original text
    const existingIndex = records.findIndex(
      r => r.original.trim().toLowerCase() === original.trim().toLowerCase()
    );

    let isDuplicate = false;
    let savedRecord: TranslationRecord;

    if (existingIndex >= 0) {
      isDuplicate = true;
      // It's a duplicate. We bump importance and update the nextReviewDate lightly 
      // so it surfaces more frequently or has stronger weighting.
      records[existingIndex].importance += 1;
      // We might want to force a review soon if they looked it up again
      records[existingIndex].nextReviewDate = Date.now(); 
      savedRecord = records[existingIndex];
    } else {
      // New record
      savedRecord = {
        id: crypto.randomUUID(),
        original,
        translation,
        importance: 1,
        lastReviewedAt: 0,
        nextReviewDate: Date.now(), // Due immediately for initial learning
        createdAt: Date.now()
      };
      records.unshift(savedRecord);
    }
    
    // Keep it in localStorage
    localStorage.setItem(DB_KEY, JSON.stringify(records));
    
    return { record: savedRecord, isDuplicate };
  },

  updateRecord: async (updatedRecord: TranslationRecord): Promise<void> => {
    const records = await db.getRecords();
    const index = records.findIndex(r => r.id === updatedRecord.id);
    if (index >= 0) {
      records[index] = updatedRecord;
      localStorage.setItem(DB_KEY, JSON.stringify(records));
    }
  },

  getDueRecords: async (limit: number = 20): Promise<TranslationRecord[]> => {
    const records = await db.getRecords();
    const now = Date.now();
    
    // Sort logic: Due items first, then by importance
    return records
      .filter(r => r.nextReviewDate <= now)
      .sort((a, b) => b.importance - a.importance)
      // Cap at specific count for the daily 10 min session (e.g 20-30 max)
      .slice(0, limit);
  }
};
