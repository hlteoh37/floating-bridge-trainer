import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Difficulty, ArchetypeName } from '../ai/types.ts';

interface SettingsState {
  difficulty: Difficulty;
  archetypes: [ArchetypeName, ArchetypeName, ArchetypeName];
  coachingEnabled: boolean;
  gameSpeed: number;
  setDifficulty: (d: Difficulty) => void;
  setArchetypes: (a: [ArchetypeName, ArchetypeName, ArchetypeName]) => void;
  toggleCoaching: () => void;
  setGameSpeed: (speed: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      difficulty: 'intermediate',
      archetypes: ['balanced', 'aggressive', 'conservative'],
      coachingEnabled: true,
      gameSpeed: 800,
      setDifficulty: (difficulty) => set({ difficulty }),
      setArchetypes: (archetypes) => set({ archetypes }),
      toggleCoaching: () => set((s) => ({ coachingEnabled: !s.coachingEnabled })),
      setGameSpeed: (gameSpeed) => set({ gameSpeed }),
    }),
    { name: 'floating-bridge-settings' },
  ),
);
