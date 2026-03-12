'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/services/db';
import { TranslationRecord } from '@/lib/types';
import { BarChart3, Bot, Sparkles, Loader2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { format, subDays, startOfDay, endOfDay, isSameDay } from 'date-fns';

export default function ReportPage() {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Generate last 7 days for the horizontal calendar strip
  const recentDays = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReport(null);
    setError(null);

    try {
      // Get all records, filter for the explicitly selected Date
      const allRecords = await db.getRecords();
      
      const dayStart = startOfDay(selectedDate).getTime();
      const dayEnd = endOfDay(selectedDate).getTime();

      const dailyRecords = allRecords.filter(
        r => (r.createdAt >= dayStart && r.createdAt <= dayEnd) || 
             (r.lastReviewedAt >= dayStart && r.lastReviewedAt <= dayEnd)
      );

      if (dailyRecords.length === 0) {
        setError(`你在 ${format(selectedDate, 'MM月dd日')} 没有任何复习或翻译记录。`);
        setIsGenerating(false);
        return;
      }

      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: dailyRecords }),
      });

      if (!res.ok) throw new Error("Failed to generate report");
      
      const data = await res.json();
      setReport(data.report);

    } catch (err) {
      console.error(err);
      setError("AI 报告生成失败，请稍后再试。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-full animate-in fade-in py-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <BarChart3 className="w-8 h-8 text-indigo-500" />
          全能复习总结
        </h1>
        <p className="text-zinc-500">
          通过 AI 解析你过往的翻译和复习记录，洞察真实生活中的语境与词汇逻辑。
        </p>
      </div>

      {/* Horizontal Date Picker */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-4 scrollbar-hide py-2">
        {recentDays.map((d, index) => {
          const isSelected = isSameDay(d, selectedDate);
          const isToday = isSameDay(d, new Date());
          
          return (
            <button
              key={index}
              onClick={() => { setSelectedDate(d); setReport(null); setError(null); }}
              className={`flex flex-col items-center justify-center min-w-[72px] p-3 rounded-2xl transition-all border ${
                isSelected 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold transform scale-105' 
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-indigo-700/50'
              }`}
            >
              <span className={`text-xs mb-1 ${isSelected ? 'text-indigo-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                {format(d, 'EEE')}
              </span>
              <span className="text-xl">
                {format(d, 'd')}
              </span>
              {isToday && !isSelected && (
                <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1" />
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                查阅 {format(selectedDate, 'MM月dd日')} 的学习报告
              </p>
              <p className="text-sm">点击按钮，让我为你生成这一天的知识点拆解。</p>
            </div>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                生成精读报告
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-2xl border border-amber-200 dark:border-amber-900/50 font-medium">
          {error}
        </motion.div>
      )}

      {report && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden"
        >
          <div className="prose prose-indigo dark:prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-900 max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-lg prose-li:my-1">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}
