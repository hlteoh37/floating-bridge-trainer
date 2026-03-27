import { describe, it, expect } from 'vitest';
import { makeAICallDecision } from '../../src/ai/calling';
import { createAIConfig } from '../../src/ai/archetypes';
import type { Card } from '../../src/engine/types';
import { cardEquals } from '../../src/engine/card';

const c = (suit: string, rank: string): Card => ({ suit, rank } as Card);

describe('AI partner calling', () => {
  it('calls a card not in hand', () => {
    const hand = [c('spades','A'),c('spades','K'),c('spades','Q'),c('hearts','2'),c('hearts','3'),
      c('hearts','4'),c('hearts','5'),c('diamonds','A'),c('diamonds','K'),c('clubs','9'),
      c('clubs','5'),c('clubs','2'),c('clubs','3')];
    const called = makeAICallDecision(hand, 'spades', createAIConfig('balanced', 'intermediate'));
    expect(hand.some(h => cardEquals(h, called))).toBe(false);
  });
  it('tends to call high cards', () => {
    const hand = [c('spades','A'),c('spades','K'),c('spades','Q'),c('spades','J'),c('spades','10'),
      c('hearts','A'),c('hearts','K'),c('diamonds','5'),c('diamonds','3'),c('clubs','9'),
      c('clubs','5'),c('clubs','2'),c('clubs','3')];
    let aceCount = 0;
    for (let i = 0; i < 30; i++) {
      if (makeAICallDecision(hand, 'spades', createAIConfig('balanced', 'advanced')).rank === 'A') aceCount++;
    }
    expect(aceCount).toBeGreaterThan(10);
  });
});
