import { useEffect, useState } from "react";
import { Horizon, ModelType } from "@/types";
import { fetchForecastData, fetchResidualData, getMetricForHorizon } from "@/lib/api";
import { INDIA_GRID_EMISSION_FACTOR, INR_PER_KWH } from "./constants";

interface PredictiveSavings {
  co2Saved: number;
  savingsMWh: number;
  inrSaved: number;
  treesEquiv: number;
  homeEquiv: number;
  carsEquiv: number;
  coalEquiv: number;
}

interface PredictiveChartData {
  timestamps: string[];
  actual: number[];
  forecast: number[];
  optimized: number[];
}

interface PredictiveMetrics {
  mape: number | null;
  mae: number | null;
  rmse: number | null;
  trainedAt: string;
  dataEnd: string;
}

interface PredictiveEngineState {
  loading: boolean;
  error: string | null;
  savings: PredictiveSavings;
  chartData: PredictiveChartData | null;
  residualMatrix: number[][] | null;
  metrics: PredictiveMetrics;
}

const EMPTY_SAVINGS: PredictiveSavings = {
  co2Saved: 0,
  savingsMWh: 0,
  inrSaved: 0,
  treesEquiv: 0,
  homeEquiv: 0,
  carsEquiv: 0,
  coalEquiv: 0,
};

const EMPTY_METRICS: PredictiveMetrics = {
  mape: null,
  mae: null,
  rmse: null,
  trainedAt: "",
  dataEnd: "",
};

export function usePredictiveEngine(
  baseLoadMW: number,
  model: ModelType = "xgboost",
  horizon: Horizon = "24h"
): PredictiveEngineState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savings, setSavings] = useState<PredictiveSavings>(EMPTY_SAVINGS);
  const [chartData, setChartData] = useState<PredictiveChartData | null>(null);
  const [residualMatrix, setResidualMatrix] = useState<number[][] | null>(null);
  const [metrics, setMetrics] = useState<PredictiveMetrics>(EMPTY_METRICS);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const [forecastData, residualData] = await Promise.all([
          fetchForecastData(model, horizon),
          fetchResidualData(model),
        ]);

        if (!active) {
          return;
        }

        const gridForecast = forecastData.forecast.map((point) => point.load_mw);
        const timestamps = forecastData.forecast.map((point) => point.datetime);

        if (gridForecast.length === 0) {
          throw new Error(`No forecast points in ${model} ${horizon} data`);
        }

        const gridAverage =
          gridForecast.reduce((sum, value) => sum + value, 0) / gridForecast.length;
        const scalar = baseLoadMW / gridAverage;

        const companyActual = gridForecast.map((value) => value * scalar);
        const sorted = [...companyActual].sort((a, b) => a - b);
        const peakThreshold =
          sorted[Math.floor(sorted.length * 0.75)] ?? sorted[sorted.length - 1] ?? 0;

        const optimized = companyActual.map((value) =>
          value >= peakThreshold ? value * 0.9 : value * 0.97
        );

        const originalMWhDay = companyActual.reduce((sum, value) => sum + value, 0) / 4;
        const optimizedMWhDay = optimized.reduce((sum, value) => sum + value, 0) / 4;
        const savingsMWhDay = Math.max(0, originalMWhDay - optimizedMWhDay);
        const annualSavingsMWh = savingsMWhDay * 365;

        const annualInrSaved = annualSavingsMWh * 1000 * INR_PER_KWH;
        const annualCo2Saved = annualSavingsMWh * INDIA_GRID_EMISSION_FACTOR;

        const horizonMetric = getMetricForHorizon(forecastData.horizon_metrics, horizon);

        setChartData({
          timestamps,
          actual: companyActual,
          forecast: companyActual,
          optimized,
        });

        setSavings({
          co2Saved: annualCo2Saved,
          savingsMWh: annualSavingsMWh,
          inrSaved: annualInrSaved,
          treesEquiv: Math.round(annualCo2Saved / 0.021),
          homeEquiv: Math.round(annualSavingsMWh / 9.6),
          carsEquiv: annualCo2Saved / 4.6,
          coalEquiv: annualSavingsMWh * 0.5,
        });

        setResidualMatrix(residualData?.heatmap_matrix ?? null);
        setMetrics({
          mape: horizonMetric?.mape ?? null,
          mae: horizonMetric?.mae ?? null,
          rmse: horizonMetric?.rmse ?? null,
          trainedAt: forecastData.trained_at,
          dataEnd: forecastData.data_end,
        });
      } catch (err) {
        if (!active) {
          return;
        }

        const message = err instanceof Error ? err.message : "Failed to load predictive data";
        setError(message);
        setChartData(null);
        setResidualMatrix(null);
        setSavings(EMPTY_SAVINGS);
        setMetrics(EMPTY_METRICS);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [baseLoadMW, model, horizon]);

  return {
    loading,
    error,
    savings,
    chartData,
    residualMatrix,
    metrics,
  };
}
