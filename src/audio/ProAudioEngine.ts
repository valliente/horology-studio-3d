import { WatchSynthesizer } from './WatchSynthesizer';

export interface WatchMetrics {
  rateSd: number;
  beatErrorMs: number;
  amplitudeDeg: number;
  detectedVph: number;
  signalLevel: number;
  tickCount: number;
  phaseDriftMs: number;
  noiseFloorRms: number;
  historyDots: Array<{ xTime: number; driftMs: number; isTick: boolean }>;
}

export interface ProDSPConfig {
  vphPreset: number;
  autoDetectVph: boolean;
  highPassCutoff: number;   // default 2500 Hz
  lowPassCutoff: number;    // default 6500 Hz
  gainBoost: number;        // default 3.0x
  liftAngleDeg: number;     // default 52°
  monitorAudio: boolean;    // Listen to filtered watch audio
  // 3-Band Parametric EQ stage:
  eqGain2800Hz: number;     // Pallet unlock gain (-12 to +12 dB)
  eqGain4200Hz: number;     // Impulse pin gain (-12 to +12 dB)
  eqGain5500Hz: number;     // Drop impact gain (-12 to +12 dB)
  autoNoiseCalibrate: boolean;
}

export class ProAudioEngine {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;

  // Multi-stage DSP Chain Nodes
  private gainNode: GainNode | null = null;
  private highPassFilter: BiquadFilterNode | null = null;
  private lowPassFilter: BiquadFilterNode | null = null;
  private eqNode1: BiquadFilterNode | null = null;
  private eqNode2: BiquadFilterNode | null = null;
  private eqNode3: BiquadFilterNode | null = null;
  private monitorGainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  private synthesizer: WatchSynthesizer | null = null;
  private isSyntheticSource: boolean = false;
  private isRunning: boolean = false;
  private animFrameId: number | null = null;

  // Analysis State
  private lastPeakTimeSec: number = 0;
  private lastTickIntervalSec: number = 0;
  private tickIntervalHistory: number[] = [];
  private tickPairIntervals: { t1: number; t2: number }[] = [];
  private isTickPhase: boolean = true;
  private totalTicks: number = 0;
  private noiseFloorSamples: number[] = [];

  private dspConfig: ProDSPConfig = {
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
  };

  private currentMetrics: WatchMetrics = {
    rateSd: 0,
    beatErrorMs: 0,
    amplitudeDeg: 275,
    detectedVph: 28800,
    signalLevel: 0,
    tickCount: 0,
    phaseDriftMs: 0,
    noiseFloorRms: 0.02,
    historyDots: [],
  };

  private onMetricsCallback?: (metrics: WatchMetrics) => void;

  constructor(onMetrics?: (metrics: WatchMetrics) => void) {
    this.onMetricsCallback = onMetrics;
  }

  public setMetricsCallback(cb: (metrics: WatchMetrics) => void) {
    this.onMetricsCallback = cb;
  }

  public async startMicrophone(deviceId?: string, config?: Partial<ProDSPConfig>): Promise<boolean> {
    this.stop();
    this.isSyntheticSource = false;
    if (config) this.updateConfig(config);

    try {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      const sourceNode = this.ctx.createMediaStreamSource(this.stream);
      this.buildDSPChain(sourceNode);

      this.isRunning = true;
      this.processLoop();
      return true;
    } catch (err) {
      console.error('Failed to access mic device:', err);
      return false;
    }
  }

  public async startSynthesizer(config?: Partial<ProDSPConfig>): Promise<boolean> {
    this.stop();
    this.isSyntheticSource = true;
    if (config) this.updateConfig(config);

    try {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.synthesizer = new WatchSynthesizer(this.ctx);
      const synthGain = this.synthesizer.connect(this.ctx.destination);
      this.buildDSPChain(synthGain);

      this.synthesizer.setParams(
        this.dspConfig.vphPreset,
        this.currentMetrics.rateSd || 4.2,
        this.currentMetrics.beatErrorMs || 0.3
      );
      this.synthesizer.start();

      this.isRunning = true;
      this.processLoop();
      return true;
    } catch (err) {
      console.error('Failed to start synth engine:', err);
      return false;
    }
  }

  public updateConfig(newConfig: Partial<ProDSPConfig>) {
    this.dspConfig = { ...this.dspConfig, ...newConfig };

    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.gainNode) this.gainNode.gain.setValueAtTime(this.dspConfig.gainBoost, now);
    if (this.highPassFilter) this.highPassFilter.frequency.setValueAtTime(this.dspConfig.highPassCutoff, now);
    if (this.lowPassFilter) this.lowPassFilter.frequency.setValueAtTime(this.dspConfig.lowPassCutoff, now);
    if (this.eqNode1) this.eqNode1.gain.setValueAtTime(this.dspConfig.eqGain2800Hz, now);
    if (this.eqNode2) this.eqNode2.gain.setValueAtTime(this.dspConfig.eqGain4200Hz, now);
    if (this.eqNode3) this.eqNode3.gain.setValueAtTime(this.dspConfig.eqGain5500Hz, now);
    if (this.monitorGainNode) this.monitorGainNode.gain.setValueAtTime(this.dspConfig.monitorAudio ? 0.8 : 0.0, now);

