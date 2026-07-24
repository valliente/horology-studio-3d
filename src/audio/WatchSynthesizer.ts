/**
 * WatchSynthesizer: Generates realistic mechanical watch acoustic tick-tock audio signals
 * using Web Audio API synthesis for offline testing, calibration, and demonstrations.
 */
export class WatchSynthesizer {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private intervalId: number | null = null;

  private targetVph: number = 28800; // default 28,800 vph
  private driftSecondsPerDay: number = 4.2; // +4.2 s/d fast
  private beatErrorMs: number = 0.3; // 0.3 ms beat error
  private outputNode: GainNode | null = null;

  constructor(audioContext?: AudioContext) {
    if (audioContext) {
      this.ctx = audioContext;
    }
  }

  public setAudioContext(ctx: AudioContext) {
    this.ctx = ctx;
  }

  public setParams(vph: number, driftSd: number, beatErrorMs: number) {
    this.targetVph = vph;
    this.driftSecondsPerDay = driftSd;
    this.beatErrorMs = beatErrorMs;
  }

  public connect(destination: AudioNode): GainNode {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    this.outputNode = this.ctx.createGain();
    this.outputNode.gain.value = 0.8;
    this.outputNode.connect(destination);
    return this.outputNode;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.scheduleNextTick(true);
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId !== null) {
      window.clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  private scheduleNextTick(isTick: boolean) {
    if (!this.isRunning || !this.ctx) return;

    const nominalPeriodSec = 3600.0 / this.targetVph; // e.g. 0.125s for 28,800 vph
    const driftFactor = 86400.0 / (86400.0 + this.driftSecondsPerDay);
    let actualPeriodSec = nominalPeriodSec * driftFactor;

    const beatErrSec = (this.beatErrorMs / 1000.0) / 2.0;
    if (isTick) {
      actualPeriodSec += beatErrSec;
    } else {
      actualPeriodSec -= beatErrSec;
    }

    this.playTickImpulse(isTick);

    const nextDelayMs = Math.max(10, actualPeriodSec * 1000.0);
    this.intervalId = window.setTimeout(() => {
      this.scheduleNextTick(!isTick);
    }, nextDelayMs);
  }

  private playTickImpulse(isTick: boolean) {
    if (!this.ctx || !this.outputNode) return;
    const now = this.ctx.currentTime;
    const baseFreq = isTick ? 3800 : 4200;

    // 3 micro-impacts per tick: unlock, impulse pin, drop impact
    this.createImpactBurst(now, baseFreq * 0.9, 0.003, 0.2);
    this.createImpactBurst(now + 0.0025, baseFreq, 0.005, 0.9);
    this.createImpactBurst(now + 0.006, baseFreq * 1.1, 0.004, 0.6);
  }

  private createImpactBurst(startTime: number, centerFreq: number, duration: number, amplitude: number) {
    if (!this.ctx || !this.outputNode) return;

    const sampleRate = this.ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (bufferSize * 0.25));
      data[i] = (Math.random() * 2 - 1) * decay;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filterNode = this.ctx.createBiquadFilter();
    filterNode.type = 'bandpass';
    filterNode.frequency.value = centerFreq;
    filterNode.Q.value = 8.0;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(amplitude * 0.7, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.outputNode);

    noiseNode.start(startTime);
    noiseNode.stop(startTime + duration + 0.001);
  }
}
