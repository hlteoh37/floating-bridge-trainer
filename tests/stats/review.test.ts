import { describe, it, expect } from 'vitest';
import { generateHandReview } from '../../src/stats/review';
import type { Card, Trick } from '../../src/engine/types';

const c = (suit: string, rank: string): Card => ({ suit: suit as Card['suit'], rank: rank as Card['rank'] });

describe('hand review', () => {
  it('generates review with summary for completed hand', () => {
    const tricks: Trick[] = [
      {
        ledSuit: 'hearts',
        winnerId: 'player-0',
        cards: [
          { card: c('hearts', 'A'), playerId: 'player-0' },
          { card: c('hearts', '2'), playerId: 'player-1' },
          { card: c('hearts', '3'), playerId: 'player-2' },
          { card: c('hearts', '4'), playerId: 'player-3' },
        ],
      },
    ];

    const review = generateHandReview(tricks, 'spades', 'player-0', 'player-2');
    expect(review.tricks).toHaveLength(1);
    expect(review.tricks[0].winnerId).toBe('player-0');
    expect(review.summary).toBeTruthy();
  });

  it('review includes all tricks', () => {
    const tricks: Trick[] = Array.from({ length: 3 }, (_, i) => ({
      ledSuit: 'hearts' as const,
      winnerId: `player-${i % 4}`,
      cards: [
        { card: c('hearts', String(i + 2) as Card['rank']), playerId: 'player-0' },
        { card: c('hearts', String(i + 3) as Card['rank']), playerId: 'player-1' },
        { card: c('diamonds', String(i + 2) as Card['rank']), playerId: 'player-2' },
        { card: c('clubs', String(i + 2) as Card['rank']), playerId: 'player-3' },
      ],
    }));

    const review = generateHandReview(tricks, 'no-trump', 'player-0', 'player-2');
    expect(review.tricks).toHaveLength(3);
  });
});
