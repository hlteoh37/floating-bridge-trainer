import type { Card, Trick, Suit, TrumpChoice } from './types.ts';
import { RANK_VALUES } from './card.ts';

export function createTrick(ledSuit: Suit | null): Trick {
  return { cards: [], ledSuit: ledSuit as Suit, winnerId: null };
}

export function canPlayCard(card: Card, hand: Card[], ledSuit: Suit | null): boolean {
  if (ledSuit === null) return true;
  const hasLedSuit = hand.some(c => c.suit === ledSuit);
  if (!hasLedSuit) return true;
  return card.suit === ledSuit;
}

export function getPlayableCards(hand: Card[], ledSuit: Suit | null): Card[] {
  if (ledSuit === null) return hand;
  const suitCards = hand.filter(c => c.suit === ledSuit);
  return suitCards.length > 0 ? suitCards : hand;
}

export function resolveTrick(trick: Trick, trump: TrumpChoice): string {
  const { cards, ledSuit } = trick;
  let winnerId = cards[0].playerId;
  let winningCard = cards[0].card;
  let winnerIsTrump = trump !== 'no-trump' && winningCard.suit === trump;

  for (let i = 1; i < cards.length; i++) {
    const { card, playerId } = cards[i];
    const isTrump = trump !== 'no-trump' && card.suit === trump;

    if (winnerIsTrump) {
      if (isTrump && RANK_VALUES[card.rank] > RANK_VALUES[winningCard.rank]) {
        winnerId = playerId; winningCard = card;
      }
    } else {
      if (isTrump) {
        winnerId = playerId; winningCard = card; winnerIsTrump = true;
      } else if (card.suit === ledSuit && RANK_VALUES[card.rank] > RANK_VALUES[winningCard.rank]) {
        winnerId = playerId; winningCard = card;
      }
    }
  }
  return winnerId;
}
