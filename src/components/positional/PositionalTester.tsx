import React, { useState, useEffect } from 'react';
import { Compass, Play, Square, CheckCircle2, RotateCw, BarChart3, AlertCircle } from 'lucide-react';
import { WatchPosition, POSITION_LABELS } from '../dashboard/PositionalQuickBar';
import { WatchMetrics } from '../../audio/ProAudioEngine';

interface PositionalTesterProps {
  metrics: WatchMetrics;
  isRunning: boolean;
  onSavePositionalMetric: (pos: WatchPosition, data: { rateSd: number; amplitudeDeg: number; beatErrorMs: number }) => void;
  positionalData: Partial<Record<WatchPosition, { rateSd: number; amplitudeDeg: number; beatErrorMs: number }>>;
}

export const PositionalTester: React.FC<PositionalTesterProps> = ({
  metrics,
  isRunning,
  onSavePositionalMetric,
  positionalData,
}) => {
  const positions: WatchPosition[] = ['DU', 'DD', 'CD', 'CU', 'CL', 'CR'];
  const [activePos, setActivePos] = useState<WatchPosition>('DU');
  const [testTimerSec, setTestTimerSec] = useState<number>(30);
  const [remainingSec, setRemainingSec] = useState<number>(30);
  const [isTestActive, setIsTestActive] = useState<boolean>(false);

  useEffect(() => {
    let interval: number | null = null;
    if (isTestActive && remainingSec > 0) {
      interval = window.setInterval(() => {
        setRemainingSec((prev) => prev - 1);
      }, 1000);
    } else if (isTestActive && remainingSec === 0) {
      setIsTestActive(false);
      // Save data for active position
      onSavePositionalMetric(activePos, {
        rateSd: metrics.rateSd,
        amplitudeDeg: metrics.amplitudeDeg,
        beatErrorMs: metrics.beatErrorMs,
      });
    }

    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isTestActive, remainingSec, activePos, metrics, onSavePositionalMetric]);

  const handleStartTest = () => {
    setRemainingSec(testTimerSec);
    setIsTestActive(true);
  };

  const handleStopTest = () => {
    setIsTestActive(false);
  };

  // Calculate Delta Max
  const loggedEntries = Object.values(positionalData).filter(Boolean) as Array<{ rateSd: number; amplitudeDeg: number; beatErrorMs: number }>;
  let maxRateDelta = 0;
  let maxAmpDelta = 0;

  if (loggedEntries.length > 1) {
    const rates = loggedEntries.map((e) => e.rateSd);
    const amps = loggedEntries.map((e) => e.amplitudeDeg);
    maxRateDelta = Math.max(...rates) - Math.min(...rates);
    maxAmpDelta = Math.max(...amps) - Math.min(...amps);
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-pro-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
            <Compass className="w-6 h-6 text-pro-cyan" /> 6-POSITIONAL STABILITY TESTING SUITE
          </h2>
          <p className="text-xs text-pro-muted mt-1">
            Automated positional stability logging & delta variance matrix (DU, DD, CD, CU, CL, CR)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={testTimerSec}
            onChange={(e) => setTestTimerSec(Number(e.target.value))}
            className="bg-pro-card text-pro-cyan text-xs font-bold font-mono px-3 py-2 rounded-xl border border-pro-border focus:outline-none"
          >
            <option value={15}>15s SAMPLE</option>
            <option value={30}>30s STANDARD</option>
            <option value={60}>60s CHRONOMETER</option>
            <option value={300}>5-MIN STABILITY</option>
          </select>

          {!isTestActive ? (
            <button
              onClick={handleStartTest}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-pro-cyan text-black font-extrabold text-xs tracking-wider shadow-cyan-glow hover:bg-cyan-300 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START POSITION LOG</span>
            </button>
          ) : (
            <button
              onClick={handleStopTest}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-pro-red text-white font-extrabold text-xs tracking-wider transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>STOP TIMER ({remainingSec}s)</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Timer Banner */}
      {isTestActive && (
        <div className="bg-pro-purple/15 border border-pro-purple rounded-2xl p-4 flex items-center justify-between shadow-purple-glow">
          <div className="flex items-center gap-3">
            <RotateCw className="w-6 h-6 text-pro-purple animate-spin" />
            <div>
              <h4 className="text-sm font-extrabold text-white">
                TESTING POSITION: {POSITION_LABELS[activePos]}
              </h4>
              <p className="text-xs text-pro-muted">
                Hold watch steadily in position until timer expires...
              </p>
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-pro-purple">
            {remainingSec}s REMAINING
          </div>
        </div>
      )}

      {/* 6 Positional Cards Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {positions.map((pos) => {
          const data = positionalData[pos];
          const isCurrent = activePos === pos;

          return (
            <div
              key={pos}
              onClick={() => setActivePos(pos)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-card-shadow ${
                isCurrent
                  ? 'bg-pro-card border-pro-cyan shadow-cyan-glow'
                  : data
                  ? 'bg-pro-card border-pro-purple/50'
                  : 'bg-pro-card border-pro-border/60 hover:border-pro-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold font-mono text-white flex items-center gap-1.5">
                  {pos} - {POSITION_LABELS[pos]}
                </span>
                {data ? (
                  <CheckCircle2 className="w-4 h-4 text-pro-purple" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-pro-dim"></span>
                )}
              </div>

              {data ? (
                <div className="space-y-1 mt-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-pro-muted">RATE:</span>
                    <span className="text-pro-cyan font-bold">
                      {data.rateSd > 0 ? `+${data.rateSd.toFixed(1)}` : data.rateSd.toFixed(1)} s/d
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pro-muted">BEAT ERR:</span>
                    <span className="text-pro-purple font-bold">{data.beatErrorMs.toFixed(1)} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pro-muted">AMPLITUDE:</span>
                    <span className="text-white font-bold">{data.amplitudeDeg}°</span>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-pro-dim italic mt-3 text-center">
                  CLICK TO SELECT & LOG
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delta Variance Summary */}
      <div className="bg-pro-card border border-pro-border rounded-2xl p-5 shadow-card-shadow flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-pro-cyan" /> POSITIONAL DELTA SUMMARY
          </h4>
          <p className="text-xs text-pro-muted mt-0.5">
            Maximum rate and amplitude variance across all logged positions
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] text-pro-muted font-bold block">MAX RATE VARIANCE (ΔR)</span>
            <span className="text-2xl font-black font-mono text-pro-purple glow-purple">
              {maxRateDelta.toFixed(1)} s/d
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-pro-muted font-bold block">MAX AMP VARIANCE (ΔA)</span>
            <span className="text-2xl font-black font-mono text-pro-cyan glow-cyan">
              {maxAmpDelta}°
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
