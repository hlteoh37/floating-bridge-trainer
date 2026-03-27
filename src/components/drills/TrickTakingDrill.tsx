import { useState, useCallback } from 'react';
import type { Card, Trick, Suit } from '../../engine/types.ts';
import { createDeck, shuffleDeck } from '../../engine/deck.ts';
import { getPlayableCards } from '../../engine/tricks.ts';
import { HandDisplay } from '../table/HandDisplay.tsx';
import { CardDisplay } from '../common/CardDisplay.tsx';
import { DrillFeedback } from './DrillFeedback.tsx';
import { useStatsStore } from '../../stores/stats-store.ts';
import { getPlayAdvice } from '../../stats/coaching.ts';
import { SUITS } from '../../engine/card.ts';

interface TrickDrillState {
  hand: Card[];
  trick: Trick;
  trump: Suit | 'no-trump';
  answered: boolean;
  correct: boolean;
  explanation: string;
}

function generateTrickDrill(): TrickDrillState {
  const deck = shuffleDeck(createDeck());
  const handSize = 6 + Math.floor(Math.random() * 3);
  const hand = deck.slice(0, handSize);
  const remaining = deck.slice(handSize);

  const trickCardsCount = 1 + Math.floor(Math.random() * 2);
  const trickCards = remaining.slice(0, trickCardsCount);
  const ledSuit = trickCards[0].suit;

  const trick: Trick = {
    ledSuit,
    winnerId: null,
    cards: trickCards.map((card, i) => ({ card, playerId: `opponent-${i}` })),
  };

  const trumpOptions: (Suit | 'no-trump')[] = [...SUITS, 'no-trump'];
  const trump = trumpOptions[Math.floor(Math.random() * trumpOptions.length)];

  return { hand, trick, trump, answered: false, correct: false, explanation: '' };
}

export function TrickTakingDrill() {
  const [state, setState] = useState<TrickDrillState>(generateTrickDrill);
  const addDrillResult = useStatsStore(s => s.addDrillResult);

  const playable = getPlayableCards(state.hand, state.trick.ledSuit);
  const advice = getPlayAdvice(state.hand, state.trick, state.trump, []);

  const handleCardClick = useCallback((card: Card) => {
    const advisedCardStr = advice.action.replace(/^(Play|Lead) /, '');
    const chosenStr = `${card.rank}${{ clubs: '\u2663', diamonds: '\u2666', hearts: '\u2665', spades: '\u2660' }[card.suit]}`;
    const correct = advisedCardStr === chosenStr;

    const explanation = `${advice.explanation} ${correct ? 'Perfect play!' : `The recommended play was ${advice.action}.`}`;
    addDrillResult({ type: 'trick-taking', correct, timestamp: Date.now() });
    setState(s => ({ ...s, answered: true, correct, explanation }));
  }, [advice, addDrillResult]);

  const handleNext = useCallback(() => {
    setState(generateTrickDrill());
  }, []);

  const SUIT_SYMBOLS: Record<string, string> = { clubs: '\u2663', diamonds: '\u2666', hearts: '\u2665', spades: '\u2660', 'no-trump': 'NT' };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h3 className="text-lg font-bold text-center">Trick-Taking Drill</h3>
      <p className="text-center text-sm text-gray-400">
        Trump: <span className="font-bold text-yellow-400">{SUIT_SYMBOLS[state.trump]} {state.trump}</span>
      </p>

      <div className="bg-green-900 rounded-xl p-4">
        <div className="text-sm text-gray-300 mb-2 text-center">Cards played this trick:</div>
        <div className="flex gap-2 justify-center">
          {state.trick.cards.map((tc, i) => (
            <CardDisplay key={i} card={tc.card} size="md" />
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-400 text-center">Your hand — pick a card to play:</div>
      <HandDisplay
        cards={state.hand}
        playableCards={!state.answered ? playable : undefined}
        onCardClick={!state.answered ? handleCardClick : undefined}
      />

      {state.answered && (
        <DrillFeedback correct={state.correct} explanation={state.explanation} onNext={handleNext} />
      )}
    </div>
  );
}
