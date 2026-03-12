'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

interface FlashCardProps {
  original: string;
  translation: string;
  onRating: (rating: ReviewRating) => void;
}

export function FlashCard({ original, translation, onRating }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto aspect-[3/4] relative perspective-1000">
      <AnimatePresence initial={false} mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: -180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 180, opacity: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
            onClick={() => setIsFlipped(true)}
            className="absolute inset-0 w-full h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 cursor-pointer transform-style-3d backface-hidden"
          >
            <span className="text-zinc-400 dark:text-zinc-500 font-medium mb-6 uppercase tracking-widest text-sm">
              Translate this
            </span>
            <p className="text-3xl font-semibold text-center text-zinc-800 dark:text-zinc-100 leading-snug">
              {original}
            </p>
            <div className="absolute bottom-8 mt-auto flex items-center gap-2 text-zinc-400 dark:text-zinc-500 cursor-pointer hover:text-indigo-500 transition-colors">
              <RefreshCcw className="w-5 h-5" />
              <span className="text-sm font-medium">Tap to reveal</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: -180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 180, opacity: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute inset-0 w-full h-full bg-indigo-600 text-white rounded-3xl shadow-2xl flex flex-col p-8 transform-style-3d backface-hidden"
          >
            <div className="flex-1 flex flex-col items-center justify-center -mt-8">
              <span className="text-indigo-200 font-medium mb-4 uppercase tracking-widest text-sm">
                Answer
              </span>
              <p className="text-3xl md:text-4xl font-bold text-center leading-tight">
                {translation}
              </p>
            </div>

            <div className="mt-auto pt-6 border-t border-indigo-500/50">
              <p className="text-center text-sm font-medium text-indigo-200 mb-4 tracking-wide">
                How well did you know this?
              </p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onRating('again'); setIsFlipped(false); }}
                  className="py-3 px-2 flex flex-col items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
                >
                  <span className="font-semibold text-sm">Again</span>
                  <span className="text-[10px] text-indigo-300">&lt; 5m</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRating('hard'); setIsFlipped(false); }}
                  className="py-3 px-2 flex flex-col items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
                >
                  <span className="font-semibold text-sm">Hard</span>
                  <span className="text-[10px] text-indigo-300">1d</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRating('good'); setIsFlipped(false); }}
                  className="py-3 px-2 flex flex-col items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
                >
                  <span className="font-semibold text-sm">Good</span>
                  <span className="text-[10px] text-indigo-300">3d+</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRating('easy'); setIsFlipped(false); }}
                  className="py-3 px-2 flex flex-col items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors"
                >
                  <span className="font-semibold text-sm">Easy</span>
                  <span className="text-[10px] text-indigo-300">7d+</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
