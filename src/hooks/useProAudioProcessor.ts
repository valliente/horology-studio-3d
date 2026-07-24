import { useState, useEffect, useRef, useCallback } from 'react';
import { ProAudioEngine, WatchMetrics, ProDSPConfig } from '../audio/ProAudioEngine';

export interface UseProAudioProcessorReturn {
  audioEngine: ProAudioEngine | null;
  isRunning: boolean;
  isSynthetic: boolean;
  metrics: WatchMetrics;
  config: ProDSPConfig;
  startMicrophone: (deviceId?: string) => Promise<boolean>;
  startSynthesizer: () => Promise<boolean>;
  stop: () => void;
  updateConfig: (newConfig: Partial<ProDSPConfig>) => void;
  setSynthDrift: (rateSd: number, beatErrorMs: number) => void;
  calibrateNoiseFloor: () => void;
  analyserNode: AnalyserNode | null;
}

export function useProAudioProcessor(initialConfig?: Partial<ProDSPConfig>): UseProAudioProcessorReturn {
  const engineRef = useRef<ProAudioEngine | null>(null);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSynthetic, setIsSynthetic] = useState<boolean>(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const [config, setConfig] = useState<ProDSPConfig>({
    vphPreset: 28800,
    autoDetectVph: true,
    highPassCutoff: 2500,
    lowPassCutoff: 6500,
    gainBoost: 3.0,
    liftAngleDeg: 52,
    monitorAudio: false,
    eqGain2800Hz: 3.0,
    eqGain4200Hz: 5.0,
    eqGain5500Hz: 2.0,
    autoNoiseCalibrate: true,
    ...initialConfig,
  });

  const [metrics, setMetrics] = useState<WatchMetrics>({
    rateSd: 0,
    beatErrorMs: 0,
    amplitudeDeg: 275,
    detectedVph: 28800,
    signalLevel: 0,
    tickCount: 0,
    phaseDriftMs: 0,
    noiseFloorRms: 0.02,
    historyDots: [],
  });

  useEffect(() => {
    const engine = new ProAudioEngine((newMetrics) => {
      setMetrics(newMetrics);
    });
    engineRef.current = engine;

    return () => {
      engine.stop();
    };
  }, []);

  const startMicrophone = useCallback(async (deviceId?: string): Promise<boolean> => {
    if (!engineRef.current) return false;
    const ok = await engineRef.current.startMicrophone(deviceId, config);
    if (ok) {
      setIsRunning(true);
      setIsSynthetic(false);
      setAnalyserNode(engineRef.current.getAnalyserNode());
    }
    return ok;
  }, [config]);

  const startSynthesizer = useCallback(async (): Promise<boolean> => {
    if (!engineRef.current) return false;
    const ok = await engineRef.current.startSynthesizer(config);
    if (ok) {
      setIsRunning(true);
      setIsSynthetic(true);
      setAnalyserNode(engineRef.current.getAnalyserNode());
    }
    return ok;
  }, [config]);

  const stop = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
      setIsRunning(false);
      setAnalyserNode(null);
    }
  }, []);

  const updateConfig = useCallback((newConfig: Partial<ProDSPConfig>) => {
    setConfig((prev) => {
      const merged = { ...prev, ...newConfig };
      if (engineRef.current) {
        engineRef.current.updateConfig(merged);
      }
      return merged;
    });
  }, []);

  const setSynthDrift = useCallback((rateSd: number, beatErrorMs: number) => {
    if (engineRef.current) {
      engineRef.current.setSynthDrift(rateSd, beatErrorMs);
    }
  }, []);

  const calibrateNoiseFloor = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.calibrateNoiseFloor();
    }
  }, []);

  return {
    audioEngine: engineRef.current,
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
  };
}
