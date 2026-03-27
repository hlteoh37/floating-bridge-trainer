import type { Rank } from '../engine/types.ts';

export const HIGH_CARD_POINTS: Partial<Record<Rank, number>> = {
  'A': 4, 'K': 3, 'Q': 2, 'J': 1,
};

export const BID_THRESHOLDS: Record<number, { minStrength: number }> = {
  1: { minStrength: 10 }, 2: { minStrength: 14 }, 3: { minStrength: 18 },
  4: { minStrength: 22 }, 5: { minStrength: 26 }, 6: { minStrength: 30 }, 7: { minStrength: 34 },
};
