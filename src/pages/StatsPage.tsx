import { useStatsStore } from '../stores/stats-store.ts';
import { Button } from '../components/common/Button.tsx';
import type { DrillType } from '../stats/types.ts';

const DRILL_LABELS: Record<DrillType, string> = {
  'bidding': 'Bidding',
  'trick-taking': 'Trick Taking',
  'partner-calling': 'Partner Calling',
  'card-counting': 'Card Counting',
};

export function StatsPage() {
  const { drillResults, handRecords, clearStats, exportStats, importStats } = useStatsStore();

  const drillTypes: DrillType[] = ['bidding', 'trick-taking', 'partner-calling', 'card-counting'];
  const drillAccuracy = drillTypes.map(type => {
    const results = drillResults.filter(r => r.type === type);
    const correct = results.filter(r => r.correct).length;
    const total = results.length;
    return { type, correct, total, pct: total > 0 ? Math.round((correct / total) * 100) : 0 };
  });

  const totalHands = handRecords.length;
  const declarerHands = handRecords.filter(r => !r.wasDefender);
  const defenderHands = handRecords.filter(r => r.wasDefender);
  const declarerWins = declarerHands.filter(r => r.made).length;
  const defenderWins = defenderHands.filter(r => !r.made).length;
  const overallWinRate = totalHands > 0
    ? Math.round(((declarerWins + defenderWins) / totalHands) * 100)
    : 0;

  const handleExport = () => {
    const json = exportStats();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'floating-bridge-stats.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        importStats(reader.result as string);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center">Stats</h2>

      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="font-bold text-lg mb-3">Overall</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{totalHands}</div>
            <div className="text-xs text-gray-400">Hands Played</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{overallWinRate}%</div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{drillResults.length}</div>
            <div className="text-xs text-gray-400">Drills Done</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="font-bold text-lg mb-3">Win Rate</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-white">
              {declarerHands.length > 0 ? Math.round((declarerWins / declarerHands.length) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-400">As Declarer ({declarerWins}/{declarerHands.length})</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">
              {defenderHands.length > 0 ? Math.round((defenderWins / defenderHands.length) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-400">As Defender ({defenderWins}/{defenderHands.length})</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="font-bold text-lg mb-3">Drill Accuracy</h3>
        <div className="space-y-3">
          {drillAccuracy.map(({ type, correct, total, pct }) => (
            <div key={type}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{DRILL_LABELS[type]}</span>
                <span className="text-gray-400">{correct}/{total} ({pct}%)</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {drillResults.length > 10 && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="font-bold text-lg mb-3">Areas to Improve</h3>
          {(() => {
            const weakest = drillAccuracy.filter(d => d.total >= 3).sort((a, b) => a.pct - b.pct);
            if (weakest.length === 0) return <p className="text-gray-400 text-sm">Complete more drills to see insights.</p>;
            const worst = weakest[0];
            return (
              <p className="text-gray-300 text-sm">
                Focus on <span className="font-bold text-yellow-400">{DRILL_LABELS[worst.type]}</span> — your accuracy is {worst.pct}% ({worst.correct}/{worst.total}).
              </p>
            );
          })()}
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <Button size="sm" variant="secondary" onClick={handleExport}>Export Stats</Button>
        <Button size="sm" variant="secondary" onClick={handleImport}>Import Stats</Button>
        <Button size="sm" variant="danger" onClick={clearStats}>Clear Stats</Button>
      </div>
    </div>
  );
}
