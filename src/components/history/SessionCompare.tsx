import React, { useState } from 'react';
import { GitCompare, ArrowRight, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { WatchSession } from '../../db/SessionDatabase';

interface SessionCompareProps {
  sessions: WatchSession[];
}

export const SessionCompare: React.FC<SessionCompareProps> = ({ sessions }) => {
  const [sessionAId, setSessionAId] = useState<number | null>(sessions[0]?.id || null);
  const [sessionBId, setSessionBId] = useState<number | null>(sessions[1]?.id || sessions[0]?.id || null);

  const sessionA = sessions.find((s) => s.id === sessionAId);
  const sessionB = sessions.find((s) => s.id === sessionBId);

  const rateDiff = sessionA && sessionB ? sessionB.rateSd - sessionA.rateSd : 0;
  const beatErrDiff = sessionA && sessionB ? sessionB.beatErrorMs - sessionA.beatErrorMs : 0;
  const ampDiff = sessionA && sessionB ? sessionB.amplitudeDeg - sessionA.amplitudeDeg : 0;

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto">
      {/* Title */}
      <div className="border-b border-pro-border pb-4">
        <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-pro-purple" /> SIDE-BY-SIDE SESSION COMPARISON
        </h2>
        <p className="text-xs text-pro-muted mt-1">
          Compare diagnostic performance pre-service vs post-service or across watch regulation runs
        </p>
      </div>

      {/* Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session A Selector */}
        <div className="bg-pro-card border border-pro-border rounded-2xl p-5 space-y-4 shadow-card-shadow">
          <div className="flex items-center justify-between border-b border-pro-border/60 pb-2">
            <span className="text-xs font-extrabold text-pro-cyan uppercase">SESSION A (BASELINE)</span>
            <span className="text-[10px] text-pro-muted font-mono">{sessionA?.tag || 'SELECT'}</span>
          </div>

          <select
            value={sessionAId || ''}
            onChange={(e) => setSessionAId(Number(e.target.value))}
            className="w-full bg-[#0d0f14] text-white text-xs font-bold font-mono p-3 rounded-xl border border-pro-border focus:outline-none focus:border-pro-cyan"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.watchMake} {s.watchModel} - {s.tag} ({new Date(s.timestamp).toLocaleDateString()})
              </option>
            ))}
          </select>

          {sessionA && (
            <div className="space-y-2 pt-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-pro-muted">RATE DRIFT:</span>
                <span className="text-white font-bold">{sessionA.rateSd > 0 ? `+${sessionA.rateSd}` : sessionA.rateSd} s/d</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pro-muted">BEAT ERROR:</span>
                <span className="text-pro-cyan font-bold">{sessionA.beatErrorMs.toFixed(1)} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pro-muted">AMPLITUDE:</span>
                <span className="text-pro-purple font-bold">{sessionA.amplitudeDeg}°</span>
              </div>
            </div>
          )}
        </div>

        {/* Session B Selector */}
        <div className="bg-pro-card border border-pro-border rounded-2xl p-5 space-y-4 shadow-card-shadow">
          <div className="flex items-center justify-between border-b border-pro-border/60 pb-2">
            <span className="text-xs font-extrabold text-pro-purple uppercase">SESSION B (COMPARISON)</span>
            <span className="text-[10px] text-pro-muted font-mono">{sessionB?.tag || 'SELECT'}</span>
          </div>

          <select
            value={sessionBId || ''}
            onChange={(e) => setSessionBId(Number(e.target.value))}
            className="w-full bg-[#0d0f14] text-white text-xs font-bold font-mono p-3 rounded-xl border border-pro-border focus:outline-none focus:border-pro-purple"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.watchMake} {s.watchModel} - {s.tag} ({new Date(s.timestamp).toLocaleDateString()})
              </option>
            ))}
          </select>

          {sessionB && (
            <div className="space-y-2 pt-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-pro-muted">RATE DRIFT:</span>
                <span className="text-white font-bold">{sessionB.rateSd > 0 ? `+${sessionB.rateSd}` : sessionB.rateSd} s/d</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pro-muted">BEAT ERROR:</span>
                <span className="text-pro-cyan font-bold">{sessionB.beatErrorMs.toFixed(1)} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pro-muted">AMPLITUDE:</span>
                <span className="text-pro-purple font-bold">{sessionB.amplitudeDeg}°</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delta Comparison Card */}
      {sessionA && sessionB && (
        <div className="bg-pro-card border border-pro-purple/40 rounded-2xl p-5 shadow-purple-glow space-y-4">
          <h3 className="text-xs font-extrabold text-pro-purple uppercase tracking-wider flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-pro-purple" /> DIAGNOSTIC DELTA SUMMARY (B vs A)
          </h3>

          <div className="grid grid-cols-3 gap-4 text-center font-mono">
            <div className="bg-[#0d0f14] p-3 rounded-xl border border-pro-border">
              <span className="text-[10px] text-pro-muted block font-bold">RATE DRIFT Δ</span>
              <span className="text-lg font-black text-white">
                {rateDiff > 0 ? `+${rateDiff.toFixed(1)}` : rateDiff.toFixed(1)} s/d
              </span>
            </div>

            <div className="bg-[#0d0f14] p-3 rounded-xl border border-pro-border">
              <span className="text-[10px] text-pro-muted block font-bold">BEAT ERROR Δ</span>
              <span className="text-lg font-black text-pro-cyan">
                {beatErrDiff > 0 ? `+${beatErrDiff.toFixed(1)}` : beatErrDiff.toFixed(1)} ms
              </span>
            </div>

            <div className="bg-[#0d0f14] p-3 rounded-xl border border-pro-border">
              <span className="text-[10px] text-pro-muted block font-bold">AMPLITUDE Δ</span>
              <span className="text-lg font-black text-pro-purple">
                {ampDiff > 0 ? `+${ampDiff}` : ampDiff}°
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
