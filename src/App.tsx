import React, { useState } from 'react';
import { StudioSidebar, StudioView } from './components/layout/StudioSidebar';
import { StudioHeader } from './components/layout/StudioHeader';
import { StudioInspector } from './components/layout/StudioInspector';
import { MetricsGrid } from './components/dashboard/MetricsGrid';
import { CRTVisualizer as CRTTraceCanvas } from './components/dashboard/LiveOscilloscope';
import { PositionalQuickBar, WatchPosition } from './components/dashboard/PositionalQuickBar';
import { DSPChainPanel as DSPWorkletPanel } from './components/dsp/DSPChainPanel';
import { PositionalSuite } from './components/positional/PositionalSuite';
import { MovementDatabase } from './components/db/MovementDatabase';
import { PDFReportBuilder } from './components/reports/PDFReportBuilder';
import { useEnterpriseAudio as useStudioAudio } from './hooks/useEnterpriseAudio';
import { useEnterpriseDB as useStudioDB } from './hooks/useEnterpriseDB';
import { EnterpriseSession } from './db/EnterpriseDatabase';
import { compilePDFReport } from './utils/pdfReportCompiler';
import { Watch } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<StudioView>('home');

  // Movement Metadata State
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

  // Audio Processor & DB Hooks
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
  } = useStudioAudio();

  const { sessions, profiles, addSession, removeSession, addWatchProfile } = useStudioDB();
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

  const handleRecordWavClip = async () => {
    const wavBlob = await recordWavBuffer(10.0);
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
      notes: `10s WAV audio clip recorded for ${watchMake} ${watchModel}.`,
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
      notes: `Studio Pro diagnostic certificate for ${watchMake} ${watchModel}.`,
    };
    compilePDFReport(tempSession);
  };

  return (
    <div className="w-screen h-screen bg-[#0D0E12] text-ent-text font-sans flex flex-row overflow-hidden select-none">
      {/* 1. Left Vertical Navigation Sidebar */}
      <StudioSidebar currentView={currentView} onSelectView={setCurrentView} />

      {/* 2. Main Center Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#07090E] overflow-hidden">
        <StudioHeader
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
          onRecordWav={handleRecordWavClip}
          onStop={stop}
        />

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {(currentView === 'home' || currentView === 'timegrapher') && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <MetricsGrid metrics={metrics} isRunning={isRunning} />

              <div className="flex-1 flex flex-col relative overflow-hidden">
                <CRTTraceCanvas
                  analyserNode={analyserNode}
                  metrics={metrics}
                  isRunning={isRunning}
                />

                {!isRunning && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center">
                    <div className="p-4 rounded-full bg-[#14161D] border border-ent-cyan/40 text-ent-cyan mb-4 shadow-cyan-glow animate-pulse">
                      <Watch className="w-12 h-12" />
                    </div>

                    <h2 className="text-2xl font-black text-white tracking-widest mb-2 font-sans glow-cyan">
                      MICRO-TIMEGRAPHER STUDIO PRO
                    </h2>

                    <p className="text-xs text-ent-muted max-w-lg mb-6 leading-relaxed">
                      Connect your acoustic pickup and click <strong className="text-ent-cyan">MIC INPUT</strong> or start the <strong className="text-ent-purple">DEMO SYNTH</strong> to experience WASM-grade signal autocorrelation, 10s WAV clip archiving, and 6-positional radar plotting.
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

          {currentView === 'positional' && (
            <PositionalSuite
              metrics={metrics}
              isRunning={isRunning}
              onSavePositionalMetric={handleSavePositionalMetric}
              positionalData={positionalData}
            />
          )}

          {currentView === 'database' && (
            <MovementDatabase
              sessions={sessions}
              profiles={profiles}
              onDeleteSession={removeSession}
              onAddProfile={addWatchProfile}
            />
          )}

          {currentView === 'reports' && <PDFReportBuilder sessions={sessions} />}

          {currentView === 'settings' && (
            <DSPWorkletPanel
              config={config}
              onUpdateConfig={updateConfig}
              onCalibrateNoiseFloor={calibrateNoiseFloor}
              noiseFloorRms={metrics.noiseFloorRms}
            />
          )}
        </div>
      </div>

      {/* 3. Contextual Right Inspector Panel */}
      <StudioInspector
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
