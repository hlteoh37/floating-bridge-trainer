import { describe, it, expect } from 'vitest';
import { createGame, dealNewHand, getNextPlayerIndex, placeBid, passPlayer, callPartner, playCard } from '../../src/engine/game';
import type { GameState, Card } from '../../src/engine/types';

describe('game', () => {
  it('createGame creates 4 players', () => {
    const s = createGame();
    expect(s.players).toHaveLength(4);
    expect(s.players[0].position).toBe('south');
    expect(s.players[0].isHuman).toBe(true);
    expect(s.phase).toBe('dealing');
  });
  it('dealNewHand deals 13 cards each', () => {
    const s = dealNewHand(createGame());
    expect(s.phase).toBe('bidding');
    for (const p of s.players) expect(p.hand).toHaveLength(13);
  });
  it('getNextPlayerIndex wraps', () => {
    expect(getNextPlayerIndex(3)).toBe(0);
    expect(getNextPlayerIndex(0)).toBe(1);
  });
  it('placeBid works and advances', () => {
    let s = dealNewHand(createGame());
    const bid = { level: 1, trump: 'clubs' as const, playerId: s.players[s.currentPlayerIndex].id };
    s = placeBid(s, bid);
    expect(s.currentBid).toEqual(bid);
    expect(s.biddingHistory).toHaveLength(1);
  });
  it('placeBid rejects invalid', () => {
    let s = dealNewHand(createGame());
    s = placeBid(s, { level: 2, trump: 'clubs' as const, playerId: s.players[s.currentPlayerIndex].id });
    expect(() => placeBid(s, { level: 1, trump: 'hearts' as const, playerId: s.players[s.currentPlayerIndex].id })).toThrow();
  });
  it('passPlayer increments passes', () => {
    let s = dealNewHand(createGame());
    s = passPlayer(s);
    expect(s.consecutivePasses).toBe(1);
  });
  it('3 passes after bid moves to calling', () => {
    let s = dealNewHand(createGame());
    s = placeBid(s, { level: 1, trump: 'clubs' as const, playerId: s.players[0].id });
    s = passPlayer(s); s = passPlayer(s); s = passPlayer(s);
    expect(s.phase).toBe('calling');
  });
  it('4 passes redeals', () => {
    let s = dealNewHand(createGame());
    s = passPlayer(s); s = passPlayer(s); s = passPlayer(s); s = passPlayer(s);
    expect(s.phase).toBe('bidding');
  });
  it('callPartner sets contract', () => {
    let s = dealNewHand(createGame());
    s = placeBid(s, { level: 1, trump: 'hearts' as const, playerId: s.players[0].id });
    s = passPlayer(s); s = passPlayer(s); s = passPlayer(s);
    const decl = s.players.find(p => p.id === s.currentBid!.playerId)!;
    const allCards = s.players.flatMap(p => p.hand);
    const called = allCards.find(card => !decl.hand.some(h => h.suit === card.suit && h.rank === card.rank))!;
    s = callPartner(s, called);
    expect(s.phase).toBe('playing');
    expect(s.contract).not.toBeNull();
  });
  it('playCard removes from hand and adds to trick', () => {
    let s = dealNewHand(createGame());
    s = placeBid(s, { level: 1, trump: 'hearts' as const, playerId: s.players[0].id });
    s = passPlayer(s); s = passPlayer(s); s = passPlayer(s);
    const decl = s.players.find(p => p.id === s.currentBid!.playerId)!;
    const allCards = s.players.flatMap(p => p.hand);
    const called = allCards.find(card => !decl.hand.some(h => h.suit === card.suit && h.rank === card.rank))!;
    s = callPartner(s, called);
    const pi = s.currentPlayerIndex;
    const card = s.players[pi].hand[0];
    const before = s.players[pi].hand.length;
    s = playCard(s, card);
    expect(s.players[pi].hand).toHaveLength(before - 1);
    expect(s.currentTrick!.cards).toHaveLength(1);
  });
});
