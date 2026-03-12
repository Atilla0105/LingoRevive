// SuperMemo-2 (SM-2) simplified algorithm for Spaced Repetition

export type Rating = 'again' | 'hard' | 'good' | 'easy';

interface SM2Data {
  repetitions: number;
  easiness: number;
  interval: number;
}

export function calculateNextReview(rating: Rating, previousData?: SM2Data) {
  let { repetitions = 0, easiness = 2.5, interval = 0 } = previousData || {};

  // Convert rating to SM-2 grade (0-5 scale, we use a simpler 0-3 mapping here)
  let quality = 0;
  switch (rating) {
    case 'again': quality = 0; break; // Complete blackout
    case 'hard':  quality = 2; break; // Correct response but with difficulty
    case 'good':  quality = 4; break; // Correct response after a hesitation
    case 'easy':  quality = 5; break; // Perfect response
  }

  // Update easiness factor
  easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easiness < 1.3) easiness = 1.3;

  // Update repetitions & interval
  if (quality < 3) {
    repetitions = 0;
    interval = 1; // 1 day
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness);
    }
    repetitions++;
  }

  // Convert interval (days) to timestamp for nextReviewDate
  const ONE_DAY = 24 * 60 * 60 * 1000;
  // If "again" (interval = 1, but we want them to see it sooner, like in 5 minutes in a real app, 
  // but for MVP we just set it to now + 5 mins or keep 1 day). We'll do 5 mins for 'again'.
  let nextDateStamp: number;
  
  if (rating === 'again') {
    nextDateStamp = Date.now() + 5 * 60 * 1000; // 5 mins
  } else {
    nextDateStamp = Date.now() + interval * ONE_DAY;
  }

  return {
    sm2Data: { repetitions, easiness, interval },
    nextReviewDate: nextDateStamp
  };
}
