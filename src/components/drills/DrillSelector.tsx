export type DrillId = 'bidding' | 'trick-taking' | 'partner-calling' | 'card-counting';

interface DrillSelectorProps {
  onSelect: (drill: DrillId) => void;
}

const DRILLS: { id: DrillId; title: string; description: string }[] = [
  { id: 'bidding', title: 'Bidding', description: 'Practice evaluating hands and making bids' },
  { id: 'trick-taking', title: 'Trick Taking', description: 'Choose the best card to play' },
  { id: 'partner-calling', title: 'Partner Calling', description: 'Pick the best card to call' },
  { id: 'card-counting', title: 'Card Counting', description: 'Track played cards' },
];

export function DrillSelector({ onSelect }: DrillSelectorProps) {
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center">Drills</h2>
      {DRILLS.map(({ id, title, description }) => (
        <button
          key={id}
          className="w-full bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-left transition-colors"
          onClick={() => onSelect(id)}
        >
          <div className="font-bold text-lg">{title}</div>
          <div className="text-gray-400 text-sm">{description}</div>
        </button>
      ))}
    </div>
  );
}
