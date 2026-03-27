import { useState } from 'react';
import type { Bid, TrumpChoice } from '../../engine/types.ts';
import { Button } from '../common/Button.tsx';
import { isValidBid } from '../../engine/bidding.ts';

interface BiddingPanelProps {
  currentBid: Bid | null;
  biddingHistory: Bid[];
  onBid: (level: number, trump: TrumpChoice) => void;
  onPass: () => void;
  isHumanTurn: boolean;
  playerNames: Record<string, string>;
}

const TRUMP_OPTIONS: { value: TrumpChoice; label: string }[] = [
  { value: 'clubs', label: '♣ Clubs' }, { value: 'diamonds', label: '♦ Diamonds' },
  { value: 'hearts', label: '♥ Hearts' }, { value: 'spades', label: '♠ Spades' },
  { value: 'no-trump', label: 'NT' },
];

const TRUMP_SHORT: Record<TrumpChoice, string> = { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠', 'no-trump': 'NT' };

export function BiddingPanel({ currentBid, biddingHistory, onBid, onPass, isHumanTurn, playerNames }: BiddingPanelProps) {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedTrump, setSelectedTrump] = useState<TrumpChoice>('clubs');
  const testBid: Bid = { level: selectedLevel, trump: selectedTrump, playerId: '' };
  const canBid = isValidBid(testBid, currentBid);

  return (
    <div className="bg-gray-800 rounded-xl p-4 max-w-md mx-auto">
      <h3 className="text-lg font-bold text-center mb-3">Bidding</h3>
      <div className="mb-4 max-h-32 overflow-y-auto">
        {biddingHistory.length === 0 && <p className="text-gray-400 text-sm text-center">No bids yet</p>}
        {biddingHistory.map((bid, i) => (
          <div key={i} className="text-sm text-gray-300 flex justify-between px-2 py-1">
            <span>{playerNames[bid.playerId] ?? bid.playerId}</span>
            <span className="font-bold">{bid.level}{TRUMP_SHORT[bid.trump]}</span>
          </div>
        ))}
      </div>
      {currentBid && (
        <div className="text-center mb-3 text-sm">
          <span className="text-gray-400">Current bid: </span>
          <span className="font-bold text-yellow-400">{currentBid.level}{TRUMP_SHORT[currentBid.trump]}</span>
        </div>
      )}
      {isHumanTurn && (
        <div className="space-y-3">
          <div className="flex gap-1 justify-center">
            {[1,2,3,4,5,6,7].map(level => (
              <button key={level} className={`w-8 h-8 rounded text-sm font-bold ${selectedLevel === level ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`} onClick={() => setSelectedLevel(level)}>{level}</button>
            ))}
          </div>
          <div className="flex gap-1 justify-center">
            {TRUMP_OPTIONS.map(({ value, label }) => (
              <button key={value} className={`px-3 py-1 rounded text-sm ${selectedTrump === value ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`} onClick={() => setSelectedTrump(value)}>{label}</button>
            ))}
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => onBid(selectedLevel, selectedTrump)} disabled={!canBid}>Bid {selectedLevel}{TRUMP_SHORT[selectedTrump]}</Button>
            <Button variant="secondary" onClick={onPass}>Pass</Button>
          </div>
        </div>
      )}
      {!isHumanTurn && <p className="text-center text-gray-400 text-sm">Waiting for other players...</p>}
    </div>
  );
}