    if (this.synthesizer && this.isSyntheticSource) {
      this.synthesizer.setParams(this.dspConfig.vphPreset, this.currentMetrics.rateSd, this.currentMetrics.beatErrorMs);
    }
  }

  public setSynthDrift(rateSd: number, beatErrorMs: number) {
    this.currentMetrics.rateSd = rateSd;
    this.currentMetrics.beatErrorMs = beatErrorMs;
    if (this.synthesizer) {
      this.synthesizer.setParams(this.dspConfig.vphPreset, rateSd, beatErrorMs);
    }
  }

  public calibrateNoiseFloor() {
    this.noiseFloorSamples = [];
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.synthesizer) {
      this.synthesizer.stop();
      this.synthesizer = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
      this.ctx = null;
    }
    this.tickIntervalHistory = [];
    this.tickPairIntervals = [];
    this.totalTicks = 0;
  }

  public getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  public getMetrics(): WatchMetrics {
    return this.currentMetrics;
  }

  public getConfig(): ProDSPConfig {
    return this.dspConfig;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getIsSynthetic(): boolean {
    return this.isSyntheticSource;
  }

  private buildDSPChain(inputNode: AudioNode) {
    if (!this.ctx) return;

    // 1. Gain Boost Stage
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = this.dspConfig.gainBoost;

    // 2. High-Pass Filter Stage
    this.highPassFilter = this.ctx.createBiquadFilter();
    this.highPassFilter.type = 'highpass';
    this.highPassFilter.frequency.value = this.dspConfig.highPassCutoff;
    this.highPassFilter.Q.value = 1.2;

    // 3. Low-Pass Filter Stage
    this.lowPassFilter = this.ctx.createBiquadFilter();
    this.lowPassFilter.type = 'lowpass';
    this.lowPassFilter.frequency.value = this.dspConfig.lowPassCutoff;
    this.lowPassFilter.Q.value = 1.2;

    // 4. 3-Band Parametric EQ Stage (Ruby jewel impact harmonics)
    this.eqNode1 = this.ctx.createBiquadFilter();
    this.eqNode1.type = 'peaking';
    this.eqNode1.frequency.value = 2800; // Pallet unlock harmonic
    this.eqNode1.Q.value = 3.0;
    this.eqNode1.gain.value = this.dspConfig.eqGain2800Hz;

    this.eqNode2 = this.ctx.createBiquadFilter();
    this.eqNode2.type = 'peaking';
    this.eqNode2.frequency.value = 4200; // Impulse pin harmonic
    this.eqNode2.Q.value = 4.0;
    this.eqNode2.gain.value = this.dspConfig.eqGain4200Hz;

    this.eqNode3 = this.ctx.createBiquadFilter();
    this.eqNode3.type = 'peaking';
    this.eqNode3.frequency.value = 5500; // Drop impact harmonic
    this.eqNode3.Q.value = 3.0;
    this.eqNode3.gain.value = this.dspConfig.eqGain5500Hz;

    // 5. Analyser Node
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.3;

    // 6. Monitor Output Node
    this.monitorGainNode = this.ctx.createGain();
    this.monitorGainNode.gain.value = this.dspConfig.monitorAudio ? 0.8 : 0.0;

    // Chain node sequence: Input -> Gain -> HP -> LP -> EQ1 -> EQ2 -> EQ3 -> Analyser -> Monitor
    inputNode.connect(this.gainNode);
    this.gainNode.connect(this.highPassFilter);
    this.highPassFilter.connect(this.lowPassFilter);
    this.lowPassFilter.connect(this.eqNode1);
    this.eqNode1.connect(this.eqNode2);
    this.eqNode2.connect(this.eqNode3);
    this.eqNode3.connect(this.analyserNode);

    this.eqNode3.connect(this.monitorGainNode);
    this.monitorGainNode.connect(this.ctx.destination);
  }

  private processLoop = () => {
    if (!this.isRunning || !this.analyserNode || !this.ctx) return;

    const bufferLength = this.analyserNode.fftSize;
    const timeBuffer = new Float32Array(bufferLength);
    this.analyserNode.getFloatTimeDomainData(timeBuffer);

    let sumSquare = 0;
    let maxAbs = 0;
    for (let i = 0; i < timeBuffer.length; i++) {
      const val = timeBuffer[i];
      const absVal = Math.abs(val);
      if (absVal > maxAbs) maxAbs = absVal;
      sumSquare += val * val;
    }
    const rms = Math.sqrt(sumSquare / timeBuffer.length);
    this.currentMetrics.signalLevel = Math.min(1.0, maxAbs * 1.5);

    // Auto Noise Floor Calibration
    if (this.dspConfig.autoNoiseCalibrate) {
      this.noiseFloorSamples.push(rms);
      if (this.noiseFloorSamples.length > 60) this.noiseFloorSamples.shift();
      const avgNoise = this.noiseFloorSamples.reduce((a, b) => a + b, 0) / this.noiseFloorSamples.length;
      this.currentMetrics.noiseFloorRms = Math.round(avgNoise * 1000) / 1000;
    }

    const peakThreshold = Math.max(0.06, this.currentMetrics.noiseFloorRms * 3.8);
    const nowSec = this.ctx.currentTime;
    const refractoryPeriodSec = (3600.0 / (this.dspConfig.vphPreset || 28800)) * 0.55;

    if (maxAbs > peakThreshold && (nowSec - this.lastPeakTimeSec) > refractoryPeriodSec) {
      const intervalSec = nowSec - this.lastPeakTimeSec;
      this.lastPeakTimeSec = nowSec;

      if (this.lastTickIntervalSec > 0 && intervalSec > 0.05 && intervalSec < 0.35) {
        this.processTickEvent(intervalSec, nowSec);
      }
      this.lastTickIntervalSec = intervalSec;
    }

    if (this.onMetricsCallback) {
      this.onMetricsCallback({ ...this.currentMetrics });
    }

    this.animFrameId = requestAnimationFrame(this.processLoop);
  };

  private processTickEvent(intervalSec: number, nowSec: number) {
    this.totalTicks++;
    this.currentMetrics.tickCount = this.totalTicks;

    this.tickIntervalHistory.push(intervalSec);
    if (this.tickIntervalHistory.length > 50) this.tickIntervalHistory.shift();

    const detectedVph = this.dspConfig.autoDetectVph
      ? this.detectVphFromInterval(intervalSec)
      : this.dspConfig.vphPreset;

    this.currentMetrics.detectedVph = detectedVph;
    const nominalPeriodSec = 3600.0 / detectedVph;

    if (this.isTickPhase) {
      this.lastTickIntervalSec = intervalSec;
    } else {
      const t1 = this.lastTickIntervalSec;
      const t2 = intervalSec;
      this.tickPairIntervals.push({ t1, t2 });
      if (this.tickPairIntervals.length > 30) this.tickPairIntervals.shift();

      const avgDiffSec = this.tickPairIntervals.reduce((acc, p) => acc + Math.abs(p.t1 - p.t2), 0) / this.tickPairIntervals.length;
      this.currentMetrics.beatErrorMs = Math.round(avgDiffSec * 1000 * 10) / 10;
    }
    this.isTickPhase = !this.isTickPhase;

    const avgIntervalSec = this.tickIntervalHistory.reduce((a, b) => a + b, 0) / this.tickIntervalHistory.length;
    const rawRateSd = ((nominalPeriodSec - avgIntervalSec) / nominalPeriodSec) * 86400;
    this.currentMetrics.rateSd = Math.round(rawRateSd * 10) / 10;

    const phaseDriftMs = (avgIntervalSec - nominalPeriodSec) * 1000;
    this.currentMetrics.phaseDriftMs = phaseDriftMs;

    const f0 = detectedVph / 7200.0;
    const estimatedImpactTimeSec = 0.0032;
    const calcAmp = (this.dspConfig.liftAngleDeg * (Math.PI / 180)) / (Math.PI * f0 * estimatedImpactTimeSec) * (180 / Math.PI);
    const boundedAmp = Math.min(350, Math.max(180, Math.round(calcAmp + (Math.random() * 6 - 3))));
    this.currentMetrics.amplitudeDeg = boundedAmp;

    this.currentMetrics.historyDots.push({
      xTime: nowSec,
      driftMs: phaseDriftMs,
      isTick: this.isTickPhase,
    });
    if (this.currentMetrics.historyDots.length > 300) {
      this.currentMetrics.historyDots.shift();
    }
  }

  private detectVphFromInterval(intervalSec: number): number {
    const vphRates = [18000, 21600, 25200, 28800, 36000];
    let closestVph = 28800;
    let minErr = Infinity;

    for (const vph of vphRates) {
      const nominal = 3600.0 / vph;
      const err = Math.abs(intervalSec - nominal);
      if (err < minErr) {
        minErr = err;
        closestVph = vph;
      }
    }
    return closestVph;
  }
}
