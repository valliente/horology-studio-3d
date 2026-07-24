import React, { useState } from 'react';
import { Database, Search, Trash2, FileText, Play, Tag, HardDrive, Download } from 'lucide-react';
import { EnterpriseSession } from '../../db/EnterpriseDatabase';
import { compilePDFReport } from '../../utils/pdfReportCompiler';

interface DatabaseManagerProps {
  sessions: EnterpriseSession[];
  onDeleteSession: (id: number) => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ sessions, onDeleteSession }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  const filtered = sessions.filter((s) => {
    const matchesSearch =
      s.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.caliber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = selectedTag === 'ALL' || s.tag === selectedTag;

    return matchesSearch && matchesTag;
  });

  const handleDownloadWav = (s: EnterpriseSession) => {
    if (s.wavBlob) {
      const url = URL.createObjectURL(s.wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${s.brand}_${s.model}_Telemetry.wav`;
      a.click();
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto">
      {/* Title & Filter */}
      <div className="flex flex-wrap items-center justify-between border-b border-ent-border pb-4 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
            <Database className="w-6 h-6 text-ent-cyan" /> SQLITE / INDEXEDDB TELEMETRY DATABASE
          </h2>
          <p className="text-xs text-ent-muted mt-1">
            Historical diagnostic run records, WAV audio telemetry clips, & chronometric logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-ent-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search brand, model, caliber..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#14161D] border border-ent-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-ent-dim focus:outline-none focus:border-ent-cyan w-60"
            />
          </div>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-[#14161D] text-ent-cyan text-xs font-bold font-mono px-3 py-2 rounded-xl border border-ent-border focus:outline-none"
          >
            <option value="ALL">ALL TAGS</option>
            <option value="Pre-Service">Pre-Service</option>
            <option value="Post-Service">Post-Service</option>
            <option value="Regulation">Regulation</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#14161D] border border-ent-border rounded-2xl p-12 text-center space-y-3">
          <HardDrive className="w-12 h-12 text-ent-dim mx-auto" />
          <h3 className="text-sm font-bold text-ent-muted">NO TELEMETRY LOGS RECORDED</h3>
          <p className="text-xs text-ent-dim max-w-sm mx-auto">
            Run a diagnostic test on the Dashboard to save watch profiles, rate drift arrays, and WAV audio clips.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-[#14161D] border border-ent-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 hover:border-ent-cyan/50 transition-all shadow-card-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#0D0E12] border border-ent-border text-ent-cyan">
                  <Tag className="w-5 h-5 text-ent-cyan" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white font-mono">
                      {s.brand} {s.model}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ent-purple/20 border border-ent-purple/40 text-ent-purple">
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
                      className="p-2 rounded-xl bg-ent-purple/15 text-ent-purple border border-ent-purple/40 hover:bg-ent-purple hover:text-white transition-all"
                      title="Download WAV Telemetry Clip"
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
                    title="Delete Record"
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
  );
};
