import { useState, useCallback } from 'react';
import type { Card, TrumpChoice } from '../../engine/types.ts';
import { createDeck, shuffleDeck, dealHands } from '../../engine/deck.ts';
import { evaluateHandStrength } from '../../stats/hand-eval.ts';
import { HandDisplay } from '../table/HandDisplay.tsx';
import { DrillFeedback } from './DrillFeedback.tsx';
import { Button } from '../common/Button.tsx';
import { useStatsStore } from '../../stores/stats-store.ts';

interface BiddingDrillState {
  hand: Card[];
  currentBid: { level: number; trump: TrumpChoice; playerId: string } | null;
  answered: boolean;
  correct: boolean;
  explanation: string;
}

function generateDrillHand(): BiddingDrillState {
  const deck = shuffleDeck(createDeck());
  const hands = dealHands(deck);
  const hasBid = Math.random() > 0.5;
  const currentBid = hasBid
    ? { level: Math.ceil(Math.random() * 3), trump: (['clubs', 'diamonds', 'hearts', 'spades'] as const)[Math.floor(Math.random() * 4)], playerId: 'opponent' }
    : null;

  return { hand: hands[0], currentBid, answered: false, correct: false, explanation: '' };
}

export function BiddingDrill() {
  const [state, setState] = useState<BiddingDrillState>(generateDrillHand);
  const addDrillResult = useStatsStore(s => s.addDrillResult);

  const handleAction = useCallback((action: 'pass' | 'bid') => {
    const eval_ = evaluateHandStrength(state.hand);
    const shouldBid = eval_.suggestedLevel > 0;
    const correct = action === 'pass' ? !shouldBid : shouldBid;

    let explanation = `Your hand has ${eval_.hcp} HCP with a ${eval_.longestSuitLength}-card ${eval_.longestSuit}. `;
    if (shouldBid) {
      explanation += `Suggested bid: ${eval_.suggestedLevel} ${eval_.suggestedTrump}. `;
    } else {
      explanation += `This hand is too weak to bid. `;
    }
    if (correct) {
      explanation += 'Good call!';
    } else {
      explanation += action === 'pass' ? 'You should have bid with this hand.' : 'This hand is better as a pass.';
    }

    addDrillResult({ type: 'bidding', correct, timestamp: Date.now() });
    setState(s => ({ ...s, answered: true, correct, explanation }));
  }, [state.hand, addDrillResult]);

  const handleNext = useCallback(() => {
    setState(generateDrillHand());
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h3 className="text-lg font-bold text-center">Bidding Drill</h3>

      {state.currentBid && (
        <div className="text-center text-sm text-gray-400">
          Current bid: <span className="font-bold text-yellow-400">{state.currentBid.level} {state.currentBid.trump}</span>
        </div>
      )}

      <HandDisplay cards={state.hand} />

      {!state.answered && (
        <div className="flex gap-2 justify-center">
          <Button onClick={() => handleAction('bid')}>Bid</Button>
          <Button variant="secondary" onClick={() => handleAction('pass')}>Pass</Button>
        </div>
      )}

      {state.answered && (
        <DrillFeedback correct={state.correct} explanation={state.explanation} onNext={handleNext} />
      )}
    </div>
  );
}
