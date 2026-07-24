import React, { useEffect, useRef, useState } from 'react';
import { AudioWaveform, Sliders, Activity, Disc, Zap } from 'lucide-react';
import { WatchMetrics } from '../../audio/ProAudioEngine';

export type VisualizerMode = 'dotdrift' | 'oscilloscope' | 'spectrum';

interface LiveOscilloscopeProps {
  analyserNode: AnalyserNode | null;
  metrics: WatchMetrics;
  isRunning: boolean;
}

export const LiveOscilloscope: React.FC<LiveOscilloscopeProps> = ({
  analyserNode,
  metrics,
  isRunning,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('dotdrift');
  const [sweepSpeed, setSweepSpeed] = useState<number>(2);

  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.parentElement?.clientWidth || 800;
      const height = canvas.parentElement?.clientHeight || 450;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.fillStyle = '#0a0c10';
      ctx.fillRect(0, 0, width, height);

      drawGrid(ctx, width, height);

      if (mode === 'oscilloscope') {
        drawOscilloscope(ctx, width, height, analyserNode);
      } else if (mode === 'dotdrift') {
        drawDotDriftTape(ctx, width, height, metrics.historyDots, metrics.rateSd);
      } else if (mode === 'spectrum') {
        drawSpectrum(ctx, width, height, analyserNode);
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [mode, analyserNode, metrics, sweepSpeed]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.05)';

    const step = 40;
    ctx.beginPath();
    for (let x = 0; x <= width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Center crosshair line
    ctx.strokeStyle = 'rgba(0, 245, 212, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  const drawOscilloscope = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    analyser: AnalyserNode | null
  ) => {
    if (!analyser || !isRunning) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00f5d4';
      ctx.shadowColor = '#00f5d4';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      return;
    }

    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(dataArray);

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#00f5d4';
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i];
      const y = height / 2 + v * (height / 2.5);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const drawDotDriftTape = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    historyDots: Array<{ xTime: number; driftMs: number; isTick: boolean }>,
    currentRateSd: number
  ) => {
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = '#00f5d4';
    ctx.fillText('PAPER TAPE DRIFT PLOT [TIME vs PHASE DRIFT]', 20, 25);

    ctx.strokeStyle = 'rgba(157, 78, 221, 0.3)';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (historyDots.length === 0 || !isRunning) {
      const time = Date.now() * 0.001;
      ctx.fillStyle = '#00f5d4';
      ctx.shadowColor = '#00f5d4';
      ctx.shadowBlur = 6;
      for (let x = 0; x < width; x += 12 * sweepSpeed) {
        const driftY = height / 2 - x * (currentRateSd || 4.2) * 0.08;
        ctx.beginPath();
        ctx.arc(x, driftY + Math.sin(x * 0.05 + time) * 1.5, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, driftY + Math.sin(x * 0.05 + time) * 1.5 + 6, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      return;
    }

    const dotSpacing = 3 * sweepSpeed;
    const startX = width - historyDots.length * dotSpacing;

    ctx.shadowBlur = 8;
    historyDots.forEach((dot, index) => {
      const x = startX + index * dotSpacing;
      if (x < 0 || x > width) return;

      const driftSlope = currentRateSd * (index * 0.015);
      const y = height / 2 - (driftSlope + dot.driftMs * 2);

      if (dot.isTick) {
        ctx.fillStyle = '#00f5d4';
        ctx.shadowColor = '#00f5d4';
      } else {
        ctx.fillStyle = '#9d4edd';
        ctx.shadowColor = '#9d4edd';
      }

      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  };

  const drawSpectrum = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    analyser: AnalyserNode | null
  ) => {
    if (!analyser || !isRunning) {
      ctx.fillStyle = 'rgba(0, 245, 212, 0.15)';
      ctx.fillRect(0, height - 4, width, 4);
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const sampleRate = analyser.context.sampleRate;
    const nyquist = sampleRate / 2;
    const bandLowX = (2500 / nyquist) * width;
    const bandHighX = (6500 / nyquist) * width;

    // Highlight passband
    ctx.fillStyle = 'rgba(157, 78, 221, 0.1)';
    ctx.fillRect(bandLowX, 0, bandHighX - bandLowX, height);
    ctx.strokeStyle = 'rgba(157, 78, 221, 0.5)';
    ctx.strokeRect(bandLowX, 0, bandHighX - bandLowX, height);

    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#9d4edd';
    ctx.fillText('JEWEL HARMONIC PASSBAND [2.5 kHz - 6.5 kHz]', bandLowX + 10, 20);

    const barWidth = (width / bufferLength) * 2.2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * (height * 0.85);
      const freqHz = (i / bufferLength) * nyquist;

      if (freqHz >= 2500 && freqHz <= 6500) {
        ctx.fillStyle = '#00f5d4';
        ctx.shadowColor = '#00f5d4';
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.shadowBlur = 0;
      }

      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
      x += barWidth;
      if (x > width) break;
    }
    ctx.shadowBlur = 0;
  };

  return (
    <div className="w-full flex-1 min-h-[380px] bg-[#07090e] flex flex-col relative overflow-hidden border-b border-pro-border">
      {/* Visualizer Toolbar */}
      <div className="w-full bg-[#0d0f14]/90 backdrop-blur border-b border-pro-border/60 px-4 py-2 flex flex-wrap items-center justify-between gap-3 z-10 select-none">
        <div className="flex items-center gap-2 bg-[#161a23] p-1 rounded-xl border border-pro-border">
          <button
            onClick={() => setMode('dotdrift')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'dotdrift'
                ? 'bg-pro-cyan/20 border border-pro-cyan text-pro-cyan shadow-cyan-glow'
                : 'text-pro-muted hover:text-white'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>DOT DRIFT TAPE</span>
          </button>

          <button
            onClick={() => setMode('oscilloscope')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'oscilloscope'
                ? 'bg-pro-purple/20 border border-pro-purple text-pro-purple shadow-purple-glow'
                : 'text-pro-muted hover:text-white'
            }`}
          >
            <AudioWaveform className="w-3.5 h-3.5" />
            <span>OSCILLOSCOPE WAVE</span>
          </button>

          <button
            onClick={() => setMode('spectrum')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'spectrum'
                ? 'bg-pro-blue/20 border border-pro-blue text-pro-blue shadow-blue-glow'
                : 'text-pro-muted hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>FFT SPECTRUM</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-pro-muted">
          <span className="font-semibold text-pro-cyan">SWEEP SPEED:</span>
          {[1, 2, 4].map((speed) => (
            <button
              key={speed}
              onClick={() => setSweepSpeed(speed)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                sweepSpeed === speed
                  ? 'bg-pro-cyan text-black border-pro-cyan font-black'
                  : 'bg-pro-card border-pro-border text-pro-muted hover:text-white'
              }`}
            >
              {speed}X
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex-1 w-full h-full crt-grid-pro">
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="absolute inset-0 crt-scanline-pro pointer-events-none" />
      </div>
    </div>
  );
};

export const CRTVisualizer = LiveOscilloscope;
