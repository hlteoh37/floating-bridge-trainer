import type { Card } from './types.ts';
import { SUITS, RANKS } from './card.ts';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) { for (const rank of RANKS) { deck.push({ suit, rank }); } }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealHands(deck: Card[]): [Card[], Card[], Card[], Card[]] {
  return [deck.slice(0, 13), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];
}
