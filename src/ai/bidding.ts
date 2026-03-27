import type { Card, Bid } from '../engine/types.ts';
import type { AIConfig } from './types.ts';
import { evaluateHandStrength } from '../stats/hand-eval.ts';
import { isValidBid } from '../engine/bidding.ts';

export function makeAIBidDecision(hand: Card[], currentBid: Bid | null, config: AIConfig, playerId: string): Bid | null {
  const evaluation = evaluateHandStrength(hand);
  const noise = (Math.random() - 0.5) * 2 * config.noiseLevel;
  const aggAdjust = (config.archetype.bidAggressiveness - 0.5) * 2;
  const adjustedStrength = evaluation.totalStrength + aggAdjust * 4 + noise * 4;

  let targetLevel = 0;
  if (adjustedStrength >= 34) targetLevel = 7;
  else if (adjustedStrength >= 30) targetLevel = 6;
  else if (adjustedStrength >= 26) targetLevel = 5;
  else if (adjustedStrength >= 22) targetLevel = 4;
  else if (adjustedStrength >= 18) targetLevel = 3;
  else if (adjustedStrength >= 14) targetLevel = 2;
  else if (adjustedStrength >= 10) targetLevel = 1;

  if (targetLevel === 0) return null;
  const trump = evaluation.suggestedTrump;

  if (currentBid !== null) {
    let bid: Bid = { level: targetLevel, trump, playerId };
    if (isValidBid(bid, currentBid)) return bid;
    bid = { level: targetLevel + 1, trump, playerId };
    if (targetLevel + 1 <= 7 && isValidBid(bid, currentBid)) {
      if (Math.random() < config.archetype.riskTolerance) return bid;
    }
    return null;
  }

  return { level: targetLevel, trump, playerId };
}
