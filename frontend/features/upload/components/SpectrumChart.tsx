"use client";

import type { SpectrumData } from "../types";

interface SpectrumChartProps {
  data: SpectrumData;
}

function formatFrequency(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return `${Math.round(value)}`;
}

export function SpectrumChart({ data }: SpectrumChartProps) {
  if (!data.frequencies_hz.length || !data.magnitudes_db.length) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-[#3A3A3A] bg-[#1C1C1C]">
        <p className="font-mono text-xs text-[#6B6B6B]">No spectrum data available.</p>
      </div>
    );
  }

  const width = 680;
  const height = 220;
  const pad = 24;

  const minMag = Math.min(...data.magnitudes_db);
  const maxMag = Math.max(...data.magnitudes_db);
  const magRange = Math.max(maxMag - minMag, 1);

  const maxFreq = data.frequencies_hz[data.frequencies_hz.length - 1] || 1;

  const points = data.frequencies_hz
    .map((freq, i) => {
      const x = pad + (freq / maxFreq) * (width - pad * 2);
      const normalized = (data.magnitudes_db[i] - minMag) / magRange;
      const y = height - pad - normalized * (height - pad * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const xTicks = [0, maxFreq * 0.25, maxFreq * 0.5, maxFreq * 0.75, maxFreq];
  const yTicks = [minMag, minMag + magRange * 0.33, minMag + magRange * 0.66, maxMag];

  return (
    <div className="rounded-lg border border-[#3A3A3A] bg-[#1C1C1C] p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        {yTicks.map((tick) => {
          const normalized = (tick - minMag) / magRange;
          const y = height - pad - normalized * (height - pad * 2);
          return (
            <g key={`y-${tick.toFixed(2)}`}>
              <line x1={pad} y1={y} x2={width - pad} y2={y} stroke="#3A3A3A" strokeWidth="1" />
              <text x={4} y={y + 4} fontSize="10" fill="#6B6B6B" fontFamily="monospace">
                {tick.toFixed(0)} dB
              </text>
            </g>
          );
        })}

        {xTicks.map((tick) => {
          const x = pad + (tick / maxFreq) * (width - pad * 2);
          return (
            <g key={`x-${tick.toFixed(2)}`}>
              <line x1={x} y1={pad} x2={x} y2={height - pad} stroke="#2B2B2B" strokeWidth="1" />
              <text x={x} y={height - 6} textAnchor="middle" fontSize="10" fill="#6B6B6B" fontFamily="monospace">
                {formatFrequency(tick)} Hz
              </text>
            </g>
          );
        })}

        <polyline fill="none" stroke="#FF6F00" strokeWidth="2" points={points} />
      </svg>
    </div>
  );
}
