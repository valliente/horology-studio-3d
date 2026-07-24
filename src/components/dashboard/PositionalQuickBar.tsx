import React from 'react';
import { Compass, CheckCircle2 } from 'lucide-react';

export type WatchPosition = 'DU' | 'DD' | 'CD' | 'CU' | 'CL' | 'CR';

export const POSITION_LABELS: Record<WatchPosition, string> = {
  DU: 'Dial Up (DU)',
  DD: 'Dial Down (DD)',
  CD: 'Crown Down (CD)',
  CU: 'Crown Up (CU)',
  CL: 'Crown Left (CL)',
  CR: 'Crown Right (CR)',
};

interface PositionalQuickBarProps {
  currentPosition: WatchPosition;
  onSelectPosition: (pos: WatchPosition) => void;
  loggedPositions: Record<WatchPosition, boolean>;
}

export const PositionalQuickBar: React.FC<PositionalQuickBarProps> = ({
  currentPosition,
  onSelectPosition,
  loggedPositions,
}) => {
  const positions: WatchPosition[] = ['DU', 'DD', 'CD', 'CU', 'CL', 'CR'];

  return (
    <div className="w-full bg-[#10131b] border-t border-pro-border px-4 py-2.5 flex items-center justify-between gap-4 select-none shrink-0">
      <div className="flex items-center gap-2 text-xs font-bold text-pro-muted">
        <Compass className="w-4 h-4 text-pro-cyan" />
        <span>ACTIVE TEST POSITION:</span>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-center max-w-2xl">
        {positions.map((pos) => {
          const isSelected = currentPosition === pos;
          const isLogged = loggedPositions[pos];

          return (
            <button
              key={pos}
              onClick={() => onSelectPosition(pos)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1 border ${
                isSelected
                  ? 'bg-pro-cyan/20 border-pro-cyan text-pro-cyan shadow-cyan-glow'
                  : isLogged
                  ? 'bg-pro-purple/15 border-pro-purple/40 text-pro-purple'
                  : 'bg-pro-card border-pro-border text-pro-muted hover:text-white'
              }`}
            >
              <span>{pos}</span>
              {isLogged && <CheckCircle2 className="w-3 h-3 text-pro-purple" />}
            </button>
          );
        })}
      </div>

      <div className="text-[11px] font-mono text-pro-muted">
        <span className="text-pro-cyan font-bold">{POSITION_LABELS[currentPosition]}</span>
      </div>
    </div>
  );
};
