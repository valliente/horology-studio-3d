import React, { useState } from 'react';
import { SidebarNav, EntNavView } from './components/layout/SidebarNav';
import { TopHeader } from './components/layout/TopHeader';
import { RightInspector } from './components/layout/RightInspector';
import { MetricsGrid } from './components/dashboard/MetricsGrid';
import { CRTVisualizer } from './components/dashboard/LiveOscilloscope';
import { PositionalQuickBar, WatchPosition } from './components/dashboard/PositionalQuickBar';
import { DSPChainPanel as DSPWorkletPanel } from './components/dsp/DSPChainPanel';
import { PositionalSuite } from './components/positional/PositionalSuite';
import { DatabaseManager } from './components/db/DatabaseManager';
import { PDFReportBuilder } from './components/reports/PDFReportBuilder';
import { NTPSyncPanel } from './components/ntp/NTPSyncPanel';
import { useEnterpriseAudio } from './hooks/useEnterpriseAudio';
import { useEnterpriseDB } from './hooks/useEnterpriseDB';
import { EnterpriseSession } from './db/EnterpriseDatabase';
import { compilePDFReport } from './utils/pdfReportCompiler';
import { Watch, Radio, Mic } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<EntNavView>('dashboard');

  // Watch Metadata state
  const [watchMake, setWatchMake] = useState<string>('Rolex');
  const [watchModel, setWatchModel] = useState<string>('Submariner Date');
  const [caliber, setCaliber] = useState<string>('Cal. 3135');
  const [serialNumber, setSerialNumber] = useState<string>('R849201');
  const [tag, setTag] = useState<string>('Pre-Service');

  // Positional State
  const [currentPosition, setCurrentPosition] = useState<WatchPosition>('DU');
  const [positionalData, setPositionalData] = useState<Partial<Record<WatchPosition, { rateSd: number; amplitudeDeg: number; beatErrorMs: number }>>>({});
  const [loggedPositions, setLoggedPositions] = useState<Record<WatchPosition, boolean>>({
    DU: false,
    DD: false,
    CD: false,
    CU: false,
    CL: false,
    CR: false,
  });

  // Audio & DB Hooks
  const {
    isRunning,
    isSynthetic,
    metrics,
    config,
    startMicrophone,
    startSynthesizer,
    stop,
    updateConfig,
    setSynthDrift,
    calibrateNoiseFloor,
    recordWavBuffer,
    analyserNode,
  } = useEnterpriseAudio();

  const { sessions, profiles, addSession, removeSession, addWatchProfile } = useEnterpriseDB();
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(1);

  const handleUpdateWatchInfo = (info: { watchMake?: string; watchModel?: string; caliber?: string; serialNumber?: string; tag?: string }) => {
    if (info.watchMake !== undefined) setWatchMake(info.watchMake);
    if (info.watchModel !== undefined) setWatchModel(info.watchModel);
    if (info.caliber !== undefined) setCaliber(info.caliber);
    if (info.serialNumber !== undefined) setSerialNumber(info.serialNumber);
    if (info.tag !== undefined) setTag(info.tag);
  };

  const handleSavePositionalMetric = (pos: WatchPosition, data: { rateSd: number; amplitudeDeg: number; beatErrorMs: number }) => {
    setPositionalData((prev) => ({ ...prev, [pos]: data }));
    setLoggedPositions((prev) => ({ ...prev, [pos]: true }));
  };

  const handleSaveSession = async () => {
    const wavBlob = await recordWavBuffer(3.0);
    await addSession({
      timestamp: new Date().toISOString(),
      brand: watchMake,
      model: watchModel,
      caliber,
      serialNumber,
      tag,
      liftAngleDeg: config.liftAngleDeg,
      vph: metrics.detectedVph,
      rateSd: metrics.rateSd,
      beatErrorMs: metrics.beatErrorMs,
      amplitudeDeg: metrics.amplitudeDeg,
      positionalMetrics: positionalData as Record<string, { rateSd: number; amplitudeDeg: number; beatErrorMs: number }>,
      wavBlob: wavBlob || undefined,
      notes: `Enterprise chronometric log for ${watchMake} ${watchModel}.`,
    });
  };

  const handleGenerateCurrentReport = () => {
    const tempSession: EnterpriseSession = {
      timestamp: new Date().toISOString(),
      brand: watchMake,
      model: watchModel,
      caliber,
      serialNumber,
      tag,
      liftAngleDeg: config.liftAngleDeg,
      vph: metrics.detectedVph,
      rateSd: metrics.rateSd,
      beatErrorMs: metrics.beatErrorMs,
      amplitudeDeg: metrics.amplitudeDeg,
      positionalMetrics: positionalData as Record<string, { rateSd: number; amplitudeDeg: number; beatErrorMs: number }>,
      notes: `Diagnostic certificate generated for ${watchMake} ${watchModel}.`,
    };
    compilePDFReport(tempSession);
  };

  return (
    <div className="w-screen h-screen bg-[#0D0E12] text-ent-text font-sans flex flex-row overflow-hidden select-none">
      {/* 1. Left Vertical Navigation Sidebar */}
      <SidebarNav currentView={currentView} onSelectView={setCurrentView} />

      {/* 2. Center Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#07090e] overflow-hidden">
        <TopHeader
          isRunning={isRunning}
          isSynthetic={isSynthetic}
          profiles={profiles}
          selectedProfileId={selectedProfileId}
          onSelectProfile={(id) => {
            setSelectedProfileId(id);
            const prof = profiles.find((p) => p.id === id);
            if (prof) {
              updateConfig({
                liftAngleDeg: prof.liftAngleDeg,
                vphPreset: prof.targetVph,
              });
            }
          }}
          monitorAudio={config.monitorAudio}
          onToggleMonitor={() => updateConfig({ monitorAudio: !config.monitorAudio })}
          onStartMic={startMicrophone}
          onStartSynth={startSynthesizer}
          onStop={stop}
        />

        {/* Dynamic Navigation Workspace */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {currentView === 'dashboard' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <MetricsGrid metrics={metrics} isRunning={isRunning} />

              <div className="flex-1 flex flex-col relative overflow-hidden">
                <CRTVisualizer
                  analyserNode={analyserNode}
                  metrics={metrics}
                  isRunning={isRunning}
                />

                {/* IDLE Overlay Prompt */}
                {!isRunning && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center">
                    <div className="p-4 rounded-full bg-[#14161D] border border-ent-cyan/40 text-ent-cyan mb-4 shadow-cyan-glow animate-pulse">
                      <Watch className="w-12 h-12" />
                    </div>

                    <h2 className="text-2xl font-black text-white tracking-widest mb-2 font-sans glow-cyan">
                      MICRO-TIMEGRAPHER ENTERPRISE
                    </h2>

                    <p className="text-xs text-ent-muted max-w-lg mb-6 leading-relaxed">
                      Connect your acoustic watch pickup and click <strong className="text-ent-cyan">MIC INPUT</strong> or start the <strong className="text-ent-purple">DEMO SYNTH</strong> to experience WASM-grade signal autocorrelation, 6-positional radar plotting, and WAV telemetry capture.
                    </p>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => startMicrophone()}
                        className="px-6 py-3 rounded-xl bg-ent-cyan text-black font-extrabold text-xs tracking-wider shadow-cyan-glow hover:bg-cyan-300 transition-all"
                      >
                        START MIC INPUT
                      </button>

                      <button
                        onClick={() => startSynthesizer()}
                        className="px-6 py-3 rounded-xl bg-ent-purple text-white font-extrabold text-xs tracking-wider shadow-purple-glow hover:opacity-90 transition-all"
                      >
                        RUN DEMO SYNTH
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <PositionalQuickBar
                currentPosition={currentPosition}
                onSelectPosition={setCurrentPosition}
                loggedPositions={loggedPositions}
              />
            </div>
          )}

          {currentView === 'dsp' && (
            <DSPWorkletPanel
              config={config}
              onUpdateConfig={updateConfig}
              onCalibrateNoiseFloor={calibrateNoiseFloor}
              noiseFloorRms={metrics.noiseFloorRms}
            />
          )}

          {currentView === 'positional' && (
            <PositionalSuite
              metrics={metrics}
              isRunning={isRunning}
              onSavePositionalMetric={handleSavePositionalMetric}
              positionalData={positionalData}
            />
          )}

          {currentView === 'database' && (
            <DatabaseManager sessions={sessions} onDeleteSession={removeSession} />
          )}

          {currentView === 'reports' && <PDFReportBuilder sessions={sessions} />}

          {currentView === 'ntp' && <NTPSyncPanel />}
        </div>
      </div>

      {/* 3. Right Contextual Inspector Panel */}
      <RightInspector
        metrics={metrics}
        config={config}
        watchMake={watchMake}
        watchModel={watchModel}
        caliber={caliber}
        serialNumber={serialNumber}
        tag={tag}
        onUpdateWatchInfo={handleUpdateWatchInfo}
        onUpdateConfig={updateConfig}
        onGenerateReport={handleGenerateCurrentReport}
      />
    </div>
  );
}
