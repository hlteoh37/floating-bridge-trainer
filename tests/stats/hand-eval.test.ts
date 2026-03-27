import { describe, it, expect } from 'vitest';
import { countHighCardPoints, evaluateDistribution, evaluateHandStrength, suggestBidLevel, suggestTrump } from '../../src/stats/hand-eval';
import type { Card } from '../../src/engine/types';

const c = (suit: string, rank: string): Card => ({ suit, rank } as Card);

describe('hand evaluation', () => {
  it('countHighCardPoints: A=4 K=3 Q=2 J=1', () => {
    expect(countHighCardPoints([c('spades', 'A'), c('hearts', 'K'), c('diamonds', 'Q'), c('clubs', 'J')])).toBe(10);
  });
  it('non-honors = 0 HCP', () => {
    expect(countHighCardPoints([c('spades', '2'), c('hearts', '5')])).toBe(0);
  });
  it('evaluateDistribution counts suits', () => {
    const hand = [c('spades', 'A'), c('spades', 'K'), c('spades', 'Q'), c('hearts', 'A'), c('hearts', 'K'),
      c('diamonds', 'A'), c('diamonds', 'K'), c('diamonds', 'Q'), c('clubs', 'A'), c('clubs', 'K'),
      c('clubs', 'Q'), c('clubs', 'J'), c('clubs', '10')];
    const d = evaluateDistribution(hand);
    expect(d.spades).toBe(3); expect(d.clubs).toBe(5);
  });
  it('suggestTrump picks longest suit', () => {
    const hand = [c('spades', 'A'), c('spades', 'K'), c('spades', 'Q'), c('spades', 'J'), c('spades', '10'),
      c('hearts', 'A'), c('hearts', 'K'), c('hearts', 'Q'),
      c('diamonds', 'A'), c('diamonds', 'K'),
      c('clubs', 'A'), c('clubs', 'K'), c('clubs', 'Q')];
    expect(suggestTrump(hand)).toBe('spades');
  });
  it('suggestTrump returns no-trump for balanced high-card hand', () => {
    const hand = [c('spades', 'A'), c('spades', 'K'), c('spades', 'Q'),
      c('hearts', 'A'), c('hearts', 'K'), c('hearts', 'Q'), c('hearts', 'J'),
      c('diamonds', 'A'), c('diamonds', 'K'), c('diamonds', 'Q'),
      c('clubs', 'A'), c('clubs', 'K'), c('clubs', 'Q')];
    expect(suggestTrump(hand)).toBe('no-trump');
  });
  it('suggestBidLevel: weak hand = 0', () => { expect(suggestBidLevel(5, 4)).toBe(0); });
  it('suggestBidLevel: moderate hand = 1', () => { expect(suggestBidLevel(12, 5)).toBe(1); });
  it('suggestBidLevel: strong hand >= 2', () => { expect(suggestBidLevel(20, 6)).toBeGreaterThanOrEqual(2); });
  it('evaluateHandStrength returns full evaluation', () => {
    const hand = [c('spades', 'A'), c('spades', 'K'), c('spades', 'Q'), c('spades', 'J'), c('spades', '10'),
      c('hearts', 'A'), c('hearts', 'K'), c('diamonds', 'A'), c('diamonds', '5'), c('diamonds', '3'),
      c('clubs', '9'), c('clubs', '5'), c('clubs', '2')];
    const r = evaluateHandStrength(hand);
    expect(r.hcp).toBe(21); expect(r.longestSuit).toBe('spades'); expect(typeof r.suggestedLevel).toBe('number');
  });
});
