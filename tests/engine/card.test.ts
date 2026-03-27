import { describe, it, expect } from 'vitest';
import type { Card, Suit, Rank } from '../../src/engine/types';
import { SUITS, RANKS, createCard, cardToString, cardEquals, compareCards, suitOrder, rankValue } from '../../src/engine/card';

describe('engine types', () => {
  it('Card type accepts valid suit and rank', () => {
    const card: Card = { suit: 'spades', rank: 'A' };
    expect(card.suit).toBe('spades');
    expect(card.rank).toBe('A');
  });

  it('Suit type covers all four suits', () => {
    const suits: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
    expect(suits).toHaveLength(4);
  });

  it('Rank type covers all 13 ranks', () => {
    const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    expect(ranks).toHaveLength(13);
  });
});

describe('card utilities', () => {
  it('SUITS contains all 4 suits in order', () => { expect(SUITS).toEqual(['clubs', 'diamonds', 'hearts', 'spades']); });
  it('RANKS contains all 13 ranks in order', () => { expect(RANKS).toEqual(['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']); });
  it('createCard returns a Card object', () => { expect(createCard('hearts', 'A')).toEqual({ suit: 'hearts', rank: 'A' }); });
  it('cardToString formats card', () => {
    expect(cardToString({ suit: 'spades', rank: 'K' })).toBe('K♠');
    expect(cardToString({ suit: 'hearts', rank: '10' })).toBe('10♥');
    expect(cardToString({ suit: 'diamonds', rank: 'A' })).toBe('A♦');
    expect(cardToString({ suit: 'clubs', rank: '2' })).toBe('2♣');
  });
  it('cardEquals compares two cards', () => {
    expect(cardEquals(createCard('hearts', 'A'), createCard('hearts', 'A'))).toBe(true);
    expect(cardEquals(createCard('hearts', 'A'), createCard('spades', 'A'))).toBe(false);
  });
  it('rankValue returns correct numeric values', () => {
    expect(rankValue('2')).toBe(2); expect(rankValue('A')).toBe(14);
  });
  it('suitOrder returns correct ordering', () => {
    expect(suitOrder('clubs')).toBe(0); expect(suitOrder('spades')).toBe(3);
  });
  it('compareCards sorts by suit then rank', () => {
    expect(compareCards(createCard('spades', 'A'), createCard('spades', 'K'))).toBeGreaterThan(0);
    expect(compareCards(createCard('clubs', 'A'), createCard('spades', 'A'))).toBeLessThan(0);
  });
});
