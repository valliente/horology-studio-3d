import React, { useState } from 'react';
import { Database, Search, Trash2, FileText, Download, Disc, Plus, Tag, ShieldCheck, Play } from 'lucide-react';
import { EnterpriseSession, WatchProfile } from '../../db/EnterpriseDatabase';
import { compilePDFReport } from '../../utils/pdfReportCompiler';

interface MovementDatabaseProps {
  sessions: EnterpriseSession[];
  profiles: WatchProfile[];
  onDeleteSession: (id: number) => void;
  onAddProfile: (profile: WatchProfile) => void;
}

export const MovementDatabase: React.FC<MovementDatabaseProps> = ({
  sessions,
  profiles,
  onDeleteSession,
  onAddProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'movements'>('sessions');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // New Movement Profile Form
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [caliber, setCaliber] = useState<string>('');
  const [serial, setSerial] = useState<string>('');
  const [liftAngle, setLiftAngle] = useState<number>(52);
  const [vph, setVph] = useState<number>(28800);

  const handleAddMovement = () => {
    if (!brand || !model) return;
    onAddProfile({
      brand,
      model,
      caliber,
      serialNumber: serial,
      liftAngleDeg: liftAngle,
      targetVph: vph,
    });
    setBrand('');
    setModel('');
    setCaliber('');
    setSerial('');
  };

  const handleDownloadWav = (s: EnterpriseSession) => {
    if (s.wavBlob) {
      const url = URL.createObjectURL(s.wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${s.brand}_${s.model}_Telemetry_10s.wav`;
      a.click();
    }
  };

  const filteredSessions = sessions.filter((s) =>
    s.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.caliber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto select-none">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between border-b border-ent-border pb-4 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
            <Database className="w-6 h-6 text-ent-cyan" /> MOVEMENT SPECS & WAV TELEMETRY DATABASE
          </h2>
          <p className="text-xs text-ent-muted mt-1">
            SQLite movement specs, historical chronometric runs, and 10s raw WAV audio clip archiving
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-[#14161D] p-1.5 rounded-2xl border border-ent-border">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sessions'
                ? 'bg-ent-cyan/20 border border-ent-cyan text-ent-cyan shadow-cyan-glow'
                : 'text-ent-muted hover:text-white'
            }`}
          >
            SAVED SESSIONS ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'movements'
                ? 'bg-ent-purple/20 border border-ent-purple text-ent-purple shadow-purple-glow'
                : 'text-ent-muted hover:text-white'
            }`}
          >
            MOVEMENT SPECS ({profiles.length})
          </button>
        </div>
      </div>

      {activeTab === 'sessions' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-ent-muted absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#14161D] border border-ent-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-ent-dim focus:outline-none focus:border-ent-cyan"
              />
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="bg-[#14161D] border border-ent-border rounded-2xl p-12 text-center space-y-3">
              <Database className="w-12 h-12 text-ent-dim mx-auto" />
              <h3 className="text-sm font-bold text-ent-muted">NO TELEMETRY SESSIONS STORED</h3>
              <p className="text-xs text-ent-dim max-w-sm mx-auto">
                Run a diagnostic test on the Dashboard and click REC 10S WAV to archive raw audio clips.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((s) => (
                <div
                  key={s.id}
                  className="bg-[#14161D] border border-ent-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 hover:border-ent-cyan/50 transition-all shadow-card-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[#0A0B0E] border border-ent-border text-ent-cyan">
                      <Tag className="w-5 h-5 text-ent-cyan" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white font-mono">
                          {s.brand} {s.model}
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-ent-purple/20 border border-ent-purple/40 text-ent-purple">
                          {s.tag}
                        </span>
                      </div>
                      <p className="text-xs text-ent-muted font-mono mt-0.5">
                        Caliber: {s.caliber || 'N/A'} • Serial: {s.serialNumber || 'N/A'} • {new Date(s.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-ent-dim block font-bold">RATE</span>
                      <span className="text-white font-bold">
                        {s.rateSd > 0 ? `+${s.rateSd.toFixed(1)}` : s.rateSd.toFixed(1)} s/d
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-ent-dim block font-bold">BEAT ERR</span>
                      <span className="text-ent-cyan font-bold">{s.beatErrorMs.toFixed(1)} ms</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-ent-dim block font-bold">AMPLITUDE</span>
                      <span className="text-ent-purple font-bold">{s.amplitudeDeg}°</span>
                    </div>

                    <div className="flex items-center gap-2 pl-2">
                      {s.wavBlob && (
                        <button
                          onClick={() => handleDownloadWav(s)}
                          className="p-2 rounded-xl bg-ent-amber/15 text-ent-amber border border-ent-amber/40 hover:bg-ent-amber hover:text-black transition-all"
                          title="Download 10s WAV Audio Clip"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => compilePDFReport(s)}
                        className="p-2 rounded-xl bg-ent-cyan/15 text-ent-cyan border border-ent-cyan/40 hover:bg-ent-cyan hover:text-black transition-all"
                        title="Generate PDF Certificate"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => s.id && onDeleteSession(s.id)}
                        className="p-2 rounded-xl bg-ent-red/15 text-ent-red border border-ent-red/40 hover:bg-ent-red hover:text-white transition-all"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Movement Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="bg-[#14161D] border border-ent-border rounded-2xl p-5 shadow-card-shadow space-y-3"
              >
                <div className="flex items-center justify-between border-b border-ent-border/60 pb-2">
                  <h4 className="text-sm font-extrabold text-white">
                    {p.brand} {p.model}
                  </h4>
                  <span className="text-xs font-mono font-bold text-ent-cyan bg-ent-cyan/10 px-2.5 py-0.5 rounded-lg border border-ent-cyan/30">
                    {p.caliber}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center pt-1">
                  <div className="bg-[#0A0B0E] p-2 rounded-xl border border-ent-border/50">
                    <span className="text-[10px] text-ent-muted block font-bold">TARGET VPH</span>
                    <span className="text-white font-bold">{p.targetVph.toLocaleString()}</span>
                  </div>
                  <div className="bg-[#0A0B0E] p-2 rounded-xl border border-ent-border/50">
                    <span className="text-[10px] text-ent-muted block font-bold">LIFT ANGLE</span>
                    <span className="text-ent-amber font-bold">{p.liftAngleDeg}°</span>
                  </div>
                  <div className="bg-[#0A0B0E] p-2 rounded-xl border border-ent-border/50">
                    <span className="text-[10px] text-ent-muted block font-bold">SERIAL NO</span>
                    <span className="text-ent-purple font-bold">{p.serialNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Movement Form */}
          <div className="bg-[#14161D] border border-ent-border rounded-2xl p-5 space-y-4 shadow-card-shadow">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-ent-cyan" /> REGISTER NEW MOVEMENT CALIBER
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] text-ent-muted font-bold block mb-1">BRAND</label>
                <input
                  type="text"
                  placeholder="e.g. Grand Seiko"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-[#0A0B0E] border border-ent-border rounded-xl px-3 py-2 text-xs text-white placeholder-ent-dim focus:outline-none focus:border-ent-cyan"
                />
              </div>

              <div>
                <label className="text-[10px] text-ent-muted font-bold block mb-1">MODEL</label>
                <input
                  type="text"
                  placeholder="e.g. Heritage Hi-Beat 36000"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-[#0A0B0E] border border-ent-border rounded-xl px-3 py-2 text-xs text-white placeholder-ent-dim focus:outline-none focus:border-ent-cyan"
                />
              </div>

              <div>
                <label className="text-[10px] text-ent-muted font-bold block mb-1">CALIBER</label>
                <input
                  type="text"
                  placeholder="e.g. Cal. 9S85"
                  value={caliber}
                  onChange={(e) => setCaliber(e.target.value)}
                  className="w-full bg-[#0A0B0E] border border-ent-border rounded-xl px-3 py-2 text-xs text-white placeholder-ent-dim focus:outline-none focus:border-ent-cyan font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-[10px] text-ent-muted font-bold block mb-1">TARGET VPH</label>
                <select
                  value={vph}
                  onChange={(e) => setVph(Number(e.target.value))}
                  className="w-full bg-[#0A0B0E] text-white text-xs font-bold font-mono px-3 py-2 rounded-xl border border-ent-border focus:outline-none"
                >
                  <option value={18000}>18,000 VPH (2.5 Hz)</option>
                  <option value={21600}>21,600 VPH (3.0 Hz)</option>
                  <option value={25200}>25,200 VPH (3.5 Hz)</option>
                  <option value={28800}>28,800 VPH (4.0 Hz)</option>
                  <option value={36000}>36,000 VPH (5.0 Hz)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-ent-muted font-bold block mb-1">LIFT ANGLE</label>
                <select
                  value={liftAngle}
                  onChange={(e) => setLiftAngle(Number(e.target.value))}
                  className="w-full bg-[#0A0B0E] text-ent-amber text-xs font-bold font-mono px-3 py-2 rounded-xl border border-ent-border focus:outline-none"
                >
                  {[48, 50, 52, 53, 54, 56, 58].map((angle) => (
                    <option key={angle} value={angle}>
                      {angle}° (STANDARD)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddMovement}
                className="w-full py-2.5 rounded-xl bg-ent-cyan text-black font-extrabold text-xs tracking-wider shadow-cyan-glow hover:bg-cyan-300 transition-all"
              >
                SAVE MOVEMENT PROFILE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
