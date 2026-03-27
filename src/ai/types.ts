export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ArchetypeName = 'aggressive' | 'conservative' | 'balanced' | 'tricky';

export interface AIArchetype {
  name: ArchetypeName;
  bidAggressiveness: number;
  riskTolerance: number;
  bluffFrequency: number;
  trumpLeadPreference: number;
}

export interface AIConfig {
  archetype: AIArchetype;
  difficulty: Difficulty;
  noiseLevel: number;
  cardMemory: number;
}
