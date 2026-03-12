import { AppSettings, AIProvider } from '../types';

const SETTINGS_KEY = 'lingorevive_settings';

const defaultSettings: AppSettings = {
  activeProvider: 'openai',
  apiKeys: {},
};

export const getSettings = (): AppSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(stored) };
  } catch (e) {
    return defaultSettings;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const updateActiveProvider = (provider: AIProvider): void => {
  const current = getSettings();
  saveSettings({ ...current, activeProvider: provider });
};

export const updateApiKey = (provider: AIProvider, key: string): void => {
  const current = getSettings();
  saveSettings({
    ...current,
    apiKeys: {
      ...current.apiKeys,
      [provider]: key,
    },
  });
};
