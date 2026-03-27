import type { Card } from '../../engine/types.ts';
import { CardDisplay } from '../common/CardDisplay.tsx';
import { compareCards } from '../../engine/card.ts';

interface HandDisplayProps { cards: Card[]; playableCards?: Card[]; onCardClick?: (card: Card) => void; }

export function HandDisplay({ cards, playableCards, onCardClick }: HandDisplayProps) {
  const sorted = [...cards].sort(compareCards);
  const isPlayable = (card: Card) => playableCards ? playableCards.some(p => p.suit === card.suit && p.rank === card.rank) : true;
  return (
    <div className="flex gap-1 justify-center flex-wrap">
      {sorted.map((card) => (
        <CardDisplay key={`${card.suit}-${card.rank}`} card={card}
          onClick={onCardClick && isPlayable(card) ? () => onCardClick(card) : undefined}
          disabled={onCardClick !== undefined && !isPlayable(card)} size="md" />
      ))}
    </div>
  );
}
