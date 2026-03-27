import type { Contract } from '../../engine/types.ts';

const TRUMP_DISPLAY: Record<string, string> = { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠', 'no-trump': 'NT' };

interface ContractInfoProps { contract: Contract | null; declarerTeamTricks: number; defenderTeamTricks: number; trickNumber: number; }

export function ContractInfo({ contract, declarerTeamTricks, defenderTeamTricks, trickNumber }: ContractInfoProps) {
  if (!contract) return null;
  const needed = 6 + contract.bid.level;
  return (
    <div className="flex gap-4 items-center justify-center text-sm bg-gray-800 rounded-lg px-4 py-2">
      <div><span className="text-gray-400">Contract: </span><span className="font-bold text-white">{contract.bid.level}{TRUMP_DISPLAY[contract.bid.trump]}</span></div>
      <div><span className="text-gray-400">Need: </span><span className="font-bold text-white">{needed}</span></div>
      <div><span className="text-gray-400">Declarer: </span><span className="font-bold text-green-400">{declarerTeamTricks}</span></div>
      <div><span className="text-gray-400">Defenders: </span><span className="font-bold text-red-400">{defenderTeamTricks}</span></div>
      <div><span className="text-gray-400">Trick: </span><span className="text-white">{trickNumber}/13</span></div>
    </div>
  );
}
