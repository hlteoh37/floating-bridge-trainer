import type { Card, Suit, Trick } from '../engine/types.ts';
import { SUITS, RANKS, cardEquals } from '../engine/card.ts';

export interface CardTracker {
  unseenCards: Card[];
  playedCards: Card[];
  recordTrick: (trick: Trick) => void;
  countRemainingInSuit: (suit: Suit) => number;
  isCardPlayed: (card: Card) => boolean;
}

export function createCardTracker(ownHand: Card[]): CardTracker {
  const allCards: Card[] = [];
  for (const suit of SUITS) { for (const rank of RANKS) { allCards.push({ suit, rank }); } }

  let unseenCards = allCards.filter(c => !ownHand.some(h => cardEquals(h, c)));
  const playedCards: Card[] = [];

  return {
    get unseenCards() { return unseenCards; },
    get playedCards() { return playedCards; },
    recordTrick(trick: Trick) {
      for (const tc of trick.cards) {
        playedCards.push(tc.card);
        unseenCards = unseenCards.filter(c => !cardEquals(c, tc.card));
      }
    },
    countRemainingInSuit(suit: Suit): number { return unseenCards.filter(c => c.suit === suit).length; },
    isCardPlayed(card: Card): boolean { return playedCards.some(c => cardEquals(c, card)); },
  };
}
