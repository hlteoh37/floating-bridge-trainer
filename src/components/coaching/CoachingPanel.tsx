import type { CoachingAdvice } from '../../stats/types.ts';

interface CoachingPanelProps {
  advice: CoachingAdvice | null;
  visible: boolean;
  onToggle: () => void;
}

const CONFIDENCE_COLORS = {
  high: 'text-green-400',
  medium: 'text-yellow-400',
  low: 'text-red-400',
};

export function CoachingPanel({ advice, visible, onToggle }: CoachingPanelProps) {
  return (
    <div className="hidden md:block w-72 bg-gray-800 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">Coach</h3>
        <button className="text-sm text-gray-400 hover:text-white" onClick={onToggle}>
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>

      {visible && advice && (
        <div className="space-y-3">
          <div>
            <span className="text-gray-400 text-sm">Suggestion:</span>
            <div className={`font-bold text-lg ${CONFIDENCE_COLORS[advice.confidence]}`}>
              {advice.action}
            </div>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Why:</span>
            <p className="text-gray-200 text-sm mt-1">{advice.explanation}</p>
          </div>
          <div className="text-xs text-gray-500">
            Confidence: {advice.confidence}
          </div>
        </div>
      )}

      {visible && !advice && (
        <p className="text-gray-400 text-sm">Waiting for your turn...</p>
      )}
    </div>
  );
}
