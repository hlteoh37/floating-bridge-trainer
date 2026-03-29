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

    it('suggests legal bid higher than current bid', () => {
      const hand = [
        c('diamonds', 'A'), c('diamonds', 'K'), c('diamonds', 'Q'), c('diamonds', 'J'), c('diamonds', '10'), c('diamonds', '6'),
        c('clubs', 'A'), c('clubs', '4'),
        c('hearts', '7'), c('hearts', '10'), c('hearts', 'J'),
        c('spades', '3'), c('spades', '8'),
      ];
      // Current bid is 2 spades — coach must not suggest 1 diamonds
      const currentBid = { level: 2, trump: 'spades' as const, playerId: 'opponent' };
      const advice = getBiddingAdvice(hand, currentBid);
      expect(advice.explanation).toContain('HCP');
      // Should never suggest a bid that's not higher than 2S
      if (advice.action !== 'pass') {
        const match = advice.action.match(/^(\d)/);
        const level = match ? parseInt(match[1], 10) : 0;
        // At level 2, only NT is legal over 2S; at level 3+, anything is legal
        expect(level).toBeGreaterThanOrEqual(2);
        if (level === 2) {
          expect(advice.action).toContain('No Trump');
        }
      }
    });

    it('recommends pass when hand too weak for required bid level', () => {
      const hand = [
        c('diamonds', '10'), c('diamonds', '9'), c('diamonds', '8'), c('diamonds', '7'), c('diamonds', '6'),
        c('clubs', 'J'), c('clubs', '4'),
        c('hearts', '5'), c('hearts', '3'),
        c('spades', '4'), c('spades', '2'), c('spades', '6'), c('spades', '7'),
      ];
      // Current bid is 5 spades — hand is way too weak
      const currentBid = { level: 5, trump: 'spades' as const, playerId: 'opponent' };
      const advice = getBiddingAdvice(hand, currentBid);
      expect(advice.action).toBe('pass');
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
