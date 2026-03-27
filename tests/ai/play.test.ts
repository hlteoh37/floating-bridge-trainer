import { describe, it, expect } from 'vitest';
import { makeAIPlayDecision } from '../../src/ai/play';
import { createAIConfig } from '../../src/ai/archetypes';
import { createCardTracker } from '../../src/ai/inference';
import type { Card, Trick, Contract, Bid } from '../../src/engine/types';

const c = (suit: string, rank: string): Card => ({ suit, rank } as Card);

describe('AI card play', () => {
  const contract: Contract = {
    bid: { level: 1, trump: 'spades', playerId: 'p1' },
    declarerId: 'p1', calledCard: c('hearts','A'), partnerId: null,
  };

  it('follows suit when required', () => {
    const hand = [c('hearts','K'), c('hearts','2'), c('spades','A')];
    const trick: Trick = { ledSuit: 'hearts', winnerId: null, cards: [{ card: c('hearts','Q'), playerId: 'p1' }] };
    const played = makeAIPlayDecision(hand, trick, contract, createAIConfig('balanced','intermediate'), createCardTracker(hand), 'p2');
    expect(played.suit).toBe('hearts');
  });
  it('can play any card when void', () => {
    const hand = [c('spades','A'), c('clubs','2')];
    const trick: Trick = { ledSuit: 'hearts', winnerId: null, cards: [{ card: c('hearts','Q'), playerId: 'p1' }] };
    const played = makeAIPlayDecision(hand, trick, contract, createAIConfig('balanced','intermediate'), createCardTracker(hand), 'p2');
    expect(['spades','clubs']).toContain(played.suit);
  });
  it('plays from hand when leading', () => {
    const hand = [c('spades','A'), c('hearts','K'), c('diamonds','3')];
    const trick: Trick = { ledSuit: null as any, winnerId: null, cards: [] };
    const played = makeAIPlayDecision(hand, trick, contract, createAIConfig('balanced','intermediate'), createCardTracker(hand), 'p2');
    expect(hand.some(h => h.suit === played.suit && h.rank === played.rank)).toBe(true);
  });
  it('returns valid card', () => {
    const hand = [c('clubs','5'), c('clubs','9'), c('diamonds','J')];
    const trick: Trick = { ledSuit: 'clubs', winnerId: null, cards: [{ card: c('clubs','K'), playerId: 'p1' }] };
    const played = makeAIPlayDecision(hand, trick, contract, createAIConfig('balanced','beginner'), createCardTracker(hand), 'p2');
    expect(hand.some(h => h.suit === played.suit && h.rank === played.rank)).toBe(true);
  });
});
