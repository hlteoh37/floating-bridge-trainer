import { describe, it, expect } from 'vitest';
import { isHigherBid, isValidBid, isBiddingComplete, TRUMP_ORDER } from '../../src/engine/bidding';
import type { Bid } from '../../src/engine/types';

describe('bidding', () => {
  it('TRUMP_ORDER orders correctly', () => {
    expect(TRUMP_ORDER['clubs']).toBe(0);
    expect(TRUMP_ORDER['no-trump']).toBe(4);
  });
  it('higher level is always higher', () => {
    const low: Bid = { level: 1, trump: 'spades', playerId: 'p1' };
    const high: Bid = { level: 2, trump: 'clubs', playerId: 'p2' };
    expect(isHigherBid(high, low)).toBe(true);
    expect(isHigherBid(low, high)).toBe(false);
  });
  it('same level, higher trump wins', () => {
    expect(isHigherBid({ level: 1, trump: 'spades', playerId: 'p1' }, { level: 1, trump: 'hearts', playerId: 'p2' })).toBe(true);
  });
  it('same bid is not higher', () => {
    const bid: Bid = { level: 2, trump: 'hearts', playerId: 'p1' };
    expect(isHigherBid(bid, bid)).toBe(false);
  });
  it('any bid valid when no current bid', () => {
    expect(isValidBid({ level: 1, trump: 'clubs', playerId: 'p1' }, null)).toBe(true);
  });
  it('rejects lower bid', () => {
    expect(isValidBid({ level: 2, trump: 'clubs', playerId: 'p2' }, { level: 2, trump: 'hearts', playerId: 'p1' })).toBe(false);
  });
  it('rejects out of range', () => {
    expect(isValidBid({ level: 0, trump: 'clubs', playerId: 'p1' }, null)).toBe(false);
    expect(isValidBid({ level: 8, trump: 'clubs', playerId: 'p1' }, null)).toBe(false);
  });
  it('3 passes after bid = complete', () => { expect(isBiddingComplete(3, true)).toBe(true); });
  it('2 passes after bid = not complete', () => { expect(isBiddingComplete(2, true)).toBe(false); });
  it('3 passes no bid = not complete', () => { expect(isBiddingComplete(3, false)).toBe(false); });
  it('4 passes no bid = redeal', () => { expect(isBiddingComplete(4, false)).toBe(true); });
});
