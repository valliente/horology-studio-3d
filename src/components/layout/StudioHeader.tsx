import React from 'react';
import { Mic, Radio, Square, Volume2, VolumeX, Disc, Shield } from 'lucide-react';
import { WatchProfile } from '../../db/EnterpriseDatabase';

interface StudioHeaderProps {
  isRunning: boolean;
  isSynthetic: boolean;
  profiles: WatchProfile[];
  selectedProfileId: number | null;
  onSelectProfile: (id: number) => void;
  monitorAudio: boolean;
  onToggleMonitor: () => void;
  onStartMic: () => void;
  onStartSynth: () => void;
  onRecordWav: () => void;
  onStop: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  isRunning,
  isSynthetic,
  profiles,
  selectedProfileId,
  onSelectProfile,
  monitorAudio,
  onToggleMonitor,
  onStartMic,
  onStartSynth,
  onRecordWav,
  onStop,
}) => {
  return (
    <header className="w-full bg-[#14161E] border-b border-ent-border px-6 py-3 flex flex-wrap items-center justify-between gap-4 select-none z-20 shrink-0">
      {/* Profile Selector & Audio Monitor */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#0A0B0E] px-3.5 py-1.5 rounded-xl border border-ent-border">
          <Mic className="w-4 h-4 text-ent-cyan" />
          <span className="text-xs font-bold text-ent-muted">MOVEMENT:</span>
          <select
            value={selectedProfileId || ''}
            onChange={(e) => onSelectProfile(Number(e.target.value))}
            className="bg-transparent text-white text-xs font-bold font-sans focus:outline-none cursor-pointer"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#14161E] text-white">
                {p.brand} {p.model} ({p.caliber})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onToggleMonitor}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            monitorAudio
              ? 'bg-ent-cyan/20 border-ent-cyan text-ent-cyan shadow-cyan-glow'
              : 'bg-[#0A0B0E] border-ent-border text-ent-muted hover:text-white'
          }`}
        >
          {monitorAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>MONITOR</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onStartMic}
          disabled={isRunning && !isSynthetic}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider border transition-all ${
            isRunning && !isSynthetic
              ? 'bg-ent-green/20 border-ent-green text-ent-green shadow-cyan-glow animate-pulse'
              : 'bg-ent-card border-ent-cyan/50 text-ent-cyan hover:bg-ent-cyan hover:text-black shadow-cyan-glow'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>MIC INPUT</span>
        </button>

        <button
          onClick={onStartSynth}
          disabled={isRunning && isSynthetic}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider border transition-all ${
            isRunning && isSynthetic
              ? 'bg-ent-purple/20 border-ent-purple text-ent-purple shadow-purple-glow animate-pulse'
              : 'bg-ent-card border-ent-purple/50 text-ent-purple hover:bg-ent-purple hover:text-white shadow-purple-glow'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>DEMO SYNTH</span>
        </button>

        {isRunning && (
          <button
            onClick={onRecordWav}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-ent-amber/20 border border-ent-amber text-ent-amber hover:bg-ent-amber hover:text-black transition-all shadow-amber-glow"
          >
            <Disc className="w-4 h-4" />
            <span>REC 10S WAV</span>
          </button>
        )}

        {isRunning && (
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-ent-red/20 border border-ent-red text-ent-red hover:bg-ent-red hover:text-white transition-all"
          >
            <Square className="w-4 h-4" />
            <span>STOP</span>
          </button>
        )}
      </div>

      {/* Status Badge & Blue PRO Badge (Directive from ac6597f9ca9857740d4b2b5ee17ddc45.jpg) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs bg-[#0A0B0E] px-3.5 py-1.5 rounded-xl border border-ent-border">
          <span className="text-ent-muted font-semibold">STATUS:</span>
          {!isRunning ? (
            <span className="text-ent-dim font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-600"></span> IDLE
            </span>
          ) : isSynthetic ? (
            <span className="text-ent-purple font-bold flex items-center gap-1.5 glow-purple">
              <span className="w-2 h-2 rounded-full bg-ent-purple animate-ping"></span> DEMO SYNTH
            </span>
          ) : (
            <span className="text-ent-cyan font-bold flex items-center gap-1.5 glow-cyan">
              <span className="w-2 h-2 rounded-full bg-ent-cyan animate-ping"></span> LIVE MIC
            </span>
          )}
        </div>

        {/* Glowing Blue PRO badge from reference image */}
        <span className="px-3 py-1 rounded-xl text-xs font-black bg-ent-blue text-white shadow-blue-glow tracking-widest uppercase">
          PRO
        </span>
      </div>
    </header>
  );
};
