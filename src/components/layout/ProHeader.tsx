import React from 'react';
import { Mic, Radio, Square, Volume2, VolumeX, Shield, Activity } from 'lucide-react';
import { MicProfile } from '../../db/SessionDatabase';

interface ProHeaderProps {
  isRunning: boolean;
  isSynthetic: boolean;
  micProfiles: MicProfile[];
  selectedProfileId: number | null;
  onSelectProfile: (id: number) => void;
  monitorAudio: boolean;
  onToggleMonitor: () => void;
  onStartMic: () => void;
  onStartSynth: () => void;
  onStop: () => void;
}

export const ProHeader: React.FC<ProHeaderProps> = ({
  isRunning,
  isSynthetic,
  micProfiles,
  selectedProfileId,
  onSelectProfile,
  monitorAudio,
  onToggleMonitor,
  onStartMic,
  onStartSynth,
  onStop,
}) => {
  return (
    <header className="w-full bg-[#10131b] border-b border-pro-border px-5 py-3 flex flex-wrap items-center justify-between gap-4 select-none z-20 shrink-0">
      {/* Mic Profile Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#0c0e14] px-3 py-1.5 rounded-xl border border-pro-border">
          <Mic className="w-4 h-4 text-pro-cyan" />
          <span className="text-xs font-bold text-pro-muted">PROFILE:</span>
          <select
            value={selectedProfileId || ''}
            onChange={(e) => onSelectProfile(Number(e.target.value))}
            className="bg-transparent text-white text-xs font-bold font-sans focus:outline-none cursor-pointer"
          >
            {micProfiles.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#161a23] text-white">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Headphone Audio Monitor Toggle */}
        <button
          onClick={onToggleMonitor}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            monitorAudio
              ? 'bg-pro-cyan/20 border-pro-cyan text-pro-cyan shadow-cyan-glow'
              : 'bg-[#0c0e14] border-pro-border text-pro-muted hover:text-white'
          }`}
        >
          {monitorAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>MONITOR</span>
        </button>
      </div>

      {/* Input Action Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onStartMic}
          disabled={isRunning && !isSynthetic}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider border transition-all ${
            isRunning && !isSynthetic
              ? 'bg-pro-green/20 border-pro-green text-pro-green shadow-cyan-glow animate-pulse'
              : 'bg-pro-card border-pro-cyan/50 text-pro-cyan hover:bg-pro-cyan hover:text-black shadow-cyan-glow'
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
              ? 'bg-pro-purple/20 border-pro-purple text-pro-purple shadow-purple-glow animate-pulse'
              : 'bg-pro-card border-pro-purple/50 text-pro-purple hover:bg-pro-purple hover:text-white shadow-purple-glow'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>DEMO SYNTH</span>
        </button>

        {isRunning && (
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-pro-red/20 border border-pro-red text-pro-red hover:bg-pro-red hover:text-white transition-all"
          >
            <Square className="w-4 h-4" />
            <span>STOP</span>
          </button>
        )}
      </div>

      {/* Live Status Badge */}
      <div className="flex items-center gap-2 text-xs bg-[#0c0e14] px-3 py-1.5 rounded-xl border border-pro-border">
        <span className="text-pro-muted font-semibold">STATE:</span>
        {!isRunning ? (
          <span className="text-pro-dim font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-600"></span> IDLE
          </span>
        ) : isSynthetic ? (
          <span className="text-pro-purple font-bold flex items-center gap-1.5 glow-purple">
            <span className="w-2 h-2 rounded-full bg-pro-purple animate-ping"></span> DEMO SYNTH
          </span>
        ) : (
          <span className="text-pro-cyan font-bold flex items-center gap-1.5 glow-cyan">
            <span className="w-2 h-2 rounded-full bg-pro-cyan animate-ping"></span> LIVE MIC
          </span>
        )}
      </div>
    </header>
  );
};
