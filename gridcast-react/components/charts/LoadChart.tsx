"use client";

interface LoadChartProps {
  actual?: number[];
  forecast?: number[];
  optimized?: number[];
  labels?: string[];
  height?: number;
  showAxis?: boolean;
  noDataText?: string;
}

export default function LoadChart({
  actual = [],
  forecast = [],
  optimized,
  labels,
  height = 200,
  showAxis = true,
  noDataText = "No real forecast data available",
}: LoadChartProps) {
  const hasData =
    actual.length > 0 || forecast.length > 0 || (optimized?.length ?? 0) > 0;

  if (!hasData) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed #1e3a4a",
          borderRadius: 8,
          color: "#64748b",
          fontSize: 12,
        }}
      >
        {noDataText}
      </div>
    );
  }

  const w = 700,
    h = height;
  const pad = { t: 16, r: 20, b: showAxis ? 32 : 8, l: showAxis ? 52 : 8 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;

  const allVals = [...actual, ...forecast, ...(optimized ?? [])];
  const min = Math.min(...allVals) - 100;
  const max = Math.max(...allVals) + 100;

  const len = Math.max(actual.length, forecast.length, optimized?.length ?? 0, 1);

  const xOf = (i: number) => {
    if (len <= 1) {
      return pad.l + cw / 2;
    }
    return pad.l + (i / (len - 1)) * cw;
  };

  const yOf = (v: number) => pad.t + ch - ((v - min) / (max - min)) * ch;

  const points = (series: number[]) =>
    series.map((v, i) => `${xOf(i)},${yOf(v)}`).join(" ");

  const apts = points(actual);
  const fpts = points(forecast);
  const opts = optimized ? points(optimized) : "";

  const upper = forecast.map((v) => v + 150);
  const lower = forecast.map((v) => v - 150);
  const bandPts = [
    ...upper.map((v, i) => `${xOf(i)},${yOf(v)}`),
    ...[...lower].reverse().map((v, i) => `${xOf(forecast.length - 1 - i)},${yOf(v)}`),
  ].join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const xTickCount = Math.min(7, len);
  const xTickIndexes = Array.from({ length: xTickCount }, (_, i) =>
    Math.round((i / Math.max(1, xTickCount - 1)) * (len - 1))
  );

  const tickLabelOf = (idx: number) => {
    const raw = labels?.[idx];
    if (!raw) {
      if (len <= 1) {
        return "00:00";
      }
      const hours = Math.round((idx / (len - 1)) * 24);
      return `${String(hours).padStart(2, "0")}:00`;
    }

    const parts = raw.split(" ");
    const timePart = parts.length > 1 ? parts[1] : parts[0];
    return timePart.slice(0, 5);
  };

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{ display: "block" }}
      role="img"
      aria-label="Electricity load forecast chart"
    >
      {/* Confidence band */}
      {!optimized && forecast.length > 1 && (
        <polygon points={bandPts} fill="#06b6d4" fillOpacity="0.07" />
      )}

      {/* Grid lines */}
      {yTicks.map((t) => (
        <line
          key={t}
          x1={pad.l}
          x2={pad.l + cw}
          y1={pad.t + t * ch}
          y2={pad.t + t * ch}
          stroke="#1e3a4a"
          strokeWidth="0.5"
        />
      ))}

      {/* Actual load (unoptimized) */}
      {actual.length > 1 && (
        <polyline
          points={apts}
          fill="none"
          stroke={optimized ? "rgba(100, 116, 139, 0.5)" : "#0e7490"}
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.7"
        />
      )}

      {/* Forecast */}
      {!optimized && forecast.length > 1 && (
        <polyline
          points={fpts}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}

      {/* Optimized Load */}
      {optimized && optimized.length > 1 && (
        <polyline
          points={opts}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}

      {showAxis && (
        <>
          {/* Y-axis labels */}
          {yTicks.map((t) => {
            const v = Math.round(min + (1 - t) * (max - min));
            return (
              <text
                key={t}
                x={pad.l - 6}
                y={pad.t + t * ch + 4}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
                fontFamily="JetBrains Mono, monospace"
              >
                {v}
              </text>
            );
          })}

          {/* X-axis labels */}
          {xTickIndexes.map((idx) => (
            <text
              key={`tick-${idx}`}
              x={xOf(idx)}
              y={pad.t + ch + 20}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {tickLabelOf(idx)}
            </text>
          ))}
        </>
      )}
    </svg>
  );
}
