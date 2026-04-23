"use client";

import { Fragment, useMemo } from "react";

interface ErrorHeatmapProps {
  matrix?: number[][] | null;
  noDataText?: string;
}

export default function ErrorHeatmap({
  matrix,
  noDataText = "No residual data available",
}: ErrorHeatmapProps) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const data = useMemo(() => {
    if (!Array.isArray(matrix) || matrix.length === 0) {
      return [];
    }

    return days.map((_, dayIdx) => {
      const row = matrix[dayIdx] ?? [];
      return hours.map((hourIdx) => {
        const value = Number(row[hourIdx]);
        return Number.isFinite(value) ? value : 0;
      });
    });
  }, [days, hours, matrix]);

  const hasData = data.length > 0;

  const colorOf = (v: number) => {
    if (v < 1.5) return "#064e3b";
    if (v < 2.5) return "#065f46";
    if (v < 3.5) return "#ca8a04";
    if (v < 5) return "#b45309";
    return "#991b1b";
  };

  return (
    <div style={{ overflowX: "auto" }}>
      {!hasData && (
        <div
          style={{
            minWidth: 500,
            height: 120,
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
      )}

      {hasData && (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `32px repeat(24, 1fr)`,
          gap: 2,
          minWidth: 500,
        }}
      >
        {/* Hour header */}
        <div />
        {hours.map((h) => (
          <div
            key={h}
            style={{ fontSize: 9, color: "#64748b", textAlign: "center" }}
          >
            {h}
          </div>
        ))}

        {/* Rows */}
        {days.map((day, di) => (
          <Fragment key={day}>
            <div
              style={{
                fontSize: 10,
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
              }}
            >
              {day}
            </div>
            {hours.map((_, hi) => (
              <div
                key={`cell-${di}-${hi}`}
                title={`${data[di][hi].toFixed(2)}% MAPE`}
                style={{
                  height: 12,
                  borderRadius: 2,
                  background: colorOf(data[di][hi]),
                  cursor: "default",
                }}
              />
            ))}
          </Fragment>
        ))}
      </div>
      )}
    </div>
  );
}
