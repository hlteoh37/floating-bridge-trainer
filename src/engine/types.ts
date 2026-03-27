// ── Card types ──
export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type TrumpChoice = Suit | 'no-trump';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type Position = 'south' | 'west' | 'north' | 'east';

export interface Player {
  id: string;
  name: string;
  position: Position;
  hand: Card[];
  tricksWon: number;
  isHuman: boolean;
}

export interface Bid {
  level: number;
  trump: TrumpChoice;
  playerId: string;
}

export interface Contract {
  bid: Bid;
  declarerId: string;
  calledCard: Card;
  partnerId: string | null;
}

export interface TrickCard {
  card: Card;
  playerId: string;
}

export interface Trick {
  cards: TrickCard[];
  ledSuit: Suit;
  winnerId: string | null;
}

export type GamePhase = 'dealing' | 'bidding' | 'calling' | 'playing' | 'complete';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  biddingHistory: Bid[];
  consecutivePasses: number;
  currentBid: Bid | null;
  contract: Contract | null;
  tricks: Trick[];
  currentTrick: Trick | null;
  trickNumber: number;
  declarerTeamTricks: number;
  defenderTeamTricks: number;
  handResult: HandResult | null;
}

export interface HandResult {
  made: boolean;
  tricksNeeded: number;
  tricksTaken: number;
  declarerId: string;
  partnerId: string | null;
}
