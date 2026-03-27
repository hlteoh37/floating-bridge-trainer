import { describe, it, expect } from 'vitest';
import { makeAIBidDecision } from '../../src/ai/bidding';
import { createAIConfig } from '../../src/ai/archetypes';
import type { Card, Bid } from '../../src/engine/types';

const c = (suit: string, rank: string): Card => ({ suit, rank } as Card);

describe('AI bidding', () => {
  const strongHand = [c('spades','A'),c('spades','K'),c('spades','Q'),c('spades','J'),c('spades','10'),
    c('hearts','A'),c('hearts','K'),c('diamonds','A'),c('diamonds','5'),c('diamonds','3'),
    c('clubs','9'),c('clubs','5'),c('clubs','2')];
  const weakHand = [c('spades','2'),c('spades','3'),c('hearts','4'),c('hearts','5'),c('hearts','6'),
    c('diamonds','2'),c('diamonds','3'),c('diamonds','4'),c('clubs','2'),c('clubs','3'),
    c('clubs','4'),c('clubs','5'),c('clubs','6')];

  it('strong hand produces a bid', () => {
    const r = makeAIBidDecision(strongHand, null, createAIConfig('balanced', 'intermediate'), 'p1');
    expect(r).not.toBeNull();
    if (r) { expect(r.level).toBeGreaterThanOrEqual(1); expect(r.level).toBeLessThanOrEqual(7); }
  });
  it('weak hand usually passes', () => {
    let passes = 0;
    for (let i = 0; i < 20; i++) {
      if (makeAIBidDecision(weakHand, null, createAIConfig('conservative', 'intermediate'), 'p1') === null) passes++;
    }
    expect(passes).toBeGreaterThan(10);
  });
  it('aggressive bids higher than conservative', () => {
    let agg = 0, con = 0;
    for (let i = 0; i < 50; i++) {
      const a = makeAIBidDecision(strongHand, null, createAIConfig('aggressive', 'intermediate'), 'p1');
      const c2 = makeAIBidDecision(strongHand, null, createAIConfig('conservative', 'intermediate'), 'p1');
      if (a) agg += a.level; if (c2) con += c2.level;
    }
    expect(agg).toBeGreaterThan(con);
  });
  it('respects current bid', () => {
    const cur: Bid = { level: 3, trump: 'spades', playerId: 'other' };
    const r = makeAIBidDecision(strongHand, cur, createAIConfig('balanced', 'intermediate'), 'p1');
    if (r) {
      const higher = r.level > cur.level || (r.level === cur.level && r.trump === 'no-trump');
      expect(higher).toBe(true);
    }
  });
});
