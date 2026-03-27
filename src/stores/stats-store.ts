import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DrillResult, HandRecord } from '../stats/types.ts';

interface StatsState {
  drillResults: DrillResult[];
  handRecords: HandRecord[];
  addDrillResult: (result: DrillResult) => void;
  addHandRecord: (record: HandRecord) => void;
  clearStats: () => void;
  exportStats: () => string;
  importStats: (json: string) => void;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      drillResults: [],
      handRecords: [],
      addDrillResult: (result) => set((s) => ({ drillResults: [...s.drillResults, result] })),
      addHandRecord: (record) => set((s) => ({ handRecords: [...s.handRecords, record] })),
      clearStats: () => set({ drillResults: [], handRecords: [] }),
      exportStats: () => JSON.stringify({ drillResults: get().drillResults, handRecords: get().handRecords }),
      importStats: (json) => {
        const data = JSON.parse(json);
        set({ drillResults: data.drillResults ?? [], handRecords: data.handRecords ?? [] });
      },
    }),
    { name: 'floating-bridge-stats' },
  ),
);
