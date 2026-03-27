import { describe, it, expect } from 'vitest';
import { tricksNeeded, resolveContract, isCalledCardValid } from '../../src/engine/contract';
import type { Card } from '../../src/engine/types';

const c = (suit: string, rank: string): Card => ({ suit, rank } as Card);

describe('contract', () => {
  it('level 1 needs 7 tricks', () => { expect(tricksNeeded(1)).toBe(7); });
  it('level 7 needs 13 tricks', () => { expect(tricksNeeded(7)).toBe(13); });
  it('contract made', () => {
    const r = resolveContract(1, 8, 'd', 'p');
    expect(r.made).toBe(true); expect(r.tricksNeeded).toBe(7);
  });
  it('contract failed', () => {
    const r = resolveContract(3, 8, 'd', 'p');
    expect(r.made).toBe(false); expect(r.tricksNeeded).toBe(9);
  });
  it('called card valid if not in hand', () => {
    expect(isCalledCardValid(c('clubs', 'A'), [c('hearts', 'A')])).toBe(true);
  });
  it('called card invalid if in hand', () => {
    expect(isCalledCardValid(c('hearts', 'A'), [c('hearts', 'A')])).toBe(false);
  });
});
