import { describe, it, expect } from 'vitest';
import { createCardTracker } from '../../src/ai/inference';
import type { Card, Trick } from '../../src/engine/types';

const c = (suit: string, rank: string): Card => ({ suit, rank } as Card);

describe('card tracker', () => {
  it('starts with 52 unseen', () => { expect(createCardTracker([]).unseenCards).toHaveLength(52); });
  it('excludes own hand', () => { expect(createCardTracker([c('spades','A'), c('hearts','K')]).unseenCards).toHaveLength(50); });
  it('recordTrick removes played cards', () => {
    const t = createCardTracker([c('spades','A')]);
    t.recordTrick({ ledSuit: 'hearts', winnerId: 'p2', cards: [
      { card: c('hearts','2'), playerId: 'p1' }, { card: c('hearts','K'), playerId: 'p2' },
      { card: c('hearts','5'), playerId: 'p3' }, { card: c('diamonds','3'), playerId: 'p4' },
    ]});
    expect(t.unseenCards).toHaveLength(47); expect(t.playedCards).toHaveLength(4);
  });
  it('countRemainingInSuit', () => { expect(createCardTracker([c('spades','A')]).countRemainingInSuit('spades')).toBe(12); });
  it('isCardPlayed', () => {
    const t = createCardTracker([]);
    t.recordTrick({ ledSuit: 'hearts', winnerId: 'p1', cards: [
      { card: c('hearts','A'), playerId: 'p1' }, { card: c('hearts','2'), playerId: 'p2' },
      { card: c('hearts','3'), playerId: 'p3' }, { card: c('hearts','4'), playerId: 'p4' },
    ]});
    expect(t.isCardPlayed(c('hearts','A'))).toBe(true);
    expect(t.isCardPlayed(c('hearts','K'))).toBe(false);
  });
});
