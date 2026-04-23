import {
  ForecastData,
  Horizon,
  HorizonMetrics,
  MetricsData,
  ModelType,
  ResidualData,
} from "@/types";

type Region = "north" | "south" | "east" | "west";

async function fetchJson<T>(url: string, required: boolean): Promise<T | null> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    if (!required && response.status === 404) {
      return null;
    }

    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch forecast data from static JSON files
 */
export async function fetchForecastData(
  model: ModelType,
  horizon: Horizon,
  _region: Region = "north"
): Promise<ForecastData> {
  void _region;
  const url = `/data/${model}/forecast_${horizon}.json`;

  try {
    const data = await fetchJson<ForecastData>(url, true);
    if (!data) {
      throw new Error(`Forecast unavailable for ${model} ${horizon}`);
    }
    return data;
  } catch (err) {
    console.error(`Error fetching forecast for ${model} ${horizon}`, err);
    throw err;
  }
}

/**
 * Fetch residual data for heatmap visualization
 */
export async function fetchResidualData(
  model: ModelType,
  _region: Region = "north"
): Promise<ResidualData | null> {
  void _region;

  try {
    return await fetchJson<ResidualData>(`/data/${model}/residuals.json`, false);
  } catch (error) {
    console.warn(`Residual data unavailable for ${model}:`, error);
    return null;
  }
}

/**
 * Fetch metrics data for model comparison
 */
export async function fetchMetricsData(
  model: ModelType,
  _region: Region = "north"
): Promise<MetricsData | null> {
  void _region;

  try {
    return await fetchJson<MetricsData>(`/data/${model}/metrics.json`, false);
  } catch (error) {
    console.warn(`Metrics data unavailable for ${model}:`, error);
    return null;
  }
}

/**
 * Fetch forecast for multiple regions (parallel requests)
 * Aggregates results for comparison
 */
export async function fetchForecastByRegions(
  model: ModelType,
  horizon: Horizon,
  regions: Region[]
): Promise<Partial<Record<Region, ForecastData>>> {
  const promises = regions.map((region) =>
    fetchForecastData(model, horizon, region).catch((err) => {
      console.warn(`Failed to fetch region ${region}:`, err);
      return null;
    })
  );

  const results = await Promise.all(promises);
  const data: Partial<Record<Region, ForecastData>> = {};

  regions.forEach((region, idx) => {
    if (results[idx]) {
      data[region] = results[idx] as ForecastData;
    }
  });

  return data;
}

/**
 * Export forecast data to CSV format using papaparse
 */
export function exportToCSV(
  data: ForecastData,
  model: ModelType,
  regions: string[] = ["north"]
): void {
  const headers = ["Datetime", "Load (MW)", "Model", "Horizon", "Region"];
  const rows = data.forecast.map((point) => [
    point.datetime,
    point.load_mw.toString(),
    model,
    data.horizon,
    regions.join(";"),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `GridCast_${model}_${data.horizon}_${regions.join("_")}_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getMetricForHorizon(
  horizonMetrics: Partial<Record<Horizon, HorizonMetrics>> | undefined,
  horizon: Horizon
): HorizonMetrics | null {
  if (!horizonMetrics) {
    return null;
  }

  return horizonMetrics[horizon] ?? null;
}

export function formatDateShort(rawDate: string | undefined): string {
  if (!rawDate) {
    return "N/A";
  }

  const safeDate = rawDate.replace(" ", "T");
  const parsed = new Date(safeDate);

  if (Number.isNaN(parsed.getTime())) {
    return rawDate;
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export type { Region };
