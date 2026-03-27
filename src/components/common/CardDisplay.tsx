import type { Card, Suit } from '../../engine/types.ts';

const SUIT_SYMBOLS: Record<Suit, string> = { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠' };
const SUIT_COLORS: Record<Suit, string> = { clubs: 'text-gray-900', diamonds: 'text-red-600', hearts: 'text-red-600', spades: 'text-gray-900' };

interface CardDisplayProps {
  card: Card;
  faceDown?: boolean;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = { sm: 'w-8 h-12 text-xs', md: 'w-12 h-18 text-sm', lg: 'w-16 h-24 text-base' };

export function CardDisplay({ card, faceDown = false, onClick, selected = false, disabled = false, size = 'md' }: CardDisplayProps) {
  if (faceDown) {
    return <div className={`${SIZE_CLASSES[size]} rounded-lg bg-blue-800 border-2 border-blue-600 flex items-center justify-center`}><div className="text-blue-400 text-lg">?</div></div>;
  }
  return (
    <button
      className={`${SIZE_CLASSES[size]} rounded-lg bg-white border-2 flex flex-col items-center justify-center font-bold transition-transform
        ${selected ? 'border-yellow-400 -translate-y-2' : 'border-gray-300'}
        ${onClick && !disabled ? 'cursor-pointer hover:-translate-y-1' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick} disabled={disabled || !onClick}
    >
      <span className={SUIT_COLORS[card.suit]}>{card.rank}</span>
      <span className={SUIT_COLORS[card.suit]}>{SUIT_SYMBOLS[card.suit]}</span>
    </button>
  );
}
