import type { Card, Suit, TrumpChoice } from '../engine/types.ts';
import type { HandEvaluation } from './types.ts';
import { HIGH_CARD_POINTS, BID_THRESHOLDS } from '../data/hand-strength.ts';

export function countHighCardPoints(hand: Card[]): number {
  return hand.reduce((sum, card) => sum + (HIGH_CARD_POINTS[card.rank] ?? 0), 0);
}

export function evaluateDistribution(hand: Card[]): Record<Suit, number> {
  const dist: Record<Suit, number> = { clubs: 0, diamonds: 0, hearts: 0, spades: 0 };
  for (const card of hand) { dist[card.suit]++; }
  return dist;
}

export function suggestTrump(hand: Card[]): TrumpChoice {
  const dist = evaluateDistribution(hand);
  const suits: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
  let longestSuit: Suit = 'clubs';
  let longestLength = 0;
  for (const suit of suits) {
    if (dist[suit] > longestLength) { longestLength = dist[suit]; longestSuit = suit; }
  }
  const isBalanced = suits.every(s => dist[s] >= 2 && dist[s] <= 4);
  if (isBalanced && countHighCardPoints(hand) >= 15) return 'no-trump';
  return longestSuit;
}

export function suggestBidLevel(hcp: number, longestSuitLength: number): number {
  const distribPoints = Math.max(0, longestSuitLength - 4);
  const totalStrength = hcp + distribPoints;
  let suggestedLevel = 0;
  for (let level = 7; level >= 1; level--) {
    if (totalStrength >= BID_THRESHOLDS[level].minStrength) { suggestedLevel = level; break; }
  }
  return suggestedLevel;
}

export function evaluateHandStrength(hand: Card[]): HandEvaluation {
  const hcp = countHighCardPoints(hand);
  const distribution = evaluateDistribution(hand);
  const suits: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
  let longestSuit: Suit = 'clubs';
  let longestSuitLength = 0;
  for (const suit of suits) {
    if (distribution[suit] > longestSuitLength) { longestSuitLength = distribution[suit]; longestSuit = suit; }
  }
  const suggestedTrump = suggestTrump(hand);
  const distribPoints = Math.max(0, longestSuitLength - 4);
  const totalStrength = hcp + distribPoints;
  const suggestedLevel = suggestBidLevel(hcp, longestSuitLength);
  return { hcp, distribution, longestSuit, longestSuitLength, suggestedTrump, suggestedLevel, totalStrength };
}
