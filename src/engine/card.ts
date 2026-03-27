import type { Card, Suit, Rank } from './types.ts';

export const SUITS: readonly Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'] as const;
export const RANKS: readonly Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

export const SUIT_ORDER: Record<Suit, number> = { clubs: 0, diamonds: 1, hearts: 2, spades: 3 };
export const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

const SUIT_SYMBOLS: Record<Suit, string> = { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠' };

export function createCard(suit: Suit, rank: Rank): Card { return { suit, rank }; }
export function cardToString(card: Card): string { return `${card.rank}${SUIT_SYMBOLS[card.suit]}`; }
export function cardEquals(a: Card, b: Card): boolean { return a.suit === b.suit && a.rank === b.rank; }
export function rankValue(rank: Rank): number { return RANK_VALUES[rank]; }
export function suitOrder(suit: Suit): number { return SUIT_ORDER[suit]; }
export function compareCards(a: Card, b: Card): number {
  const suitDiff = SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
  if (suitDiff !== 0) return suitDiff;
  return RANK_VALUES[a.rank] - RANK_VALUES[b.rank];
}
