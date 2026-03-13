'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/services/db';
import { TranslationRecord } from '@/lib/types';
import { BookOpen, Calendar, Star, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoryPage() {
  const [records, setRecords] = useState<TranslationRecord[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecords() {
      const data = await db.getRecords();
      setRecords(data);
      setIsLoading(false);
    }
    fetchRecords();
  }, []);

  const filteredRecords = records.filter(r => 
    r.original.toLowerCase().includes(search.toLowerCase()) || 
    r.translation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-full animate-in fade-in py-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <BookOpen className="w-8 h-8 text-indigo-500" />
            Your Dictionary
          </h1>
          <p className="text-zinc-500">You haven&apos;t translated anything yet.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search phrases..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 border-dashed">
          <BookOpen className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
          <p>No records found. Start translating to build your dictionary!</p>
        </div>
      ) : (
        <div className="grid gap-4 w-full">
          <AnimatePresence>
            {filteredRecords.map((record) => (
              <motion.div 
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{record.original}</p>
                  {record.importance > 1 && (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg">
                      <Star className="w-3 h-3 fill-amber-500 stroke-amber-500" />
                      Important ({record.importance})
                    </span>
                  )}
                </div>
                
                <p className="text-zinc-600 dark:text-zinc-400 font-medium">{record.translation}</p>
                
                <div className="pt-3 mt-1 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-4 text-xs tracking-wide text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Added: {new Date(record.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    Next Review: {new Date(record.nextReviewDate).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
