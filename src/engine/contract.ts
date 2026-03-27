import type { Card, HandResult } from './types.ts';
import { cardEquals } from './card.ts';

export function tricksNeeded(bidLevel: number): number { return 6 + bidLevel; }

export function resolveContract(bidLevel: number, declarerTeamTricks: number, declarerId: string, partnerId: string | null): HandResult {
  const needed = tricksNeeded(bidLevel);
  return { made: declarerTeamTricks >= needed, tricksNeeded: needed, tricksTaken: declarerTeamTricks, declarerId, partnerId };
}

export function isCalledCardValid(calledCard: Card, declarerHand: Card[]): boolean {
  return !declarerHand.some(c => cardEquals(c, calledCard));
}
