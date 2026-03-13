'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, ClipboardPaste, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/services/db';
import { getSettings, updateActiveProvider } from '@/lib/services/settings';
import { AIProvider } from '@/lib/types';

export function TranslationBox() {
  const [input, setInput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load settings on mount
  useEffect(() => {
    const settings = getSettings();
    setProvider(settings.activeProvider);
    setApiKeys(settings.apiKeys as Record<string, string>);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleTranslate = async () => {
    if (!input.trim()) return;
    
    setIsTranslating(true);
    setResult(null);
    setError(null);
    setIsDuplicate(false);
    
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: input.trim(),
          provider,
          apiKey: apiKeys[provider] || ''
        }),
      });
      
      if (!res.ok) throw new Error('Translation failed');
      
      const data = await res.json();
      setResult(data.translation);
      
      // Save to database
      const saveResult = await db.saveTranslation(input.trim(), data.translation);
      if (saveResult.isDuplicate) {
        setIsDuplicate(true);
      }
      
    } catch (err) {
      console.error(err);
      setError('Oops, something went wrong. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(prev => prev + text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div 
        layout
        className="bg-white dark:bg-zinc-900 rounded-3xl p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-zinc-100 dark:border-zinc-800 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/30"
      >
        <div className="relative p-4 md:p-6 pb-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type or paste something to translate..."
            className="w-full bg-transparent resize-none outline-none text-xl md:text-2xl font-medium text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 min-h-[60px]"
            rows={1}
            disabled={isTranslating}
          />
        </div>

        <div className="flex items-center justify-between p-2 mt-2 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handlePaste}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
              disabled={isTranslating}
            >
              <ClipboardPaste className="w-4 h-4" />
              <span className="hidden sm:inline">Paste</span>
            </button>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block mx-1"></div>

            <div className="relative group">
              <select
                value={provider}
                onChange={(e) => {
                  const newProvider = e.target.value as AIProvider;
                  setProvider(newProvider);
                  updateActiveProvider(newProvider);
                }}
                disabled={isTranslating}
                className="appearance-none flex items-center gap-2 pl-3 pr-8 py-2 text-sm font-medium text-zinc-600 bg-transparent hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors rounded-xl outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
                <option value="claude">Claude</option>
                <option value="deepseek">DeepSeek</option>
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          
          <button
            onClick={handleTranslate}
            disabled={!input.trim() || isTranslating}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all active:scale-95",
              input.trim() && !isTranslating
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30"
                : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed"
            )}
          >
            {isTranslating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Translate</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="mt-6 p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-3xl border border-indigo-100/50 dark:border-indigo-900/50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles className="w-24 h-24 text-indigo-600 dark:text-indigo-400" />
            </div>
            
            <div className="relative z-10">
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Natural English
              </p>
              <p className="text-2xl md:text-4xl font-semibold text-zinc-900 dark:text-white leading-tight">
                {result}
              </p>
              
              {isDuplicate && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-full"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  You&apos;ve translated this before! Flagged as important.
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/50 text-center font-medium"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
