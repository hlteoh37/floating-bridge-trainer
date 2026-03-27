import { describe, it, expect } from 'vitest';
import { canPlayCard, getPlayableCards, resolveTrick, createTrick } from '../../src/engine/tricks';
import type { Card, Trick } from '../../src/engine/types';

const c = (suit: string, rank: string): Card => ({ suit, rank } as Card);

describe('tricks', () => {
  it('createTrick creates empty trick', () => {
    const t = createTrick('hearts');
    expect(t.cards).toEqual([]); expect(t.ledSuit).toBe('hearts');
  });
  it('can play any card when void in led suit', () => {
    expect(canPlayCard(c('spades', 'A'), [c('spades', 'A'), c('clubs', '2')], 'hearts')).toBe(true);
  });
  it('must follow suit', () => {
    expect(canPlayCard(c('spades', 'A'), [c('hearts', 'K'), c('spades', 'A')], 'hearts')).toBe(false);
    expect(canPlayCard(c('hearts', 'K'), [c('hearts', 'K'), c('spades', 'A')], 'hearts')).toBe(true);
  });
  it('getPlayableCards filters to led suit', () => {
    expect(getPlayableCards([c('hearts', 'K'), c('hearts', '2'), c('spades', 'A')], 'hearts')).toEqual([c('hearts', 'K'), c('hearts', '2')]);
  });
  it('getPlayableCards returns all if void', () => {
    const hand = [c('spades', 'A'), c('clubs', '2')];
    expect(getPlayableCards(hand, 'hearts')).toEqual(hand);
  });
  it('highest of led suit wins (no trump)', () => {
    const trick: Trick = { ledSuit: 'hearts', winnerId: null, cards: [
      { card: c('hearts', '5'), playerId: 'p1' },
      { card: c('hearts', 'K'), playerId: 'p2' },
      { card: c('hearts', '2'), playerId: 'p3' },
      { card: c('spades', 'A'), playerId: 'p4' },
    ]};
    expect(resolveTrick(trick, 'no-trump')).toBe('p2');
  });
  it('trump beats non-trump', () => {
    const trick: Trick = { ledSuit: 'hearts', winnerId: null, cards: [
      { card: c('hearts', 'A'), playerId: 'p1' },
      { card: c('spades', '2'), playerId: 'p2' },
      { card: c('hearts', 'K'), playerId: 'p3' },
      { card: c('diamonds', 'Q'), playerId: 'p4' },
    ]};
    expect(resolveTrick(trick, 'spades')).toBe('p2');
  });
  it('highest trump wins', () => {
    const trick: Trick = { ledSuit: 'hearts', winnerId: null, cards: [
      { card: c('hearts', 'A'), playerId: 'p1' },
      { card: c('spades', '2'), playerId: 'p2' },
      { card: c('spades', 'K'), playerId: 'p3' },
      { card: c('hearts', 'Q'), playerId: 'p4' },
    ]};
    expect(resolveTrick(trick, 'spades')).toBe('p3');
  });
  it('off-suit non-trump never wins', () => {
    const trick: Trick = { ledSuit: 'hearts', winnerId: null, cards: [
      { card: c('hearts', '2'), playerId: 'p1' },
      { card: c('diamonds', 'A'), playerId: 'p2' },
      { card: c('clubs', 'A'), playerId: 'p3' },
      { card: c('hearts', '3'), playerId: 'p4' },
    ]};
    expect(resolveTrick(trick, 'no-trump')).toBe('p4');
  });
});
