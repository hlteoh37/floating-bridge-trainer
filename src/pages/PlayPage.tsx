import { useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/game-store.ts';
import { useSettingsStore } from '../stores/settings-store.ts';
import { GameTable } from '../components/table/GameTable.tsx';
import { BiddingPanel } from '../components/table/BiddingPanel.tsx';
import { HandDisplay } from '../components/table/HandDisplay.tsx';
import { Button } from '../components/common/Button.tsx';
import { isCalledCardValid } from '../engine/contract.ts';
import type { Card, TrumpChoice } from '../engine/types.ts';
import { SUITS } from '../engine/card.ts';

export function PlayPage() {
  const { gameState, initGame, startNewHand, humanBid, humanPass, humanCallPartner, humanPlayCard, runAITurn, isProcessingAI } = useGameStore();
  const { difficulty, archetypes, gameSpeed } = useSettingsStore();

  useEffect(() => { initGame(difficulty, archetypes); }, [difficulty, archetypes, initGame]);

  useEffect(() => {
    if (isProcessingAI) return;
    if (gameState.phase === 'complete' || gameState.phase === 'dealing') return;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer.isHuman) {
      const timer = setTimeout(() => { runAITurn(); }, gameSpeed);
      return () => clearTimeout(timer);
    }
  }, [gameState, isProcessingAI, gameSpeed, runAITurn]);

  const handleBid = useCallback((level: number, trump: TrumpChoice) => { humanBid(level, trump); }, [humanBid]);
  const handlePass = useCallback(() => { humanPass(); }, [humanPass]);
  const handleCallPartner = useCallback((card: Card) => {
    if (isCalledCardValid(card, gameState.players[0].hand)) humanCallPartner(card);
  }, [gameState.players, humanCallPartner]);
  const handlePlayCard = useCallback((card: Card) => { humanPlayCard(card); }, [humanPlayCard]);
  const handleNewHand = useCallback(() => { startNewHand(); }, [startNewHand]);

  const playerNames: Record<string, string> = {};
  for (const p of gameState.players) playerNames[p.id] = p.name;
  const isHumanTurn = gameState.players[gameState.currentPlayerIndex]?.isHuman ?? false;

  const SUIT_SYMBOLS: Record<string, string> = { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠' };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {gameState.phase === 'dealing' && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Floating Bridge</h2>
          <Button size="lg" onClick={handleNewHand}>Deal New Hand</Button>
        </div>
      )}

      {gameState.phase === 'bidding' && (
        <>
          <HandDisplay cards={gameState.players[0].hand} />
          <BiddingPanel currentBid={gameState.currentBid} biddingHistory={gameState.biddingHistory}
            onBid={handleBid} onPass={handlePass} isHumanTurn={isHumanTurn} playerNames={playerNames} />
        </>
      )}

      {gameState.phase === 'calling' && isHumanTurn && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-center">Call Your Partner</h3>
          <p className="text-gray-400 text-center text-sm">Choose a card you don't have. Whoever holds it is your secret partner.</p>
          <HandDisplay cards={gameState.players[0].hand} />
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-300 mb-3 text-center">Select a card to call:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUITS.map(suit => (['A','K','Q','J'] as const).map(rank => {
                const card: Card = { suit, rank };
                const valid = isCalledCardValid(card, gameState.players[0].hand);
                return <Button key={`${suit}-${rank}`} size="sm" variant={valid ? 'primary' : 'secondary'} disabled={!valid}
                  onClick={() => handleCallPartner(card)}>{rank}{SUIT_SYMBOLS[suit]}</Button>;
              }))}
            </div>
          </div>
        </div>
      )}

      {gameState.phase === 'calling' && !isHumanTurn && (
        <div className="text-center py-8"><p className="text-gray-400">Declarer is choosing a partner card...</p></div>
      )}

      {gameState.phase === 'playing' && (
        <GameTable gameState={gameState} onCardClick={isHumanTurn ? handlePlayCard : undefined} />
      )}

      {gameState.phase === 'complete' && gameState.handResult && (
        <div className="text-center space-y-4 py-8">
          <div className={`text-3xl font-bold ${gameState.handResult.made ? 'text-green-400' : 'text-red-400'}`}>
            {gameState.handResult.made ? 'Contract Made!' : 'Contract Failed!'}
          </div>
          <div className="text-gray-300">Needed {gameState.handResult.tricksNeeded} tricks, took {gameState.handResult.tricksTaken}</div>
          <Button size="lg" onClick={handleNewHand}>Deal New Hand</Button>
        </div>
      )}
    </div>
  );
}
