import { useState, useCallback } from 'react';
import type { Trick } from '../../engine/types.ts';
import { createDeck, shuffleDeck } from '../../engine/deck.ts';
import { SUITS } from '../../engine/card.ts';
import { CardDisplay } from '../common/CardDisplay.tsx';
import { DrillFeedback } from './DrillFeedback.tsx';
import { Button } from '../common/Button.tsx';
import { useStatsStore } from '../../stores/stats-store.ts';

interface CountingDrillState {
  playedTricks: Trick[];
  question: string;
  correctAnswer: number;
  answered: boolean;
  correct: boolean;
  explanation: string;
}

function generateCountingDrill(): CountingDrillState {
  const deck = shuffleDeck(createDeck());
  const trickCount = 3 + Math.floor(Math.random() * 3);
  const playedTricks: Trick[] = [];
  let cardIdx = 0;

  for (let t = 0; t < trickCount; t++) {
    const cards = [];
    for (let p = 0; p < 4; p++) {
      cards.push({ card: deck[cardIdx], playerId: `p${p}` });
      cardIdx++;
    }
    playedTricks.push({ ledSuit: cards[0].card.suit, winnerId: cards[0].playerId, cards });
  }

  const targetSuit = SUITS[Math.floor(Math.random() * 4)];
  const playedInSuit = playedTricks.flatMap(t => t.cards).filter(tc => tc.card.suit === targetSuit).length;
  const remaining = 13 - playedInSuit;

  const suitSymbol = { clubs: '\u2663', diamonds: '\u2666', hearts: '\u2665', spades: '\u2660' }[targetSuit];

  return {
    playedTricks,
    question: `How many ${suitSymbol} ${targetSuit} cards are still unplayed?`,
    correctAnswer: remaining,
    answered: false,
    correct: false,
    explanation: '',
  };
}

export function CardCountingDrill() {
  const [state, setState] = useState<CountingDrillState>(generateCountingDrill);
  const [userAnswer, setUserAnswer] = useState('');
  const addDrillResult = useStatsStore(s => s.addDrillResult);

  const handleSubmit = useCallback(() => {
    const answer = parseInt(userAnswer, 10);
    const correct = answer === state.correctAnswer;
    const explanation = correct
      ? `Correct! ${state.correctAnswer} cards of that suit remain.`
      : `The answer is ${state.correctAnswer}. ${13 - state.correctAnswer} have been played.`;

    addDrillResult({ type: 'card-counting', correct, timestamp: Date.now() });
    setState(s => ({ ...s, answered: true, correct, explanation }));
  }, [userAnswer, state.correctAnswer, addDrillResult]);

  const handleNext = useCallback(() => {
    setState(generateCountingDrill());
    setUserAnswer('');
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h3 className="text-lg font-bold text-center">Card Counting Drill</h3>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {state.playedTricks.map((trick, t) => (
          <div key={t} className="bg-gray-800 rounded-lg p-2">
            <div className="text-xs text-gray-400 mb-1">Trick {t + 1}</div>
            <div className="flex gap-1 justify-center">
              {trick.cards.map((tc, i) => (
                <CardDisplay key={i} card={tc.card} size="sm" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-xl p-4 text-center">
        <p className="text-lg font-bold mb-3">{state.question}</p>
        {!state.answered && (
          <div className="flex gap-2 justify-center items-center">
            <input
              type="number"
              min={0}
              max={13}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-20 bg-gray-700 text-white text-center rounded px-3 py-2"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <Button onClick={handleSubmit} disabled={userAnswer === ''}>
              Submit
            </Button>
          </div>
        )}
      </div>

      {state.answered && (
        <DrillFeedback correct={state.correct} explanation={state.explanation} onNext={handleNext} />
      )}
    </div>
  );
}
