import { Button } from '../common/Button.tsx';

interface DrillFeedbackProps {
  correct: boolean;
  explanation: string;
  onNext: () => void;
}

export function DrillFeedback({ correct, explanation, onNext }: DrillFeedbackProps) {
  return (
    <div className={`rounded-xl p-4 ${correct ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
      <div className={`font-bold text-lg mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
        {correct ? 'Correct!' : 'Not quite'}
      </div>
      <p className="text-gray-200 text-sm mb-3">{explanation}</p>
      <Button onClick={onNext} size="sm">Next</Button>
    </div>
  );
}
