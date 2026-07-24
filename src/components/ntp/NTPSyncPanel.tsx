import React, { useState } from 'react';
import { Globe, RefreshCw, ShieldCheck, Cpu, Clock, CheckCircle2 } from 'lucide-react';
import { NTPSyncService, NTPSyncStatus } from '../../utils/ntpSync';

const ntpService = new NTPSyncService();

export const NTPSyncPanel: React.FC = () => {
  const [ntpStatus, setNtpStatus] = useState<NTPSyncStatus>(ntpService.getStatus());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleSync = async () => {
    setIsSyncing(true);
    const updated = await ntpService.sync();
    setNtpStatus(updated);
    setIsSyncing(false);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-pro-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
            <Globe className="w-6 h-6 text-pro-cyan" /> STRATUM-1 NTP TIME SYNCHRONIZATION
          </h2>
          <p className="text-xs text-pro-muted mt-1">
            High-precision network time reference for system clock drift calibration
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs tracking-wider border transition-all ${
            isSyncing
              ? 'bg-pro-purple/20 border-pro-purple text-pro-purple animate-pulse'
              : 'bg-pro-cyan text-black border-pro-cyan shadow-cyan-glow hover:bg-cyan-300'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'SYNCHRONIZING...' : 'SYNC WITH STRATUM-1'}</span>
        </button>
      </div>

      {/* NTP Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-pro-card border border-pro-border rounded-2xl p-5 shadow-card-shadow space-y-2">
          <span className="text-[10px] text-pro-muted font-bold block uppercase">ACTIVE NTP SERVER</span>
          <div className="text-base font-black text-white flex items-center gap-2 font-mono">
            <ShieldCheck className="w-5 h-5 text-pro-cyan" />
            <span>{ntpStatus.server}</span>
          </div>
          <span className="text-[10px] text-pro-cyan font-bold block">STRATUM {ntpStatus.stratum} ATOMIC CLOCK</span>
        </div>

        <div className="bg-pro-card border border-pro-border rounded-2xl p-5 shadow-card-shadow space-y-2">
          <span className="text-[10px] text-pro-muted font-bold block uppercase">ATOMIC TIME OFFSET</span>
          <div className="text-2xl font-black text-pro-purple font-mono glow-purple">
            {ntpStatus.offsetMs > 0 ? `+${ntpStatus.offsetMs}` : ntpStatus.offsetMs} ms
          </div>
          <span className="text-[10px] text-pro-muted font-bold block">SYSTEM CLOCK DRIFT CORRECTION</span>
        </div>

        <div className="bg-pro-card border border-pro-border rounded-2xl p-5 shadow-card-shadow space-y-2">
          <span className="text-[10px] text-pro-muted font-bold block uppercase">NETWORK LATENCY</span>
          <div className="text-2xl font-black text-pro-cyan font-mono glow-cyan">
            {ntpStatus.roundTripMs} ms
          </div>
          <span className="text-[10px] text-pro-muted font-bold block">ROUND-TRIP TIME</span>
        </div>
      </div>

      {/* Synchronized Banner */}
      <div className="bg-pro-card border border-pro-cyan/40 rounded-2xl p-5 flex items-center justify-between shadow-cyan-glow">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-pro-cyan" />
          <div>
            <h4 className="text-sm font-extrabold text-white">SYSTEM CLOCK SYNCHRONIZED</h4>
            <p className="text-xs text-pro-muted">Last synchronized at {ntpStatus.lastSynced}</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-pro-cyan/20 border border-pro-cyan text-pro-cyan">
          STRATUM-1 LOCKED
        </span>
      </div>
    </div>
  );
};
