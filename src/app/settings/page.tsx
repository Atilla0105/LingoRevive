'use client';

import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Key, Save, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AIProvider, AppSettings } from '@/lib/types';
import { getSettings, saveSettings } from '@/lib/services/settings';

const PROVIDERS: { id: AIProvider; name: string }[] = [
  { id: 'openai', name: 'OpenAI (ChatGPT)' },
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'claude', name: 'Anthropic Claude' },
  { id: 'deepseek', name: 'DeepSeek' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({ activeProvider: 'openai', apiKeys: {} });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleProviderChange = (provider: AIProvider) => {
    setSettings(prev => ({ ...prev, activeProvider: provider }));
  };

  const handleKeyChange = (provider: AIProvider, value: string) => {
    setSettings(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: value
      }
    }));
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full animate-in fade-in py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <SettingsIcon className="w-8 h-8 text-indigo-500" />
          Settings
        </h1>
        <p className="text-zinc-500">
          Manage your AI models and API keys below. All keys are stored securely in your local browser storage.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-8">
        
        {/* Default Provider Selection */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
            Default Translation Model
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {PROVIDERS.map((provider) => {
              const isActive = settings.activeProvider === provider.id;
              return (
                <button
                  key={provider.id}
                  onClick={() => handleProviderChange(provider.id)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                    isActive
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300 shadow-sm'
                      : 'bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {provider.name}
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1" />}
                </button>
              );
            })}
          </div>
        </section>

        <hr className="border-zinc-100 dark:border-zinc-800" />

        {/* API Keys Settings */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
            <Key className="w-5 h-5" />
            Provider API Keys
          </h2>
          
          <div className="space-y-4">
            {PROVIDERS.map((provider) => (
              <div key={provider.id} className="group">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {provider.name} API Key
                </label>
                <input
                  type="password"
                  placeholder={`Paste your ${provider.name} key here...`}
                  value={settings.apiKeys[provider.id] || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleKeyChange(provider.id, e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono text-sm placeholder:font-sans"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Save Details */}
        <div className="pt-4 flex items-center justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                Saved Successfully
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
