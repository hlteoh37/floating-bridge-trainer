import type { AIArchetype, ArchetypeName, AIConfig, Difficulty } from './types.ts';

export const ARCHETYPES: Record<ArchetypeName, AIArchetype> = {
  aggressive: { name: 'aggressive', bidAggressiveness: 0.8, riskTolerance: 0.8, bluffFrequency: 0.3, trumpLeadPreference: 0.7 },
  conservative: { name: 'conservative', bidAggressiveness: 0.3, riskTolerance: 0.2, bluffFrequency: 0.05, trumpLeadPreference: 0.3 },
  balanced: { name: 'balanced', bidAggressiveness: 0.5, riskTolerance: 0.5, bluffFrequency: 0.1, trumpLeadPreference: 0.5 },
  tricky: { name: 'tricky', bidAggressiveness: 0.6, riskTolerance: 0.6, bluffFrequency: 0.5, trumpLeadPreference: 0.4 },
};

const DIFFICULTY_SETTINGS: Record<Difficulty, { noiseLevel: number; cardMemory: number }> = {
  beginner: { noiseLevel: 0.3, cardMemory: 0.2 },
  intermediate: { noiseLevel: 0.15, cardMemory: 0.6 },
  advanced: { noiseLevel: 0.05, cardMemory: 0.95 },
};

export function createAIConfig(archetype: ArchetypeName, difficulty: Difficulty): AIConfig {
  return { archetype: ARCHETYPES[archetype], difficulty, ...DIFFICULTY_SETTINGS[difficulty] };
}

export function getRandomArchetype(): ArchetypeName {
  const names: ArchetypeName[] = ['aggressive', 'conservative', 'balanced', 'tricky'];
  return names[Math.floor(Math.random() * names.length)];
}
