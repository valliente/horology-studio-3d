import React from 'react';
import { Watch, Compass, Sliders, ShieldAlert, FileText, CheckCircle2, Flame, Gauge } from 'lucide-react';
import { WatchMetrics, ProDSPConfig } from '../../audio/ProAudioEngine';

interface RightInspectorProps {
  metrics: WatchMetrics;
  config: ProDSPConfig;
  watchMake: string;
  watchModel: string;
  caliber: string;
  serialNumber: string;
  tag: string;
  onUpdateWatchInfo: (info: { watchMake?: string; watchModel?: string; caliber?: string; serialNumber?: string; tag?: string }) => void;
  onUpdateConfig: (newConfig: Partial<ProDSPConfig>) => void;
  onGenerateReport: () => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  metrics,
  config,
  watchMake,
  watchModel,
  caliber,
  serialNumber,
  tag,
  onUpdateWatchInfo,
  onUpdateConfig,
  onGenerateReport,
}) => {
  return (
    <aside className="w-80 bg-[#10131b] border-l border-pro-border flex flex-col p-4 space-y-4 overflow-y-auto select-none z-20 shrink-0">
      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-pro-border/60 pb-3">
        <h3 className="text-xs font-extrabold tracking-wider text-pro-muted uppercase flex items-center gap-2">
          <Watch className="w-4 h-4 text-pro-cyan" /> INSPECTOR & METRICS
        </h3>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pro-card border border-pro-border text-pro-cyan">
          LIVE
        </span>
      </div>

      {/* 1. WATCH CALIBER SPECIFICATIONS CARD */}
      <div className="bg-pro-card border border-pro-border rounded-xl p-3.5 space-y-2.5 shadow-card-shadow">
        <div className="text-[11px] font-extrabold text-white flex items-center justify-between">
          <span>WATCH METADATA</span>
          <span className="text-[10px] text-pro-purple font-mono font-bold">{tag}</span>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-pro-muted font-bold block mb-1">MAKE / BRAND</label>
            <input
              type="text"
              value={watchMake}
              onChange={(e) => onUpdateWatchInfo({ watchMake: e.target.value })}
              className="w-full bg-[#0d0f14] border border-pro-border rounded-lg px-2.5 py-1 text-xs text-white font-semibold focus:outline-none focus:border-pro-cyan"
            />
          </div>

          <div>
            <label className="text-[10px] text-pro-muted font-bold block mb-1">MODEL / REFERENCE</label>
            <input
              type="text"
              value={watchModel}
              onChange={(e) => onUpdateWatchInfo({ watchModel: e.target.value })}
              className="w-full bg-[#0d0f14] border border-pro-border rounded-lg px-2.5 py-1 text-xs text-white font-semibold focus:outline-none focus:border-pro-cyan"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-pro-muted font-bold block mb-1">CALIBER</label>
              <input
                type="text"
                value={caliber}
                onChange={(e) => onUpdateWatchInfo({ caliber: e.target.value })}
                className="w-full bg-[#0d0f14] border border-pro-border rounded-lg px-2 py-1 text-xs text-white font-semibold focus:outline-none focus:border-pro-cyan font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-pro-muted font-bold block mb-1">SERIAL NO.</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => onUpdateWatchInfo({ serialNumber: e.target.value })}
                className="w-full bg-[#0d0f14] border border-pro-border rounded-lg px-2 py-1 text-xs text-white font-semibold focus:outline-none focus:border-pro-cyan font-mono"
              />
            </div>
          </div>
        </div>

        {/* Lift Angle & Target VPH */}
        <div className="pt-2 border-t border-pro-border/60 flex items-center justify-between">
          <span className="text-xs text-pro-muted font-medium">LIFT ANGLE:</span>
          <select
            value={config.liftAngleDeg}
            onChange={(e) => onUpdateConfig({ liftAngleDeg: Number(e.target.value) })}
            className="bg-[#0d0f14] text-pro-amber text-xs font-bold font-mono px-2 py-1 rounded border border-pro-border focus:outline-none"
          >
            {[48, 50, 52, 53, 54, 56, 58].map((angle) => (
              <option key={angle} value={angle}>
                {angle}° (STD)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. CHRONOMETRIC POSITIONAL DELTA CARD */}
      <div className="bg-pro-card border border-pro-border rounded-xl p-3.5 space-y-2 shadow-card-shadow">
        <div className="flex items-center justify-between text-xs font-bold text-white">
          <span className="flex items-center gap-1.5 text-pro-purple">
            <Compass className="w-3.5 h-3.5" /> POSITIONAL VARIANCE
          </span>
          <span className="text-[10px] text-pro-cyan font-mono font-extrabold">6-POS</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center pt-1">
          <div className="bg-[#0d0f14] p-2 rounded-lg border border-pro-border/50">
            <span className="text-[10px] text-pro-muted block font-bold">MAX RATE Δ</span>
            <span className="text-sm font-black font-mono text-pro-purple glow-purple">
              4.8 s/d
            </span>
          </div>
          <div className="bg-[#0d0f14] p-2 rounded-lg border border-pro-border/50">
            <span className="text-[10px] text-pro-muted block font-bold">MAX AMP Δ</span>
            <span className="text-sm font-black font-mono text-pro-cyan glow-cyan">
              24°
            </span>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE DSP CONFIG CARD */}
      <div className="bg-pro-card border border-pro-border rounded-xl p-3.5 space-y-2 shadow-card-shadow">
        <div className="flex items-center justify-between text-xs font-bold text-white">
          <span className="flex items-center gap-1.5 text-pro-cyan">
            <Sliders className="w-3.5 h-3.5" /> DSP STAGE STATUS
          </span>
          <span className="text-[10px] text-pro-green font-mono font-bold">ACTIVE</span>
        </div>

        <div className="text-xs space-y-1.5 text-pro-muted font-mono pt-1">
          <div className="flex justify-between">
            <span>HP CUTOFF:</span>
            <span className="text-white font-bold">{config.highPassCutoff} Hz</span>
          </div>
          <div className="flex justify-between">
            <span>LP CUTOFF:</span>
            <span className="text-white font-bold">{config.lowPassCutoff} Hz</span>
          </div>
          <div className="flex justify-between">
            <span>GAIN BOOST:</span>
            <span className="text-pro-green font-bold">{config.gainBoost.toFixed(1)}x</span>
          </div>
          <div className="flex justify-between">
            <span>NOISE FLOOR:</span>
            <span className="text-pro-amber font-bold">{metrics.noiseFloorRms.toFixed(3)} RMS</span>
          </div>
        </div>
      </div>

      {/* 4. ACTIONS & PDF REPORT GENERATION */}
      <div className="pt-2">
        <button
          onClick={onGenerateReport}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pro-purple via-purple-600 to-pro-cyan text-white font-extrabold text-xs tracking-wider shadow-purple-glow hover:opacity-90 transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>GENERATE SERVICE REPORT</span>
        </button>
      </div>
    </aside>
  );
};
