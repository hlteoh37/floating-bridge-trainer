import type { Card, Trick, Contract } from '../engine/types.ts';
import type { AIConfig } from './types.ts';
import type { CardTracker } from './inference.ts';
import { RANK_VALUES } from '../engine/card.ts';
import { getPlayableCards } from '../engine/tricks.ts';

export function makeAIPlayDecision(hand: Card[], trick: Trick, contract: Contract, config: AIConfig, tracker: CardTracker, playerId: string): Card {
  const isLeading = trick.cards.length === 0;
  const ledSuit = isLeading ? null : trick.ledSuit;
  const playable = getPlayableCards(hand, ledSuit);
  const trump = contract.bid.trump;

  if (playable.length === 1) return playable[0];
  if (Math.random() < config.noiseLevel) return playable[Math.floor(Math.random() * playable.length)];

  if (isLeading) return chooseLead(playable, hand, trump, config);
  return chooseFollow(playable, trick, trump, config);
}

function chooseLead(playable: Card[], hand: Card[], trump: string, config: AIConfig): Card {
  if (trump !== 'no-trump' && Math.random() < config.archetype.trumpLeadPreference) {
    const trumpCards = playable.filter(c => c.suit === trump);
    if (trumpCards.length > 0) return trumpCards.sort((a, b) => RANK_VALUES[b.rank] - RANK_VALUES[a.rank])[0];
  }
  const suitStrength = new Map<string, number>();
  for (const card of hand) suitStrength.set(card.suit, (suitStrength.get(card.suit) ?? 0) + RANK_VALUES[card.rank]);
  return [...playable].sort((a, b) => {
    const diff = (suitStrength.get(b.suit) ?? 0) - (suitStrength.get(a.suit) ?? 0);
    return diff !== 0 ? diff : RANK_VALUES[b.rank] - RANK_VALUES[a.rank];
  })[0];
}

function chooseFollow(playable: Card[], trick: Trick, trump: string, config: AIConfig): Card {
  const { ledSuit, cards } = trick;
  const isFollowingSuit = playable[0].suit === ledSuit;

  let winningRank = 0;
  let winnerIsTrump = false;
  for (const tc of cards) {
    const isTrump = trump !== 'no-trump' && tc.card.suit === trump;
    if (isTrump && !winnerIsTrump) { winningRank = RANK_VALUES[tc.card.rank]; winnerIsTrump = true; }
    else if (isTrump && winnerIsTrump && RANK_VALUES[tc.card.rank] > winningRank) { winningRank = RANK_VALUES[tc.card.rank]; }
    else if (!winnerIsTrump && tc.card.suit === ledSuit && RANK_VALUES[tc.card.rank] > winningRank) { winningRank = RANK_VALUES[tc.card.rank]; }
  }

  if (isFollowingSuit) {
    const winners = playable.filter(c => !winnerIsTrump && RANK_VALUES[c.rank] > winningRank);
    if (winners.length > 0) {
      winners.sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank]);
      return config.archetype.riskTolerance > 0.5 ? winners[winners.length - 1] : winners[0];
    }
    return playable.sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank])[0];
  }

  if (trump !== 'no-trump') {
    const trumpCards = playable.filter(c => c.suit === trump);
    if (trumpCards.length > 0 && Math.random() < config.archetype.riskTolerance) {
      if (winnerIsTrump) {
        const beating = trumpCards.filter(c => RANK_VALUES[c.rank] > winningRank);
        if (beating.length > 0) return beating.sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank])[0];
      } else {
        return trumpCards.sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank])[0];
      }
    }
  }

  return playable.sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank])[0];
}
