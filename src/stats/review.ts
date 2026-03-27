import type { Trick, TrumpChoice } from '../engine/types.ts';
import { cardToString } from '../engine/card.ts';

export interface TrickReview {
  trickNumber: number;
  winnerId: string;
  cards: { playerId: string; cardStr: string }[];
  ledSuit: string;
}

export interface HandReviewData {
  tricks: TrickReview[];
  summary: string;
}

export function generateHandReview(
  tricks: Trick[],
  trump: TrumpChoice,
  declarerId: string,
  partnerId: string | null,
): HandReviewData {
  const trickReviews: TrickReview[] = tricks.map((trick, i) => ({
    trickNumber: i + 1,
    winnerId: trick.winnerId ?? 'unknown',
    cards: trick.cards.map(tc => ({
      playerId: tc.playerId,
      cardStr: cardToString(tc.card),
    })),
    ledSuit: trick.ledSuit,
  }));

  let declarerTricks = 0;
  let defenderTricks = 0;
  for (const trick of tricks) {
    if (trick.winnerId === declarerId || trick.winnerId === partnerId) {
      declarerTricks++;
    } else {
      defenderTricks++;
    }
  }

  const summary = `Declaring team won ${declarerTricks} tricks, defenders won ${defenderTricks}. Trump was ${trump === 'no-trump' ? 'No Trump' : trump}.`;

  return { tricks: trickReviews, summary };
}
