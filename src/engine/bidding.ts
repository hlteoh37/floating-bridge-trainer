import type { Bid, TrumpChoice } from './types.ts';

export const TRUMP_ORDER: Record<TrumpChoice, number> = {
  'clubs': 0, 'diamonds': 1, 'hearts': 2, 'spades': 3, 'no-trump': 4,
};

export function isHigherBid(newBid: Bid, currentBid: Bid): boolean {
  if (newBid.level > currentBid.level) return true;
  if (newBid.level < currentBid.level) return false;
  return TRUMP_ORDER[newBid.trump] > TRUMP_ORDER[currentBid.trump];
}

export function isValidBid(bid: Bid, currentBid: Bid | null): boolean {
  if (bid.level < 1 || bid.level > 7) return false;
  if (currentBid === null) return true;
  return isHigherBid(bid, currentBid);
}

export function isBiddingComplete(consecutivePasses: number, hasBidBeenMade: boolean): boolean {
  if (hasBidBeenMade && consecutivePasses >= 3) return true;
  if (!hasBidBeenMade && consecutivePasses >= 4) return true;
  return false;
}
