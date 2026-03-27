import { useState } from 'react';
import { DrillSelector, type DrillId } from '../components/drills/DrillSelector.tsx';
import { BiddingDrill } from '../components/drills/BiddingDrill.tsx';
import { TrickTakingDrill } from '../components/drills/TrickTakingDrill.tsx';
import { PartnerCallingDrill } from '../components/drills/PartnerCallingDrill.tsx';
import { CardCountingDrill } from '../components/drills/CardCountingDrill.tsx';
import { Button } from '../components/common/Button.tsx';

export function DrillsPage() {
  const [activeDrill, setActiveDrill] = useState<DrillId | null>(null);

  if (!activeDrill) {
    return <DrillSelector onSelect={setActiveDrill} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Button variant="secondary" size="sm" onClick={() => setActiveDrill(null)}>
          Back to Drills
        </Button>
      </div>
      {activeDrill === 'bidding' && <BiddingDrill />}
      {activeDrill === 'trick-taking' && <TrickTakingDrill />}
      {activeDrill === 'partner-calling' && <PartnerCallingDrill />}
      {activeDrill === 'card-counting' && <CardCountingDrill />}
    </div>
  );
}
