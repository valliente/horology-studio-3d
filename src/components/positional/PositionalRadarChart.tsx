import React from 'react';
import { WatchPosition } from '../dashboard/PositionalQuickBar';

interface PositionalRadarChartProps {
  positionalData: Partial<Record<WatchPosition, { rateSd: number; amplitudeDeg: number; beatErrorMs: number }>>;
}

export const PositionalRadarChart: React.FC<PositionalRadarChartProps> = ({ positionalData }) => {
  const positions: WatchPosition[] = ['DU', 'DD', 'CD', 'CU', 'CL', 'CR'];
  const center = 150;
  const radius = 100;
  const total = positions.length;

  // Compute polar coordinates (x, y) for a value normalized 0 to 1 at angle index
  const getCoordinates = (index: number, valNormalized: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = radius * valNormalized;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate SVG polygon points for Amplitude (normalized 150° to 330°)
  const pointsAmp = positions.map((pos, i) => {
    const data = positionalData[pos];
    const amp = data ? data.amplitudeDeg : 270;
    const normalized = Math.max(0.2, Math.min(1.0, (amp - 150) / 180));
    const coords = getCoordinates(i, normalized);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  // Generate SVG polygon points for Rate Drift (normalized -15s/d to +15s/d)
  const pointsRate = positions.map((pos, i) => {
    const data = positionalData[pos];
    const rate = data ? data.rateSd : 0;
    const normalized = Math.max(0.2, Math.min(1.0, (rate + 15) / 30));
    const coords = getCoordinates(i, normalized);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <div className="w-full bg-[#14161D] border border-ent-border rounded-2xl p-5 shadow-card-shadow flex flex-col items-center select-none">
      <div className="w-full flex items-center justify-between border-b border-ent-border/60 pb-3 mb-3">
        <span className="text-xs font-extrabold text-white uppercase tracking-wider">
          6-POSITIONAL POLAR RADAR PLOT
        </span>
        <div className="flex items-center gap-3 text-[10px] font-bold font-mono">
          <span className="flex items-center gap-1.5 text-ent-cyan">
            <span className="w-2.5 h-2.5 rounded-full bg-ent-cyan"></span> AMPLITUDE (°)
          </span>
          <span className="flex items-center gap-1.5 text-ent-purple">
            <span className="w-2.5 h-2.5 rounded-full bg-ent-purple"></span> RATE (s/d)
          </span>
        </div>
      </div>

      <svg width="300" height="300" className="overflow-visible">
        {/* Polar concentric grid rings */}
        {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
          <circle
            key={idx}
            cx={center}
            cy={center}
            r={radius * level}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            strokeDasharray={idx < 3 ? '4,4' : 'none'}
          />
        ))}

        {/* Polar spokes and axis labels */}
        {positions.map((pos, i) => {
          const outer = getCoordinates(i, 1.0);
          const labelCoords = getCoordinates(i, 1.18);

          return (
            <g key={pos}>
              <line
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1"
              />
              <text
                x={labelCoords.x}
                y={labelCoords.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#00F5D4"
                fontSize="11"
                fontWeight="800"
                fontFamily="JetBrains Mono, monospace"
              >
                {pos}
              </text>
            </g>
          );
        })}

        {/* Amplitude Polygon (Cyan) */}
        <polygon
          points={pointsAmp}
          fill="rgba(0, 245, 212, 0.2)"
          stroke="#00F5D4"
          strokeWidth="2.5"
        />

        {/* Rate Drift Polygon (Purple) */}
        <polygon
          points={pointsRate}
          fill="rgba(157, 78, 221, 0.2)"
          stroke="#9D4EDD"
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
};
