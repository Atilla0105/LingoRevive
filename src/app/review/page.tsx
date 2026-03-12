'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashCard, ReviewRating } from '@/components/FlashCard';
import { db } from '@/lib/services/db';
import { TranslationRecord } from '@/lib/types';
import { calculateNextReview } from '@/lib/srs/spaceRepetition';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Flame } from 'lucide-react';

export default function ReviewPage() {
  const [dueCards, setDueCards] = useState<TranslationRecord[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);

  // Load due cards limit (simulate daily 10 min, max 20 cards)
  useEffect(() => {
    async function load() {
      const records = await db.getDueRecords(20);
      setDueCards(records);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleRating = async (rating: ReviewRating) => {
    const currentCard = dueCards[currentCardIndex];
    if (!currentCard) return;

    // We assume some stored SM2 state on the card (or default it)
    const previousData = {
      repetitions: (currentCard as any).sm2Repetitions || 0,
      easiness: (currentCard as any).sm2Easiness || 2.5,
      interval: (currentCard as any).sm2Interval || 0,
    };

    const { sm2Data, nextReviewDate } = calculateNextReview(rating, previousData);

    // Build updated record
    const updatedCard = {
      ...currentCard,
      ...sm2Data,
      sm2Repetitions: sm2Data.repetitions,
      sm2Easiness: sm2Data.easiness,
      sm2Interval: sm2Data.interval,
      nextReviewDate,
      lastReviewedAt: Date.now(),
    };

    // Save to DB
    await db.updateRecord(updatedCard);

    // Update state
    setCompletedCount(prev => prev + 1);
    setCurrentCardIndex(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  const isFinished = currentCardIndex >= dueCards.length;
  const currentCard = dueCards[currentCardIndex];
  const progressPercent = dueCards.length > 0 ? (completedCount / dueCards.length) * 100 : 100;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full min-h-[60vh] pt-4">
      
      {!isFinished && dueCards.length > 0 && (
        <div className="mb-8 w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-zinc-500 flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              Daily Review
            </span>
            <span className="text-sm font-medium text-zinc-500">
              {completedCount} / {dueCards.length}
            </span>
          </div>
          <div className="w-full h-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden relative">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-indigo-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, type: 'spring' }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <AnimatePresence mode="wait">
          {!isFinished && currentCard ? (
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <FlashCard 
                original={currentCard.original}
                translation={currentCard.translation}
                onRating={handleRating}
              />
            </motion.div>
          ) : (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center max-w-sm px-6 py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                All caught up!
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                {dueCards.length === 0 
                  ? "You have no phrases to review yet. Try translating something new!"
                  : "Great job completing your daily review! See you tomorrow."}
              </p>
              <Link 
                href="/"
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Translator
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
