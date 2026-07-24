import React from 'react';
import { Clock, Zap, Flame, Gauge, BarChart2 } from 'lucide-react';
import { WatchMetrics } from '../../audio/ProAudioEngine';

interface MetricsGridProps {
  metrics: WatchMetrics;
  isRunning: boolean;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, isRunning }) => {
  const absRate = Math.abs(metrics.rateSd);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-[#0a0c10]">
      {/* 1. RATE DRIFT (s/d) */}
      <div className="bg-pro-card border border-pro-border rounded-2xl p-4 flex flex-col justify-between shadow-card-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between text-xs text-pro-muted font-bold">
          <span className="flex items-center gap-1.5 text-pro-amber">
            <Clock className="w-4 h-4" /> RATE DRIFT
          </span>
          <span className="text-[10px] text-pro-dim font-mono">s/day</span>
        </div>
        <div className="my-2 text-center">
          <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-white glow-cyan">
            {isRunning ? (metrics.rateSd > 0 ? `+${metrics.rateSd.toFixed(1)}` : metrics.rateSd.toFixed(1)) : '---'}
          </span>
        </div>
        <div className="text-[10px] text-center text-pro-muted font-extrabold uppercase">
          {isRunning ? (absRate <= 4 ? 'CHRONOMETER GRADE' : absRate <= 12 ? 'ACCEPTABLE DRIFT' : 'NEEDS REGULATION') : 'NO SIGNAL'}
        </div>
      </div>

      {/* 2. BEAT ERROR (ms) */}
      <div className="bg-pro-card border border-pro-border rounded-2xl p-4 flex flex-col justify-between shadow-card-shadow relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-pro-muted font-bold">
          <span className="flex items-center gap-1.5 text-pro-cyan">
            <Zap className="w-4 h-4" /> BEAT ERROR
          </span>
          <span className="text-[10px] text-pro-dim font-mono">ms</span>
        </div>
        <div className="my-2 text-center">
          <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-pro-cyan glow-cyan">
            {isRunning ? metrics.beatErrorMs.toFixed(1) : '---'}
          </span>
        </div>
        <div className="text-[10px] text-center text-pro-muted font-extrabold uppercase">
          {isRunning ? (metrics.beatErrorMs <= 0.4 ? 'BALANCED ESCAPEMENT' : 'ASYMMETRIC PALLET') : 'NO SIGNAL'}
        </div>
      </div>

      {/* 3. AMPLITUDE (deg) */}
      <div className="bg-pro-card border border-pro-border rounded-2xl p-4 flex flex-col justify-between shadow-card-shadow relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-pro-muted font-bold">
          <span className="flex items-center gap-1.5 text-pro-purple">
            <Flame className="w-4 h-4" /> AMPLITUDE
          </span>
          <span className="text-[10px] text-pro-dim font-mono">deg (°)</span>
        </div>
        <div className="my-2 text-center">
          <span className="text-3xl md:text-4xl font-black font-mono tracking-tight text-pro-purple glow-purple">
            {isRunning ? `${metrics.amplitudeDeg}°` : '---'}
          </span>
        </div>
        <div className="text-[10px] text-center text-pro-muted font-extrabold uppercase">
          {isRunning ? 'BALANCE SWING' : 'NO SIGNAL'}
        </div>
      </div>

      {/* 4. FREQUENCY (VPH) */}
      <div className="bg-pro-card border border-pro-border rounded-2xl p-4 flex flex-col justify-between shadow-card-shadow relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-pro-muted font-bold">
          <span className="flex items-center gap-1.5 text-pro-green">
            <Gauge className="w-4 h-4" /> FREQUENCY
          </span>
          <span className="text-[10px] text-pro-dim font-mono">VPH</span>
        </div>
        <div className="my-2 text-center">
          <span className="text-2xl md:text-3xl font-black font-mono tracking-tight text-white">
            {metrics.detectedVph.toLocaleString()}
          </span>
        </div>
        <div className="text-[10px] text-center text-pro-muted font-extrabold uppercase">
          {(metrics.detectedVph / 3600).toFixed(1)} Hz / {(metrics.detectedVph / 3600 * 2).toFixed(0)} Ticks/s
        </div>
      </div>

      {/* 5. SIGNAL QUALITY METER */}
      <div className="bg-pro-card border border-pro-border rounded-2xl p-4 flex flex-col justify-between shadow-card-shadow col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-xs text-pro-muted font-bold">
          <span className="flex items-center gap-1.5 text-pro-cyan">
            <BarChart2 className="w-4 h-4" /> ACOUSTIC SIGNAL
          </span>
          <span className="text-[10px] text-pro-dim font-mono">{Math.round(metrics.signalLevel * 100)}%</span>
        </div>

        {/* LED Segment Bar */}
        <div className="my-2 flex items-center gap-1 h-6 bg-[#0d0f14] p-1 rounded-lg border border-pro-border/60">
          {Array.from({ length: 12 }).map((_, idx) => {
            const threshold = (idx + 1) / 12;
            const isActive = isRunning && metrics.signalLevel >= threshold;
            let barColor = 'bg-pro-cyan shadow-cyan-glow';
            if (idx >= 8) barColor = 'bg-pro-purple shadow-purple-glow';
            if (idx >= 10) barColor = 'bg-pro-red';

            return (
              <div
                key={idx}
                className={`h-full flex-1 rounded-sm transition-all duration-75 ${
                  isActive ? barColor : 'bg-pro-border/40 opacity-30'
                }`}
              />
            );
          })}
        </div>
        <div className="text-[10px] text-center text-pro-muted font-extrabold uppercase">
          {metrics.tickCount > 0 ? `${metrics.tickCount} TICKS LOGGED` : 'LISTEN FOR TICKS'}
        </div>
      </div>
    </div>
  );
};
