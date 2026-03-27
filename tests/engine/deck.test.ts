import { describe, it, expect } from 'vitest';
import { createDeck, shuffleDeck, dealHands } from '../../src/engine/deck';

describe('deck', () => {
  it('createDeck returns 52 unique cards', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map(c => `${c.rank}-${c.suit}`)).size).toBe(52);
  });
  it('shuffleDeck returns a new array with same cards', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toHaveLength(52);
    expect(shuffled).not.toBe(deck);
  });
  it('dealHands splits deck into 4 hands of 13', () => {
    const hands = dealHands(shuffleDeck(createDeck()));
    expect(hands).toHaveLength(4);
    for (const h of hands) expect(h).toHaveLength(13);
    expect(hands.flat()).toHaveLength(52);
  });
});
