import type { GameState, Player, Card, Bid, Trick, Contract, Position } from './types.ts';
import { createDeck, shuffleDeck, dealHands } from './deck.ts';
import { isValidBid, isBiddingComplete } from './bidding.ts';
import { canPlayCard, resolveTrick } from './tricks.ts';
import { isCalledCardValid, resolveContract } from './contract.ts';
import { cardEquals } from './card.ts';

const POSITIONS: Position[] = ['south', 'west', 'north', 'east'];

export function createGame(): GameState {
  const players: Player[] = POSITIONS.map((position, i) => ({
    id: `player-${i}`, name: position.charAt(0).toUpperCase() + position.slice(1),
    position, hand: [], tricksWon: 0, isHuman: i === 0,
  }));
  return {
    phase: 'dealing', players, currentPlayerIndex: 0, biddingHistory: [],
    consecutivePasses: 0, currentBid: null, contract: null, tricks: [],
    currentTrick: null, trickNumber: 1, declarerTeamTricks: 0, defenderTeamTricks: 0, handResult: null,
  };
}

export function dealNewHand(state: GameState): GameState {
  const deck = shuffleDeck(createDeck());
  const hands = dealHands(deck);
  const players = state.players.map((p, i) => ({ ...p, hand: hands[i], tricksWon: 0 }));
  return {
    ...state, phase: 'bidding', players, currentPlayerIndex: 0, biddingHistory: [],
    consecutivePasses: 0, currentBid: null, contract: null, tricks: [],
    currentTrick: null, trickNumber: 1, declarerTeamTricks: 0, defenderTeamTricks: 0, handResult: null,
  };
}

export function getNextPlayerIndex(current: number): number { return (current + 1) % 4; }

export function placeBid(state: GameState, bid: Bid): GameState {
  if (!isValidBid(bid, state.currentBid)) throw new Error(`Invalid bid: ${bid.level} ${bid.trump}`);
  return {
    ...state, currentBid: bid, biddingHistory: [...state.biddingHistory, bid],
    consecutivePasses: 0, currentPlayerIndex: getNextPlayerIndex(state.currentPlayerIndex),
  };
}

export function passPlayer(state: GameState): GameState {
  const newPasses = state.consecutivePasses + 1;
  const hasBid = state.currentBid !== null;
  if (isBiddingComplete(newPasses, hasBid)) {
    if (!hasBid) return dealNewHand({ ...state, consecutivePasses: newPasses });
    const declarerIdx = state.players.findIndex(p => p.id === state.currentBid!.playerId);
    return { ...state, phase: 'calling', consecutivePasses: newPasses, currentPlayerIndex: declarerIdx };
  }
  return { ...state, consecutivePasses: newPasses, currentPlayerIndex: getNextPlayerIndex(state.currentPlayerIndex) };
}

export function callPartner(state: GameState, calledCard: Card): GameState {
  const declarer = state.players[state.currentPlayerIndex];
  if (!isCalledCardValid(calledCard, declarer.hand)) throw new Error('Cannot call a card you hold');
  const contract: Contract = { bid: state.currentBid!, declarerId: declarer.id, calledCard, partnerId: null };
  const leadPlayerIdx = getNextPlayerIndex(state.currentPlayerIndex);
  return {
    ...state, phase: 'playing', contract, currentPlayerIndex: leadPlayerIdx,
    currentTrick: { cards: [], ledSuit: null as unknown as Card['suit'], winnerId: null },
  };
}

export function playCard(state: GameState, card: Card): GameState {
  const playerIdx = state.currentPlayerIndex;
  const player = state.players[playerIdx];
  const trick = state.currentTrick!;
  const ledSuit = trick.cards.length === 0 ? null : trick.ledSuit;

  if (!canPlayCard(card, player.hand, ledSuit)) throw new Error('Cannot play that card — must follow suit');

  const newHand = player.hand.filter(c => !cardEquals(c, card));
  const newPlayers = state.players.map((p, i) => i === playerIdx ? { ...p, hand: newHand } : p);
  const newLedSuit = trick.cards.length === 0 ? card.suit : trick.ledSuit;
  const newTrickCards = [...trick.cards, { card, playerId: player.id }];

  let contract = state.contract!;
  if (cardEquals(card, contract.calledCard) && contract.partnerId === null) {
    contract = { ...contract, partnerId: player.id };
  }

  if (newTrickCards.length === 4) {
    const completeTrick: Trick = { cards: newTrickCards, ledSuit: newLedSuit, winnerId: null };
    const winnerId = resolveTrick(completeTrick, contract.bid.trump);
    completeTrick.winnerId = winnerId;

    const isDeclarerTeam = winnerId === contract.declarerId || winnerId === contract.partnerId;
    const newDeclarerTricks = state.declarerTeamTricks + (isDeclarerTeam ? 1 : 0);
    const newDefenderTricks = state.defenderTeamTricks + (isDeclarerTeam ? 0 : 1);
    const updatedPlayers = newPlayers.map(p => p.id === winnerId ? { ...p, tricksWon: p.tricksWon + 1 } : p);
    const newTrickNumber = state.trickNumber + 1;

    if (newTrickNumber > 13) {
      return {
        ...state, phase: 'complete', players: updatedPlayers, contract,
        tricks: [...state.tricks, completeTrick], currentTrick: null, trickNumber: newTrickNumber,
        declarerTeamTricks: newDeclarerTricks, defenderTeamTricks: newDefenderTricks,
        handResult: resolveContract(contract.bid.level, newDeclarerTricks, contract.declarerId, contract.partnerId),
      };
    }

    const winnerIdx = updatedPlayers.findIndex(p => p.id === winnerId);
    return {
      ...state, players: updatedPlayers, contract,
      tricks: [...state.tricks, completeTrick],
      currentTrick: { cards: [], ledSuit: null as unknown as Card['suit'], winnerId: null },
      currentPlayerIndex: winnerIdx, trickNumber: newTrickNumber,
      declarerTeamTricks: newDeclarerTricks, defenderTeamTricks: newDefenderTricks,
    };
  }

  return {
    ...state, players: newPlayers, contract,
    currentTrick: { cards: newTrickCards, ledSuit: newLedSuit, winnerId: null },
    currentPlayerIndex: getNextPlayerIndex(playerIdx),
  };
}
