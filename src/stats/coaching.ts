import type { Card, Bid, Trick, TrumpChoice, Suit } from '../engine/types.ts';
import type { CoachingAdvice } from './types.ts';
import { evaluateHandStrength } from './hand-eval.ts';
import { isValidBid } from '../engine/bidding.ts';
import { getPlayableCards } from '../engine/tricks.ts';
import { RANK_VALUES, cardToString } from '../engine/card.ts';

export function getBiddingAdvice(hand: Card[], currentBid: Bid | null): CoachingAdvice {
  const evaluation = evaluateHandStrength(hand);
  const hcp = evaluation.hcp;

  if (evaluation.suggestedLevel === 0) {
    return {
      action: 'pass',
      explanation: `Your hand has ${hcp} HCP — too weak to bid. You need around 10+ HCP with a good suit to open.`,
      confidence: 'high',
    };
  }

  // Find the lowest legal bid at or above the suggested trump
  const preferredTrump = evaluation.suggestedTrump;
  const trumpLabel = (t: TrumpChoice) => t === 'no-trump' ? 'No Trump' : t;

  // Try preferred trump at suggested level first, then increase level until legal
  const trumpsToTry: TrumpChoice[] = [preferredTrump, 'no-trump', 'spades', 'hearts', 'diamonds', 'clubs']
    .filter((t, i, arr) => arr.indexOf(t) === i) as TrumpChoice[]; // deduplicate

  for (let level = evaluation.suggestedLevel; level <= 7; level++) {
    for (const trump of trumpsToTry) {
      const candidate: Bid = { level, trump, playerId: '' };
      if (isValidBid(candidate, currentBid)) {
        // Check if this bid level is reasonable for our hand strength
        if (level <= evaluation.suggestedLevel + 1) {
          return {
            action: `${level} ${trumpLabel(trump)}`,
            explanation: `${hcp} HCP with ${evaluation.longestSuitLength}-card ${evaluation.longestSuit} suit. Total strength: ${evaluation.totalStrength}. Suggest bidding ${level} ${trumpLabel(trump)}.`,
            confidence: hcp >= 14 && level === evaluation.suggestedLevel ? 'high' : 'medium',
          };
        }
        // Bid would be too high for our hand — recommend pass
        return {
          action: 'pass',
          explanation: `Your hand has ${hcp} HCP (strength ${evaluation.totalStrength}), but the lowest legal bid is ${level} ${trumpLabel(trump)} — too high for your hand. Better to pass.`,
          confidence: 'high',
        };
      }
    }
  }

  // No legal bid possible (shouldn't happen, but defensive)
  return {
    action: 'pass',
    explanation: `Your hand has ${hcp} HCP but no legal bid is available. Pass.`,
    confidence: 'high',
  };
}

export function getCallingAdvice(hand: Card[], trump: TrumpChoice): CoachingAdvice {
  const suits: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
  const suitCounts: Record<Suit, number> = { clubs: 0, diamonds: 0, hearts: 0, spades: 0 };
  for (const card of hand) {
    suitCounts[card.suit]++;
  }

  const candidateSuits = suits
    .filter(s => trump === 'no-trump' || s !== trump)
    .sort((a, b) => suitCounts[a] - suitCounts[b]);

  const weakestSuit = candidateSuits[0];
  const hasAce = hand.some(c => c.suit === weakestSuit && c.rank === 'A');

  if (!hasAce) {
    const suitSymbol = weakestSuit === 'clubs' ? '♣' : weakestSuit === 'diamonds' ? '♦' : weakestSuit === 'hearts' ? '♥' : '♠';
    return {
      action: `Call A${suitSymbol}`,
      explanation: `Your ${weakestSuit} is weakest (${suitCounts[weakestSuit]} cards). Calling the Ace there gives your partner a chance to help where you need it most.`,
      confidence: 'high',
    };
  }

  const nextSuit = candidateSuits[1] ?? candidateSuits[0];
  const suitSymbol = nextSuit === 'clubs' ? '♣' : nextSuit === 'diamonds' ? '♦' : nextSuit === 'hearts' ? '♥' : '♠';
  return {
    action: `Call A${suitSymbol}`,
    explanation: `You hold the Ace of ${weakestSuit}, so try calling the Ace of ${nextSuit} (${suitCounts[nextSuit]} cards) to get help there.`,
    confidence: 'medium',
  };
}

export function getPlayAdvice(hand: Card[], trick: Trick, trump: TrumpChoice, _previousTricks: Trick[]): CoachingAdvice {
  const isLeading = trick.cards.length === 0;
  const ledSuit = isLeading ? null : trick.ledSuit;
  const playable = getPlayableCards(hand, ledSuit);

  if (playable.length === 1) {
    return {
      action: `Play ${cardToString(playable[0])}`,
      explanation: 'Only one legal play.',
      confidence: 'high',
    };
  }

  if (isLeading) {
    const suitStrengths = new Map<Suit, number>();
    for (const card of hand) {
      suitStrengths.set(card.suit, (suitStrengths.get(card.suit) ?? 0) + RANK_VALUES[card.rank]);
    }

    const best = [...playable].sort((a, b) => {
      const aStr = suitStrengths.get(a.suit) ?? 0;
      const bStr = suitStrengths.get(b.suit) ?? 0;
      if (bStr !== aStr) return bStr - aStr;
      return RANK_VALUES[b.rank] - RANK_VALUES[a.rank];
    })[0];

    return {
      action: `Lead ${cardToString(best)}`,
      explanation: `Lead from your strongest suit. ${best.suit} has the most combined strength in your hand.`,
      confidence: 'medium',
    };
  }

  // Determine the current winning rank and whether it's a trump
  let winningRank = 0;
  let winnerIsTrump = false;
  for (const tc of trick.cards) {
    const isTrump = trump !== 'no-trump' && tc.card.suit === trump;
    if (isTrump && !winnerIsTrump) {
      winningRank = RANK_VALUES[tc.card.rank];
      winnerIsTrump = true;
    } else if ((isTrump && winnerIsTrump) || (!winnerIsTrump && tc.card.suit === ledSuit)) {
      if (RANK_VALUES[tc.card.rank] > winningRank) {
        winningRank = RANK_VALUES[tc.card.rank];
        if (isTrump) winnerIsTrump = true;
      }
    }
  }

  const canWinWith = (c: Card): boolean => {
    if (winnerIsTrump) {
      return trump !== 'no-trump' && c.suit === trump && RANK_VALUES[c.rank] > winningRank;
    }
    if (c.suit === ledSuit) return RANK_VALUES[c.rank] > winningRank;
    if (trump !== 'no-trump' && c.suit === trump) return true;
    return false;
  };

  const winningCards = playable.filter(canWinWith).sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank]);

  if (winningCards.length > 0) {
    const suggested = winningCards[0];
    return {
      action: `Play ${cardToString(suggested)}`,
      explanation: `You can win this trick. Play ${cardToString(suggested)} — the lowest card that wins, saving your higher cards.`,
      confidence: 'high',
    };
  }

  const lowest = [...playable].sort((a, b) => RANK_VALUES[a.rank] - RANK_VALUES[b.rank])[0];
  return {
    action: `Play ${cardToString(lowest)}`,
    explanation: `You can't win this trick. Play ${cardToString(lowest)} to save your stronger cards for later.`,
    confidence: 'medium',
  };
}
