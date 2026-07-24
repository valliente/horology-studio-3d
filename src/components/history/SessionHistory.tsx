import React, { useState } from 'react';
import { Database, Search, Trash2, FileText, CheckCircle2, Tag } from 'lucide-react';
import { WatchSession } from '../../db/SessionDatabase';

interface SessionHistoryProps {
  sessions: WatchSession[];
  onDeleteSession: (id: number) => void;
  onGenerateReport: (session: WatchSession) => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions,
  onDeleteSession,
  onGenerateReport,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.watchMake.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.watchModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.caliber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = selectedTag === 'ALL' || s.tag === selectedTag;

    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-pro-border pb-4 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
            <Database className="w-6 h-6 text-pro-cyan" /> INDEXEDDB SESSION DATABASE
          </h2>
          <p className="text-xs text-pro-muted mt-1">
            Historical diagnostic run records, watch metadata, & service logs
          </p>
        </div>

        {/* Search Bar & Tag Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-pro-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search make, model, caliber..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-pro-card border border-pro-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-pro-dim focus:outline-none focus:border-pro-cyan w-60"
            />
          </div>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-pro-card text-pro-cyan text-xs font-bold font-mono px-3 py-2 rounded-xl border border-pro-border focus:outline-none"
          >
            <option value="ALL">ALL TAGS</option>
            <option value="Pre-Service">Pre-Service</option>
            <option value="Post-Service">Post-Service</option>
            <option value="Regulation">Regulation</option>
          </select>
        </div>
      </div>

      {/* Session Table */}
      {filteredSessions.length === 0 ? (
        <div className="bg-pro-card border border-pro-border rounded-2xl p-12 text-center space-y-3">
          <Database className="w-12 h-12 text-pro-dim mx-auto" />
          <h3 className="text-sm font-bold text-pro-muted">NO DIAGNOSTIC SESSIONS FOUND</h3>
          <p className="text-xs text-pro-dim max-w-sm mx-auto">
            Saved watch diagnostic sessions from your live testing runs will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((s) => (
            <div
              key={s.id}
              className="bg-pro-card border border-pro-border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 hover:border-pro-cyan/50 transition-all shadow-card-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#0d0f14] border border-pro-border text-pro-cyan">
                  <Tag className="w-5 h-5 text-pro-cyan" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white font-mono">
                      {s.watchMake} {s.watchModel}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pro-purple/20 border border-pro-purple/40 text-pro-purple">
                      {s.tag}
                    </span>
                  </div>
                  <p className="text-xs text-pro-muted font-mono mt-0.5">
                    Caliber: {s.caliber || 'N/A'} • Serial: {s.serialNumber || 'N/A'} • {new Date(s.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Metrics Readout */}
              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-pro-dim block font-bold">RATE</span>
                  <span className="text-white font-bold">
                    {s.rateSd > 0 ? `+${s.rateSd.toFixed(1)}` : s.rateSd.toFixed(1)} s/d
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-pro-dim block font-bold">BEAT ERR</span>
                  <span className="text-pro-cyan font-bold">{s.beatErrorMs.toFixed(1)} ms</span>
                </div>
                <div>
                  <span className="text-[10px] text-pro-dim block font-bold">AMPLITUDE</span>
                  <span className="text-pro-purple font-bold">{s.amplitudeDeg}°</span>
                </div>
                <div>
                  <span className="text-[10px] text-pro-dim block font-bold">VPH</span>
                  <span className="text-white font-bold">{(s.vph / 1000).toFixed(1)}k</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pl-2">
                  <button
                    onClick={() => onGenerateReport(s)}
                    className="p-2 rounded-xl bg-pro-cyan/15 text-pro-cyan border border-pro-cyan/40 hover:bg-pro-cyan hover:text-black transition-all"
                    title="Generate PDF Report"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => s.id && onDeleteSession(s.id)}
                    className="p-2 rounded-xl bg-pro-red/15 text-pro-red border border-pro-red/40 hover:bg-pro-red hover:text-white transition-all"
                    title="Delete Session Record"
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
