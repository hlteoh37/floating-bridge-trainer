import type { GameState, Card, Position } from '../../engine/types.ts';
import { PlayerSeat } from './PlayerSeat.tsx';
import { TrickArea } from './TrickArea.tsx';
import { ContractInfo } from './ContractInfo.tsx';
import { HandDisplay } from './HandDisplay.tsx';
import { getPlayableCards } from '../../engine/tricks.ts';

interface GameTableProps { gameState: GameState; onCardClick?: (card: Card) => void; }

export function GameTable({ gameState, onCardClick }: GameTableProps) {
  const { players, currentPlayerIndex, contract, currentTrick, trickNumber, declarerTeamTricks, defenderTeamTricks } = gameState;
  const human = players[0];

  const playerPositions: Record<string, Position> = {};
  for (const p of players) playerPositions[p.id] = p.position;

  const isHumanTurn = currentPlayerIndex === 0 && gameState.phase === 'playing';
  const ledSuit = currentTrick && currentTrick.cards.length > 0 ? currentTrick.ledSuit : null;
  const playableCards = isHumanTurn ? getPlayableCards(human.hand, ledSuit) : undefined;

  const partnerRevealed = contract?.partnerId !== null;
  const partnerId = contract?.partnerId;
  const declarerId = contract?.declarerId;

  const playerNames: Record<string, string> = {};
  for (const p of players) playerNames[p.id] = p.name;

  const seatProps = (idx: number) => ({
    player: players[idx],
    isCurrentPlayer: currentPlayerIndex === idx,
    isDeclarer: declarerId === players[idx].id,
    isPartner: partnerId === players[idx].id,
    partnerRevealed: partnerRevealed ?? false,
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <ContractInfo contract={contract} declarerTeamTricks={declarerTeamTricks} defenderTeamTricks={defenderTeamTricks} trickNumber={trickNumber} playerNames={playerNames} />
      <div className="relative bg-green-900 rounded-xl p-8 min-w-80 min-h-64">
        <div className="flex justify-center mb-4">
          <PlayerSeat {...seatProps(2)} />
        </div>
        <div className="flex items-center justify-between">
          <PlayerSeat {...seatProps(1)} />
          <TrickArea trick={currentTrick} playerPositions={playerPositions} />
          <PlayerSeat {...seatProps(3)} />
        </div>
        <div className="flex justify-center mt-4">
          <PlayerSeat {...seatProps(0)} />
        </div>
      </div>
      <HandDisplay cards={human.hand} playableCards={playableCards} onCardClick={isHumanTurn ? onCardClick : undefined} />
    </div>
  );
}
