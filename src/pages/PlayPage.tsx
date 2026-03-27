import { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { useGameStore } from '../stores/game-store.ts';
import { useSettingsStore } from '../stores/settings-store.ts';
import { useStatsStore } from '../stores/stats-store.ts';
import { GameTable } from '../components/table/GameTable.tsx';
import { BiddingPanel } from '../components/table/BiddingPanel.tsx';
import { HandDisplay } from '../components/table/HandDisplay.tsx';
import { Button } from '../components/common/Button.tsx';
import { CoachingPanel } from '../components/coaching/CoachingPanel.tsx';
import { CoachBanner } from '../components/coaching/CoachBanner.tsx';
import { HandReview } from '../components/coaching/HandReview.tsx';
import { isCalledCardValid } from '../engine/contract.ts';
import { getBiddingAdvice, getPlayAdvice, getCallingAdvice } from '../stats/coaching.ts';
import { generateHandReview } from '../stats/review.ts';
import type { Card, TrumpChoice } from '../engine/types.ts';
import type { CoachingAdvice } from '../stats/types.ts';
import { SUITS } from '../engine/card.ts';

export function PlayPage() {
  const { gameState, initGame, startNewHand, humanBid, humanPass, humanCallPartner, humanPlayCard, runAITurn, isProcessingAI } = useGameStore();
  const { difficulty, archetypes, gameSpeed, coachingEnabled, toggleCoaching } = useSettingsStore();
  const { addHandRecord } = useStatsStore();

  const [showReview, setShowReview] = useState(false);
  const recordedRef = useRef(false);

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

  // Record hand result when game completes
  useEffect(() => {
    if (gameState.phase === 'complete' && gameState.handResult && gameState.contract && !recordedRef.current) {
      recordedRef.current = true;
      const hr = gameState.handResult;
      const contract = gameState.contract;
      const humanId = gameState.players[0]?.id;
      const wasDefender = hr.declarerId !== humanId && hr.partnerId !== humanId;
      addHandRecord({
        declarerId: hr.declarerId,
        partnerId: hr.partnerId,
        made: hr.made,
        bidLevel: contract.bid.level,
        trump: contract.bid.trump,
        wasDefender,
        timestamp: Date.now(),
      });
    }
    if (gameState.phase !== 'complete') {
      recordedRef.current = false;
    }
  }, [gameState.phase, gameState.handResult, gameState.contract, gameState.players, addHandRecord]);

  const handleBid = useCallback((level: number, trump: TrumpChoice) => { humanBid(level, trump); }, [humanBid]);
  const handlePass = useCallback(() => { humanPass(); }, [humanPass]);
  const handleCallPartner = useCallback((card: Card) => {
    if (isCalledCardValid(card, gameState.players[0].hand)) humanCallPartner(card);
  }, [gameState.players, humanCallPartner]);
  const handlePlayCard = useCallback((card: Card) => { humanPlayCard(card); }, [humanPlayCard]);
  const handleNewHand = useCallback(() => { setShowReview(false); startNewHand(); }, [startNewHand]);

  const playerNames: Record<string, string> = {};
  for (const p of gameState.players) playerNames[p.id] = p.name;
  const isHumanTurn = gameState.players[gameState.currentPlayerIndex]?.isHuman ?? false;

  // Compute coaching advice
  const coachingAdvice: CoachingAdvice | null = useMemo(() => {
    if (!coachingEnabled || !isHumanTurn) return null;

    const humanHand = gameState.players[0]?.hand ?? [];
    if (humanHand.length === 0) return null;

    if (gameState.phase === 'bidding') {
      return getBiddingAdvice(humanHand, gameState.currentBid);
    }

    if (gameState.phase === 'calling' && gameState.contract) {
      return getCallingAdvice(humanHand, gameState.contract.bid.trump);
    }

    if (gameState.phase === 'playing' && gameState.currentTrick && gameState.contract) {
      return getPlayAdvice(humanHand, gameState.currentTrick, gameState.contract.bid.trump, gameState.tricks);
    }

    return null;
  }, [coachingEnabled, isHumanTurn, gameState.phase, gameState.players, gameState.currentBid, gameState.contract, gameState.currentTrick, gameState.tricks]);

  // Compute hand review data
  const reviewData = useMemo(() => {
    if (gameState.phase !== 'complete' || !gameState.handResult || !gameState.contract) return null;
    return generateHandReview(
      gameState.tricks,
      gameState.contract.bid.trump,
      gameState.handResult.declarerId,
      gameState.handResult.partnerId,
    );
  }, [gameState.phase, gameState.tricks, gameState.contract, gameState.handResult]);

  const SUIT_SYMBOLS: Record<string, string> = { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠' };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <CoachBanner advice={coachingAdvice} visible={coachingEnabled && isHumanTurn} />

      {gameState.phase === 'dealing' && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Floating Bridge</h2>
          <Button size="lg" onClick={handleNewHand}>Deal New Hand</Button>
        </div>
      )}

      {gameState.phase === 'bidding' && (
        <div className="flex gap-4">
          <div className="flex-1 space-y-4">
            <HandDisplay cards={gameState.players[0].hand} />
            <BiddingPanel currentBid={gameState.currentBid} biddingHistory={gameState.biddingHistory}
              onBid={handleBid} onPass={handlePass} isHumanTurn={isHumanTurn} playerNames={playerNames} />
          </div>
          {coachingEnabled && (
            <CoachingPanel advice={coachingAdvice} visible={coachingEnabled} onToggle={toggleCoaching} />
          )}
        </div>
      )}

      {gameState.phase === 'calling' && isHumanTurn && (
        <div className="flex gap-4">
          <div className="flex-1 space-y-4">
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
          {coachingEnabled && (
            <CoachingPanel advice={coachingAdvice} visible={coachingEnabled} onToggle={toggleCoaching} />
          )}
        </div>
      )}

      {gameState.phase === 'calling' && !isHumanTurn && (
        <div className="text-center py-8"><p className="text-gray-400">Declarer is choosing a partner card...</p></div>
      )}

      {gameState.phase === 'playing' && (
        <div className="flex gap-4">
          <div className="flex-1">
            <GameTable gameState={gameState} onCardClick={isHumanTurn ? handlePlayCard : undefined} />
          </div>
          {coachingEnabled && (
            <CoachingPanel advice={coachingAdvice} visible={coachingEnabled} onToggle={toggleCoaching} />
          )}
        </div>
      )}

      {gameState.phase === 'complete' && gameState.handResult && (
        <div className="space-y-4 py-8">
          {!showReview ? (
            <div className="text-center space-y-4">
              <div className={`text-3xl font-bold ${gameState.handResult.made ? 'text-green-400' : 'text-red-400'}`}>
                {gameState.handResult.made ? 'Contract Made!' : 'Contract Failed!'}
              </div>
              <div className="text-gray-300">Needed {gameState.handResult.tricksNeeded} tricks, took {gameState.handResult.tricksTaken}</div>
              <div className="flex gap-3 justify-center">
                {reviewData && (
                  <Button size="lg" variant="secondary" onClick={() => setShowReview(true)}>Review Hand</Button>
                )}
                <Button size="lg" onClick={handleNewHand}>Deal New Hand</Button>
              </div>
            </div>
          ) : (
            reviewData && <HandReview review={reviewData} playerNames={playerNames} onClose={() => setShowReview(false)} />
          )}
        </div>
      )}
    </div>
  );
}
