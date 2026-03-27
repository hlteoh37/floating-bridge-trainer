import type { Card, TrumpChoice } from '../engine/types.ts';
import type { AIConfig } from './types.ts';
import { SUITS, RANKS } from '../engine/card.ts';
import { evaluateDistribution } from '../stats/hand-eval.ts';

export function makeAICallDecision(hand: Card[], trump: TrumpChoice, config: AIConfig): Card {
  const dist = evaluateDistribution(hand);
  const candidateSuits = SUITS.filter(s => trump === 'no-trump' || s !== trump);
  candidateSuits.sort((a, b) => dist[a] - dist[b]);

  for (const suit of candidateSuits) {
    const hasAce = hand.some(c => c.suit === suit && c.rank === 'A');
    if (!hasAce) {
      if (Math.random() < config.noiseLevel) {
        const hasKing = hand.some(c => c.suit === suit && c.rank === 'K');
        if (!hasKing) return { suit, rank: 'K' };
      }
      return { suit, rank: 'A' };
    }
  }

  for (const suit of candidateSuits) {
    const ranksDesc = [...RANKS].reverse();
    for (const rank of ranksDesc) {
      if (!hand.some(c => c.suit === suit && c.rank === rank)) return { suit, rank };
    }
  }

  return { suit: 'clubs', rank: 'A' };
}
