import { describe, it, expect } from 'vitest';
import type { Card, Suit, Rank } from '../../src/engine/types';

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
