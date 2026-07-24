import React, { useState } from 'react';
import { LeftSidebar, NavView } from './components/layout/LeftSidebar';
import { RightInspector } from './components/layout/RightInspector';
import { ProHeader } from './components/layout/ProHeader';
import { MetricsGrid } from './components/dashboard/MetricsGrid';
import { LiveOscilloscope } from './components/dashboard/LiveOscilloscope';
import { PositionalQuickBar, WatchPosition } from './components/dashboard/PositionalQuickBar';
import { DSPChainPanel } from './components/dsp/DSPChainPanel';
import { PositionalTester } from './components/positional/PositionalTester';
import { SessionHistory } from './components/history/SessionHistory';
import { SessionCompare } from './components/history/SessionCompare';
import { MicProfileManager } from './components/profiles/MicProfileManager';
import { ReportGenerator } from './components/reports/ReportGenerator';
import { NTPSyncPanel } from './components/ntp/NTPSyncPanel';
import { useProAudioProcessor } from './hooks/useProAudioProcessor';
import { useSessionDB } from './hooks/useSessionDB';
import { WatchSession } from './db/SessionDatabase';
import { generatePDFReport } from './utils/pdfGenerator';
import { Watch, Radio, Mic, HelpCircle, Shield } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');

  // Watch metadata state
  const [watchMake, setWatchMake] = useState<string>('Rolex');
  const [watchModel, setWatchModel] = useState<string>('Submariner Cal. 3135');
  const [caliber, setCaliber] = useState<string>('Cal. 3135');
  const [serialNumber, setSerialNumber] = useState<string>('R942851');
  const [tag, setTag] = useState<string>('Pre-Service');

  // Active position & Positional Data state
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

  // Audio Processor Hook
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
    analyserNode,
  } = useProAudioProcessor();

  // IndexedDB Hook
  const { sessions, micProfiles, addSession, removeSession, addMicProfile } = useSessionDB();
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

  const handleSaveCurrentSession = async () => {
    await addSession({
      timestamp: new Date().toISOString(),
      watchMake,
      watchModel,
      caliber,
      serialNumber,
      tag,
      liftAngleDeg: config.liftAngleDeg,
      vph: metrics.detectedVph,
      rateSd: metrics.rateSd,
      beatErrorMs: metrics.beatErrorMs,
      amplitudeDeg: metrics.amplitudeDeg,
      positionalMetrics: positionalData as Record<string, { rateSd: number; amplitudeDeg: number; beatErrorMs: number }>,
      notes: `Escapement calibration run for ${watchMake} ${watchModel}.`,
    });
  };

  const handleGenerateCurrentReport = () => {
    const tempSession: WatchSession = {
      timestamp: new Date().toISOString(),
      watchMake,
      watchModel,
      caliber,
      serialNumber,
      tag,
      liftAngleDeg: config.liftAngleDeg,
      vph: metrics.detectedVph,
      rateSd: metrics.rateSd,
      beatErrorMs: metrics.beatErrorMs,
      amplitudeDeg: metrics.amplitudeDeg,
      positionalMetrics: positionalData as Record<string, { rateSd: number; amplitudeDeg: number; beatErrorMs: number }>,
      notes: `Diagnostic inspection report generated for ${watchMake} ${watchModel}.`,
    };
    generatePDFReport(tempSession);
  };

  return (
    <div className="w-screen h-screen bg-[#0d0f14] text-pro-text font-sans flex flex-row overflow-hidden select-none">
      {/* 1. Left Primary Navigation Sidebar */}
      <LeftSidebar currentView={currentView} onSelectView={setCurrentView} />

      {/* 2. Main Center Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#07090e] overflow-hidden">
        {/* Top Header Bar */}
        <ProHeader
          isRunning={isRunning}
          isSynthetic={isSynthetic}
          micProfiles={micProfiles}
          selectedProfileId={selectedProfileId}
          onSelectProfile={(id) => {
            setSelectedProfileId(id);
            const prof = micProfiles.find((p) => p.id === id);
            if (prof) {
              updateConfig({
                gainBoost: prof.gainBoost,
                highPassCutoff: prof.highPassHz,
                lowPassCutoff: prof.lowPassHz,
              });
            }
          }}
          monitorAudio={config.monitorAudio}
          onToggleMonitor={() => updateConfig({ monitorAudio: !config.monitorAudio })}
          onStartMic={startMicrophone}
          onStartSynth={startSynthesizer}
          onStop={stop}
        />

        {/* Dynamic View Router */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {currentView === 'dashboard' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <MetricsGrid metrics={metrics} isRunning={isRunning} />

              <div className="flex-1 flex flex-col relative overflow-hidden">
                <LiveOscilloscope
                  analyserNode={analyserNode}
                  metrics={metrics}
                  isRunning={isRunning}
                />

                {/* IDLE Overlay */}
                {!isRunning && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center">
                    <div className="p-4 rounded-full bg-pro-card border border-pro-cyan/40 text-pro-cyan mb-4 shadow-cyan-glow animate-pulse">
                      <Watch className="w-12 h-12" />
                    </div>

                    <h2 className="text-2xl font-black text-white tracking-widest mb-2 font-sans glow-cyan">
                      MICRO-TIMEGRAPHER PRO READY
                    </h2>

                    <p className="text-xs text-pro-muted max-w-lg mb-6 leading-relaxed">
                      Connect your acoustic sensor and click <strong className="text-pro-cyan">MIC INPUT</strong> or launch the <strong className="text-pro-purple">DEMO SYNTH</strong> to experience the multi-stage DSP oscilloscope and positional stability suite.
                    </p>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => startMicrophone()}
                        className="px-6 py-3 rounded-xl bg-pro-cyan text-black font-extrabold text-xs tracking-wider shadow-cyan-glow hover:bg-cyan-300 transition-all"
                      >
                        START MIC INPUT
                      </button>

                      <button
                        onClick={() => startSynthesizer()}
                        className="px-6 py-3 rounded-xl bg-pro-purple text-white font-extrabold text-xs tracking-wider shadow-purple-glow hover:opacity-90 transition-all"
                      >
                        RUN DEMO SYNTH
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Positional Quick Selector Bar */}
              <PositionalQuickBar
                currentPosition={currentPosition}
                onSelectPosition={setCurrentPosition}
                loggedPositions={loggedPositions}
              />
            </div>
          )}

          {currentView === 'dsp' && (
            <DSPChainPanel
              config={config}
              onUpdateConfig={updateConfig}
              onCalibrateNoiseFloor={calibrateNoiseFloor}
              noiseFloorRms={metrics.noiseFloorRms}
            />
          )}

          {currentView === 'positional' && (
            <PositionalTester
              metrics={metrics}
              isRunning={isRunning}
              onSavePositionalMetric={handleSavePositionalMetric}
              positionalData={positionalData}
            />
          )}

          {currentView === 'history' && (
            <SessionHistory
              sessions={sessions}
              onDeleteSession={removeSession}
              onGenerateReport={generatePDFReport}
            />
          )}

          {currentView === 'compare' && <SessionCompare sessions={sessions} />}

          {currentView === 'profiles' && (
            <MicProfileManager
              profiles={micProfiles}
              selectedProfileId={selectedProfileId}
              onSelectProfile={setSelectedProfileId}
              onSaveProfile={addMicProfile}
            />
          )}

          {currentView === 'reports' && <ReportGenerator sessions={sessions} />}

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
