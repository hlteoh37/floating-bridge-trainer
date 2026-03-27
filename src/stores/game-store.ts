import { create } from 'zustand';
import type { GameState, Card, Bid } from '../engine/types.ts';
import type { AIConfig } from '../ai/types.ts';
import { createGame, dealNewHand, placeBid, passPlayer, callPartner, playCard } from '../engine/game.ts';
import { createAIConfig } from '../ai/archetypes.ts';
import { makeAIBidDecision } from '../ai/bidding.ts';
import { makeAICallDecision } from '../ai/calling.ts';
import { makeAIPlayDecision } from '../ai/play.ts';
import { createCardTracker } from '../ai/inference.ts';
import type { Difficulty, ArchetypeName } from '../ai/types.ts';

interface GameStoreState {
  gameState: GameState;
  aiConfigs: AIConfig[];
  isProcessingAI: boolean;
  initGame: (difficulty: Difficulty, archetypes: [ArchetypeName, ArchetypeName, ArchetypeName]) => void;
  startNewHand: () => void;
  humanBid: (level: number, trump: Bid['trump']) => void;
  humanPass: () => void;
  humanCallPartner: (card: Card) => void;
  humanPlayCard: (card: Card) => void;
  runAITurn: () => Promise<void>;
}

export const useGameStore = create<GameStoreState>()((set, get) => ({
  gameState: createGame(),
  aiConfigs: [],
  isProcessingAI: false,

  initGame: (difficulty, archetypes) => {
    const aiConfigs = archetypes.map(arch => createAIConfig(arch, difficulty));
    set({ gameState: createGame(), aiConfigs });
  },

  startNewHand: () => set((s) => ({ gameState: dealNewHand(s.gameState) })),

  humanBid: (level, trump) => {
    const { gameState } = get();
    const playerId = gameState.players[gameState.currentPlayerIndex].id;
    set({ gameState: placeBid(gameState, { level, trump, playerId }) });
  },

  humanPass: () => set((s) => ({ gameState: passPlayer(s.gameState) })),

  humanCallPartner: (card) => set((s) => ({ gameState: callPartner(s.gameState, card) })),

  humanPlayCard: (card) => set((s) => ({ gameState: playCard(s.gameState, card) })),

  runAITurn: async () => {
    const { gameState, aiConfigs } = get();
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isHuman) return;

    set({ isProcessingAI: true });
    const aiConfigIndex = gameState.currentPlayerIndex - 1;
    const config = aiConfigs[aiConfigIndex];
    let newState = gameState;

    if (gameState.phase === 'bidding') {
      const bid = makeAIBidDecision(currentPlayer.hand, gameState.currentBid, config, currentPlayer.id);
      newState = bid ? placeBid(gameState, bid) : passPlayer(gameState);
    } else if (gameState.phase === 'calling') {
      const calledCard = makeAICallDecision(currentPlayer.hand, gameState.currentBid!.trump, config);
      newState = callPartner(gameState, calledCard);
    } else if (gameState.phase === 'playing') {
      const tracker = createCardTracker(currentPlayer.hand);
      for (const trick of gameState.tricks) tracker.recordTrick(trick);
      const card = makeAIPlayDecision(currentPlayer.hand, gameState.currentTrick!, gameState.contract!, config, tracker, currentPlayer.id);
      newState = playCard(gameState, card);
    }

    set({ gameState: newState, isProcessingAI: false });
  },
}));
