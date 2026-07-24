import React, { useState } from 'react';
import { FileText, Printer, ShieldCheck } from 'lucide-react';
import { EnterpriseSession } from '../../db/EnterpriseDatabase';
import { compilePDFReport } from '../../utils/pdfReportCompiler';

interface PDFReportBuilderProps {
  sessions: EnterpriseSession[];
}

export const PDFReportBuilder: React.FC<PDFReportBuilderProps> = ({ sessions }) => {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(sessions[0]?.id || null);
  const [technicianName, setTechnicianName] = useState<string>('Master Horologist');

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const handlePrint = () => {
    if (selectedSession) {
      compilePDFReport(selectedSession, technicianName);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto">
      {/* Title */}
      <div className="border-b border-ent-border pb-4">
        <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
          <FileText className="w-6 h-6 text-ent-cyan" /> NATIVE PDF SERVICE REPORT ENGINE
        </h2>
        <p className="text-xs text-ent-muted mt-1">
          Generate client service certificates with high-resolution canvas charts & 6-positional matrices
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-[#14161D] border border-ent-border rounded-2xl p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-ent-dim mx-auto" />
          <h3 className="text-sm font-bold text-ent-muted">NO DIAGNOSTIC SESSIONS AVAILABLE</h3>
          <p className="text-xs text-ent-dim max-w-sm mx-auto">
            Log a diagnostic run on the Dashboard first to compile printable PDF service certificates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-[#14161D] border border-ent-border rounded-2xl p-5 space-y-4 shadow-card-shadow">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              REPORT OPTIONS
            </h3>

            <div>
              <label className="text-[10px] text-ent-muted font-bold block mb-1">SELECT SESSION</label>
              <select
                value={selectedSessionId || ''}
                onChange={(e) => setSelectedSessionId(Number(e.target.value))}
                className="w-full bg-[#0D0E12] text-white text-xs font-bold font-mono p-3 rounded-xl border border-ent-border focus:outline-none focus:border-ent-cyan"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.brand} {s.model} ({s.tag})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-ent-muted font-bold block mb-1">CERTIFIED TECHNICIAN</label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full bg-[#0D0E12] border border-ent-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-ent-cyan font-semibold"
              />
            </div>

            <button
              onClick={handlePrint}
              className="w-full py-3 rounded-xl bg-ent-cyan text-black font-extrabold text-xs tracking-wider shadow-cyan-glow hover:bg-cyan-300 transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>EXPORT / PRINT PDF CERTIFICATE</span>
            </button>
          </div>

          {/* Document Preview */}
          {selectedSession && (
            <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-2xl col-span-2 space-y-4 font-sans text-xs">
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-end">
                <div>
                  <h1 className="text-lg font-black text-slate-900">CHRONOMETRIC SERVICE CERTIFICATE</h1>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Micro-Timegrapher Enterprise Workstation</p>
                </div>
                <span className="bg-slate-900 text-teal-400 text-[10px] font-bold px-3 py-1 rounded">VERIFIED CHRONOMETER</span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">WATCH SPECIFICATION</div>
                  <div className="font-bold text-slate-900">{selectedSession.brand} {selectedSession.model}</div>
                  <div className="text-[11px] text-slate-600">Caliber: {selectedSession.caliber || 'N/A'} • Serial: {selectedSession.serialNumber || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">TEST METADATA</div>
                  <div className="font-bold text-slate-900">Date: {new Date(selectedSession.timestamp).toLocaleDateString()}</div>
                  <div className="text-[11px] text-slate-600">Tag: {selectedSession.tag} • VPH: {selectedSession.vph.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-900 text-white p-3 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">RATE DRIFT</div>
                  <div className="text-xl font-black text-teal-400 font-mono">{selectedSession.rateSd > 0 ? `+${selectedSession.rateSd}` : selectedSession.rateSd} s/d</div>
                </div>
                <div className="bg-slate-900 text-white p-3 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">BEAT ERROR</div>
                  <div className="text-xl font-black text-purple-400 font-mono">{selectedSession.beatErrorMs.toFixed(1)} ms</div>
                </div>
                <div className="bg-slate-900 text-white p-3 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">AMPLITUDE</div>
                  <div className="text-xl font-black text-white font-mono">{selectedSession.amplitudeDeg}°</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
