import type { TrumpChoice, Suit } from '../engine/types.ts';

export interface HandEvaluation {
  hcp: number;
  distribution: Record<Suit, number>;
  longestSuit: Suit;
  longestSuitLength: number;
  suggestedTrump: TrumpChoice;
  suggestedLevel: number;
  totalStrength: number;
}

export type DrillType = 'bidding' | 'trick-taking' | 'partner-calling' | 'card-counting';

export interface DrillResult {
  type: DrillType;
  correct: boolean;
  timestamp: number;
}

export interface HandRecord {
  declarerId: string;
  partnerId: string | null;
  made: boolean;
  bidLevel: number;
  trump: TrumpChoice;
  wasDefender: boolean;
  timestamp: number;
}

export interface CoachingAdvice {
  action: string;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
}
