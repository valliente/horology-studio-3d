import React, { useEffect, useRef } from 'react';
import { Sliders, Filter, RefreshCw, Volume2, Activity, Zap } from 'lucide-react';
import { ProDSPConfig } from '../../audio/ProAudioEngine';

interface DSPChainPanelProps {
  config: ProDSPConfig;
  onUpdateConfig: (newConfig: Partial<ProDSPConfig>) => void;
  onCalibrateNoiseFloor: () => void;
  noiseFloorRms: number;
}

export const DSPChainPanel: React.FC<DSPChainPanelProps> = ({
  config,
  onUpdateConfig,
  onCalibrateNoiseFloor,
  noiseFloorRms,
}) => {
  const eqCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw Parametric EQ Frequency Response Curve
  useEffect(() => {
    const canvas = eqCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 600;
    const height = 180;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#0d0f14';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Plot Parametric EQ Curve
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 8;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      const freq = (x / width) * 10000; // 0 to 10kHz
      let dbGain = 0;

      // High pass attenuation
      if (freq < config.highPassCutoff) {
        dbGain -= Math.min(24, ((config.highPassCutoff - freq) / 200) * 12);
      }
      // Low pass attenuation
      if (freq > config.lowPassCutoff) {
        dbGain -= Math.min(24, ((freq - config.lowPassCutoff) / 300) * 12);
      }

      // Peaking EQ 1 (2.8 kHz)
      const dist1 = Math.abs(freq - 2800);
      if (dist1 < 1000) {
        dbGain += config.eqGain2800Hz * Math.exp(-Math.pow(dist1 / 300, 2));
      }
      // Peaking EQ 2 (4.2 kHz)
      const dist2 = Math.abs(freq - 4200);
      if (dist2 < 1000) {
        dbGain += config.eqGain4200Hz * Math.exp(-Math.pow(dist2 / 300, 2));
      }
      // Peaking EQ 3 (5.5 kHz)
      const dist3 = Math.abs(freq - 5500);
      if (dist3 < 1000) {
        dbGain += config.eqGain5500Hz * Math.exp(-Math.pow(dist3 / 300, 2));
      }

      const y = height / 2 - dbGain * 3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Peak Marker Handles
    const drawPeakMarker = (freqHz: number, gainDb: number, label: string) => {
      const x = (freqHz / 10000) * width;
      const y = height / 2 - gainDb * 3;
      ctx.fillStyle = '#9d4edd';
      ctx.shadowColor = '#9d4edd';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = '#9d4edd';
      ctx.fillText(label, x - 15, y - 10);
    };

    drawPeakMarker(2800, config.eqGain2800Hz, '2.8k');
    drawPeakMarker(4200, config.eqGain4200Hz, '4.2k');
    drawPeakMarker(5500, config.eqGain5500Hz, '5.5k');
  }, [config]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-pro-border pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
            <Sliders className="w-6 h-6 text-pro-cyan" /> MULTI-STAGE DSP CHAIN
          </h2>
          <p className="text-xs text-pro-muted mt-1">
            Real-time Parametric EQ, Bandpass Filtering, Gain Boost, and Auto Noise Calibration
          </p>
        </div>
        <button
          onClick={onCalibrateNoiseFloor}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pro-purple/20 border border-pro-purple text-pro-purple font-extrabold text-xs hover:bg-pro-purple hover:text-white transition-all shadow-purple-glow"
        >
          <RefreshCw className="w-4 h-4" />
          <span>CALIBRATE NOISE FLOOR ({noiseFloorRms.toFixed(3)} RMS)</span>
        </button>
      </div>

      {/* Parametric EQ Visualizer Curve */}
      <div className="bg-pro-card border border-pro-border rounded-2xl p-4 shadow-card-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-pro-cyan" /> PARAMETRIC EQ FREQUENCY RESPONSE
          </span>
          <span className="text-[10px] text-pro-muted font-mono">0 Hz — 10,000 Hz</span>
        </div>
        <div className="relative w-full h-[180px] rounded-xl overflow-hidden border border-pro-border/60">
          <canvas ref={eqCanvasRef} className="w-full h-full block" />
        </div>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stage 1: Bandpass Cutoffs */}
        <div className="bg-pro-card border border-pro-border rounded-2xl p-5 space-y-4 shadow-card-shadow">
          <h3 className="text-xs font-extrabold text-pro-cyan tracking-wider uppercase flex items-center gap-2 border-b border-pro-border/60 pb-2">
            <Filter className="w-4 h-4 text-pro-cyan" /> STAGE 1: BANDPASS CUTOFFS
          </h3>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-pro-muted font-semibold">HIGH-PASS CUTOFF:</span>
              <span className="text-pro-cyan font-bold font-mono">{config.highPassCutoff} Hz</span>
            </div>
            <input
              type="range"
              min="500"
              max="4000"
              step="100"
              value={config.highPassCutoff}
              onChange={(e) => onUpdateConfig({ highPassCutoff: Number(e.target.value) })}
              className="w-full accent-pro-cyan"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-pro-muted font-semibold">LOW-PASS CUTOFF:</span>
              <span className="text-pro-purple font-bold font-mono">{config.lowPassCutoff} Hz</span>
            </div>
            <input
              type="range"
              min="4500"
              max="12000"
              step="100"
              value={config.lowPassCutoff}
              onChange={(e) => onUpdateConfig({ lowPassCutoff: Number(e.target.value) })}
              className="w-full accent-pro-purple"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-pro-muted font-semibold">INPUT GAIN BOOST:</span>
              <span className="text-pro-green font-bold font-mono">{config.gainBoost.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10.0"
              step="0.5"
              value={config.gainBoost}
              onChange={(e) => onUpdateConfig({ gainBoost: Number(e.target.value) })}
              className="w-full accent-pro-green"
            />
          </div>
        </div>

        {/* Stage 2: 3-Band Parametric EQ Harms */}
        <div className="bg-pro-card border border-pro-border rounded-2xl p-5 space-y-4 shadow-card-shadow">
          <h3 className="text-xs font-extrabold text-pro-purple tracking-wider uppercase flex items-center gap-2 border-b border-pro-border/60 pb-2">
            <Zap className="w-4 h-4 text-pro-purple" /> STAGE 2: HARMONIC PARAMETRIC EQ
          </h3>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-pro-muted font-semibold">2.8 kHz (UNLOCK HARMONIC):</span>
              <span className="text-pro-purple font-bold font-mono">
                {config.eqGain2800Hz > 0 ? `+${config.eqGain2800Hz}` : config.eqGain2800Hz} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={config.eqGain2800Hz}
              onChange={(e) => onUpdateConfig({ eqGain2800Hz: Number(e.target.value) })}
              className="w-full accent-pro-purple"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-pro-muted font-semibold">4.2 kHz (IMPULSE HARMONIC):</span>
              <span className="text-pro-cyan font-bold font-mono">
                {config.eqGain4200Hz > 0 ? `+${config.eqGain4200Hz}` : config.eqGain4200Hz} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={config.eqGain4200Hz}
              onChange={(e) => onUpdateConfig({ eqGain4200Hz: Number(e.target.value) })}
              className="w-full accent-pro-cyan"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-pro-muted font-semibold">5.5 kHz (DROP HARMONIC):</span>
              <span className="text-pro-blue font-bold font-mono">
                {config.eqGain5500Hz > 0 ? `+${config.eqGain5500Hz}` : config.eqGain5500Hz} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={config.eqGain5500Hz}
              onChange={(e) => onUpdateConfig({ eqGain5500Hz: Number(e.target.value) })}
              className="w-full accent-pro-blue"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
