import type { Trick, Position } from '../../engine/types.ts';
import { CardDisplay } from '../common/CardDisplay.tsx';

interface TrickAreaProps { trick: Trick | null; playerPositions: Record<string, Position>; }

const POSITION_STYLE: Record<Position, string> = {
  south: 'bottom-0 left-1/2 -translate-x-1/2',
  north: 'top-0 left-1/2 -translate-x-1/2',
  west: 'left-0 top-1/2 -translate-y-1/2',
  east: 'right-0 top-1/2 -translate-y-1/2',
};

export function TrickArea({ trick, playerPositions }: TrickAreaProps) {
  if (!trick || trick.cards.length === 0) {
    return <div className="relative w-48 h-32 mx-auto flex items-center justify-center"><span className="text-gray-500 text-sm">No cards played</span></div>;
  }
  return (
    <div className="relative w-48 h-32 mx-auto">
      {trick.cards.map((tc) => (
        <div key={`${tc.card.suit}-${tc.card.rank}`} className={`absolute ${POSITION_STYLE[playerPositions[tc.playerId]]}`}>
          <CardDisplay card={tc.card} size="sm" />
        </div>
      ))}
    </div>
  );
}
