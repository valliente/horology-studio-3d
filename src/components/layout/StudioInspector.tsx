import React from 'react';
import { Watch, Compass, Sliders, FileText } from 'lucide-react';
import { WatchMetrics, ProDSPConfig } from '../../audio/ProAudioEngine';

interface StudioInspectorProps {
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

export const StudioInspector: React.FC<StudioInspectorProps> = ({
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
    <aside className="w-80 bg-[#111216] border-l border-ent-border flex flex-col p-4 space-y-4 overflow-y-auto select-none z-20 shrink-0">
      {/* Inspector Title */}
      <div className="flex items-center justify-between border-b border-ent-border/60 pb-3">
        <h3 className="text-xs font-extrabold tracking-wider text-ent-muted uppercase flex items-center gap-2">
          <Watch className="w-4 h-4 text-ent-cyan" /> INSPECTOR & TELEMETRY
        </h3>
        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-ent-card border border-ent-border text-ent-cyan">
          LIVE
        </span>
      </div>

      {/* 1. WATCH METADATA CARD */}
      <div className="bg-ent-card border border-ent-border/80 rounded-2xl p-4 space-y-3 shadow-card-shadow">
        <div className="text-[11px] font-extrabold text-white flex items-center justify-between">
          <span>MOVEMENT SPECS</span>
          <span className="text-[10px] text-ent-purple font-mono font-bold">{tag}</span>
        </div>

        <div className="space-y-2.5">
          <div>
            <label className="text-[10px] text-ent-muted font-bold block mb-1">BRAND / MAKE</label>
            <input
              type="text"
              value={watchMake}
              onChange={(e) => onUpdateWatchInfo({ watchMake: e.target.value })}
              className="w-full bg-[#0A0B0E] border border-ent-border rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-ent-cyan"
            />
          </div>

          <div>
            <label className="text-[10px] text-ent-muted font-bold block mb-1">MODEL / REFERENCE</label>
            <input
              type="text"
              value={watchModel}
              onChange={(e) => onUpdateWatchInfo({ watchModel: e.target.value })}
              className="w-full bg-[#0A0B0E] border border-ent-border rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-ent-cyan"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-ent-muted font-bold block mb-1">CALIBER</label>
              <input
                type="text"
                value={caliber}
                onChange={(e) => onUpdateWatchInfo({ caliber: e.target.value })}
                className="w-full bg-[#0A0B0E] border border-ent-border rounded-xl px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-ent-cyan font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-ent-muted font-bold block mb-1">SERIAL NO.</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => onUpdateWatchInfo({ serialNumber: e.target.value })}
                className="w-full bg-[#0A0B0E] border border-ent-border rounded-xl px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-ent-cyan font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-ent-border/60 flex items-center justify-between">
          <span className="text-xs text-ent-muted font-medium">LIFT ANGLE:</span>
          <select
            value={config.liftAngleDeg}
            onChange={(e) => onUpdateConfig({ liftAngleDeg: Number(e.target.value) })}
            className="bg-[#0A0B0E] text-ent-amber text-xs font-bold font-mono px-2.5 py-1 rounded-lg border border-ent-border focus:outline-none"
          >
            {[48, 50, 52, 53, 54, 56, 58].map((angle) => (
              <option key={angle} value={angle}>
                {angle}° (STD)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. POSITIONAL DELTA SUMMARY CARD */}
      <div className="bg-ent-card border border-ent-border/80 rounded-2xl p-4 space-y-2.5 shadow-card-shadow">
        <div className="flex items-center justify-between text-xs font-bold text-white">
          <span className="flex items-center gap-1.5 text-ent-purple">
            <Compass className="w-3.5 h-3.5" /> POSITIONAL DELTA
          </span>
          <span className="text-[10px] text-ent-cyan font-mono font-extrabold">6-POS</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center pt-1">
          <div className="bg-[#0A0B0E] p-2.5 rounded-xl border border-ent-border/60">
            <span className="text-[10px] text-ent-muted block font-bold">MAX RATE Δ</span>
            <span className="text-sm font-black font-mono text-ent-purple glow-purple">
              4.2 s/d
            </span>
          </div>
          <div className="bg-[#0A0B0E] p-2.5 rounded-xl border border-ent-border/60">
            <span className="text-[10px] text-ent-muted block font-bold">MAX AMP Δ</span>
            <span className="text-sm font-black font-mono text-ent-cyan glow-cyan">
              22°
            </span>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE DSP ENGINE STATUS */}
      <div className="bg-ent-card border border-ent-border/80 rounded-2xl p-4 space-y-2 shadow-card-shadow">
        <div className="flex items-center justify-between text-xs font-bold text-white">
          <span className="flex items-center gap-1.5 text-ent-cyan">
            <Sliders className="w-3.5 h-3.5" /> DSP PIPELINE
          </span>
          <span className="text-[10px] text-ent-green font-mono font-bold">192 kHz</span>
        </div>

        <div className="text-xs space-y-1.5 text-ent-muted font-mono pt-1">
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
            <span className="text-ent-green font-bold">{config.gainBoost.toFixed(1)}x</span>
          </div>
          <div className="flex justify-between">
            <span>NOISE FLOOR:</span>
            <span className="text-ent-amber font-bold">{metrics.noiseFloorRms.toFixed(3)} RMS</span>
          </div>
        </div>
      </div>

      {/* 4. PDF CERTIFICATE EXPORTER BUTTON */}
      <div className="pt-2">
        <button
          onClick={onGenerateReport}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-ent-purple via-purple-600 to-ent-cyan text-white font-extrabold text-xs tracking-wider shadow-purple-glow hover:opacity-90 transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>GENERATE PDF CERTIFICATE</span>
        </button>
      </div>
    </aside>
  );
};
