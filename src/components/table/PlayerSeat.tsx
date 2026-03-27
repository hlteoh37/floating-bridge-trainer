import type { Player, Position } from '../../engine/types.ts';

interface PlayerSeatProps { player: Player; isCurrentPlayer: boolean; isPartner: boolean; partnerRevealed: boolean; }

const POSITION_LABELS: Record<Position, string> = { south: 'You', west: 'West', north: 'North', east: 'East' };

export function PlayerSeat({ player, isCurrentPlayer, isPartner, partnerRevealed }: PlayerSeatProps) {
  return (
    <div className={`flex flex-col items-center gap-1 ${isCurrentPlayer ? 'ring-2 ring-yellow-400 rounded-lg p-2' : 'p-2'}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-300">{POSITION_LABELS[player.position]}</span>
        {partnerRevealed && isPartner && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">Partner</span>}
      </div>
      <div className="text-xs text-gray-400">Tricks: {player.tricksWon}</div>
      {!player.isHuman && (
        <div className="flex gap-0.5">
          {player.hand.map((_, i) => <div key={i} className="w-4 h-6 bg-blue-800 border border-blue-600 rounded-sm" />)}
        </div>
      )}
    </div>
  );
}
