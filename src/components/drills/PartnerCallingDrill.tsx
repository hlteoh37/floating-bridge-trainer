import { useState, useCallback } from 'react';
import type { Card, Suit } from '../../engine/types.ts';
import { createDeck, shuffleDeck, dealHands } from '../../engine/deck.ts';
import { HandDisplay } from '../table/HandDisplay.tsx';
import { DrillFeedback } from './DrillFeedback.tsx';
import { Button } from '../common/Button.tsx';
import { useStatsStore } from '../../stores/stats-store.ts';
import { getCallingAdvice } from '../../stats/coaching.ts';
import { isCalledCardValid } from '../../engine/contract.ts';
import { SUITS } from '../../engine/card.ts';

interface CallingDrillState {
  hand: Card[];
  trump: Suit;
  answered: boolean;
  correct: boolean;
  explanation: string;
}

function generateCallingDrill(): CallingDrillState {
  const deck = shuffleDeck(createDeck());
  const hands = dealHands(deck);
  const trump: Suit = SUITS[Math.floor(Math.random() * 4)];
  return { hand: hands[0], trump, answered: false, correct: false, explanation: '' };
}

export function PartnerCallingDrill() {
  const [state, setState] = useState<CallingDrillState>(generateCallingDrill);
  const addDrillResult = useStatsStore(s => s.addDrillResult);

  const handleCall = useCallback((card: Card) => {
    if (!isCalledCardValid(card, state.hand)) return;

    const advice = getCallingAdvice(state.hand, state.trump);
    const suggestedSuit = advice.action.includes('\u2663') ? 'clubs'
      : advice.action.includes('\u2666') ? 'diamonds'
      : advice.action.includes('\u2665') ? 'hearts'
      : 'spades';
    const correct = card.suit === suggestedSuit && card.rank === 'A';

    const explanation = `${advice.explanation} ${correct ? 'Great choice!' : `A stronger call might be ${advice.action}.`}`;
    addDrillResult({ type: 'partner-calling', correct, timestamp: Date.now() });
    setState(s => ({ ...s, answered: true, correct, explanation }));
  }, [state.hand, state.trump, addDrillResult]);

  const handleNext = useCallback(() => {
    setState(generateCallingDrill());
  }, []);

  const SUIT_SYMBOLS: Record<Suit, string> = { clubs: '\u2663', diamonds: '\u2666', hearts: '\u2665', spades: '\u2660' };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h3 className="text-lg font-bold text-center">Partner Calling Drill</h3>
      <p className="text-center text-sm text-gray-400">
        Trump: <span className="font-bold text-yellow-400">{SUIT_SYMBOLS[state.trump]} {state.trump}</span>
      </p>

      <HandDisplay cards={state.hand} />

      {!state.answered && (
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-300 mb-3 text-center">Which card do you call?</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {SUITS.map(suit =>
              ['A', 'K', 'Q'].map(rank => {
                const card: Card = { suit, rank: rank as Card['rank'] };
                const valid = isCalledCardValid(card, state.hand);
                return (
                  <Button
                    key={`${suit}-${rank}`}
                    size="sm"
                    variant={valid ? 'primary' : 'secondary'}
                    disabled={!valid}
                    onClick={() => handleCall(card)}
                  >
                    {rank}{SUIT_SYMBOLS[suit]}
                  </Button>
                );
              })
            )}
          </div>
        </div>
      )}

      {state.answered && (
        <DrillFeedback correct={state.correct} explanation={state.explanation} onNext={handleNext} />
      )}
    </div>
  );
}
