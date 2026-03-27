import { describe, it, expect } from 'vitest';
import { getBiddingAdvice, getPlayAdvice, getCallingAdvice } from '../../src/stats/coaching';
import type { Card, Trick } from '../../src/engine/types';

const c = (suit: string, rank: string): Card => ({ suit: suit as Card['suit'], rank: rank as Card['rank'] });

describe('coaching', () => {
  describe('getBiddingAdvice', () => {
    it('recommends pass for weak hand', () => {
      const hand = [
        c('spades', '2'), c('spades', '3'),
        c('hearts', '4'), c('hearts', '5'), c('hearts', '6'),
        c('diamonds', '2'), c('diamonds', '3'), c('diamonds', '4'),
        c('clubs', '2'), c('clubs', '3'), c('clubs', '4'), c('clubs', '5'), c('clubs', '6'),
      ];
      const advice = getBiddingAdvice(hand, null);
      expect(advice.action).toBe('pass');
      expect(advice.explanation).toBeTruthy();
    });

    it('recommends bid for strong hand', () => {
      const hand = [
        c('spades', 'A'), c('spades', 'K'), c('spades', 'Q'), c('spades', 'J'), c('spades', '10'),
        c('hearts', 'A'), c('hearts', 'K'),
        c('diamonds', 'A'), c('diamonds', '5'), c('diamonds', '3'),
        c('clubs', '9'), c('clubs', '5'), c('clubs', '2'),
      ];
      const advice = getBiddingAdvice(hand, null);
      expect(advice.action).not.toBe('pass');
      expect(advice.explanation).toContain('HCP');
    });
  });

  describe('getCallingAdvice', () => {
    it('suggests calling ace of short suit', () => {
      const hand = [
        c('spades', 'A'), c('spades', 'K'), c('spades', 'Q'), c('spades', 'J'), c('spades', '10'),
        c('hearts', 'A'), c('hearts', 'K'),
        c('diamonds', '5'), c('diamonds', '3'),
        c('clubs', '9'), c('clubs', '5'), c('clubs', '2'), c('clubs', '3'),
      ];
      const advice = getCallingAdvice(hand, 'spades');
      expect(advice.action).toBeTruthy();
      expect(advice.explanation).toBeTruthy();
    });
  });

  describe('getPlayAdvice', () => {
    it('returns advice for card play', () => {
      const hand = [c('hearts', 'K'), c('hearts', '2'), c('spades', 'A')];
      const trick: Trick = {
        ledSuit: 'hearts',
        winnerId: null,
        cards: [{ card: c('hearts', 'Q'), playerId: 'p1' }],
      };
      const advice = getPlayAdvice(hand, trick, 'spades', []);
      expect(advice.action).toBeTruthy();
      expect(advice.explanation).toBeTruthy();
    });
  });
});
