import type { CoachingAdvice } from '../../stats/types.ts';

interface CoachBannerProps {
  advice: CoachingAdvice | null;
  visible: boolean;
}

export function CoachBanner({ advice, visible }: CoachBannerProps) {
  if (!visible || !advice) return null;

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 px-4 py-2 z-40">
      <div className="flex items-center gap-2">
        <span className="text-green-400 font-bold text-sm">{advice.action}</span>
        <span className="text-gray-400 text-xs truncate">{advice.explanation}</span>
      </div>
    </div>
  );
}
