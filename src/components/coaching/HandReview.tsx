import { useState } from 'react';
import type { HandReviewData } from '../../stats/review.ts';
import { Button } from '../common/Button.tsx';

interface HandReviewProps {
  review: HandReviewData;
  playerNames: Record<string, string>;
  onClose: () => void;
}

export function HandReview({ review, playerNames, onClose }: HandReviewProps) {
  const [currentTrick, setCurrentTrick] = useState(0);

  const trick = review.tricks[currentTrick];

  return (
    <div className="bg-gray-800 rounded-xl p-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Hand Review</h3>
        <button className="text-gray-400 hover:text-white" onClick={onClose}>Close</button>
      </div>

      <p className="text-gray-300 text-sm mb-4">{review.summary}</p>

      {trick && (
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Trick {trick.trickNumber} of {review.tricks.length}</div>
          <div className="space-y-1">
            {trick.cards.map((tc, i) => (
              <div key={i} className={`flex justify-between text-sm px-2 py-1 rounded ${
                tc.playerId === trick.winnerId ? 'bg-green-900 text-green-300' : 'text-gray-300'
              }`}>
                <span>{playerNames[tc.playerId] ?? tc.playerId}</span>
                <span className="font-mono">{tc.cardStr}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Winner: {playerNames[trick.winnerId] ?? trick.winnerId}
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <Button
          size="sm"
          variant="secondary"
          disabled={currentTrick === 0}
          onClick={() => setCurrentTrick(currentTrick - 1)}
        >
          Prev
        </Button>
        <span className="text-sm self-center text-gray-400">
          {currentTrick + 1} / {review.tricks.length}
        </span>
        <Button
          size="sm"
          variant="secondary"
          disabled={currentTrick >= review.tricks.length - 1}
          onClick={() => setCurrentTrick(currentTrick + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
