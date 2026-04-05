import { ForecastData, ModelType, Horizon, ResidualData } from '@/types';

type Region = 'north' | 'south' | 'east' | 'west';

/**
 * Fetch forecast data from static JSON files
 * Falls back to North region for now
 */
export async function fetchForecastData(
  model: ModelType,
  horizon: Horizon,
  _region: Region = 'north'
): Promise<ForecastData> {
  void _region;
  try {
    const response = await fetch(
      `/data/${model}/forecast_${horizon}.json`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch forecast for ${model} ${horizon}: ${response.statusText}`
      );
    }
    return response.json();
  } catch (error) {
    console.error(
      `Error fetching forecast data for ${model} ${horizon}:`,
      error
    );
    throw error;
  }
}

/**
 * Fetch residual data for heatmap visualization
 */
export async function fetchResidualData(
  model: ModelType,
  _region: Region = 'north'
): Promise<ResidualData | null> {
  void _region;
  try {
    const response = await fetch(
      `/data/${model}/residuals.json`
    );
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }

      throw new Error(
        `Failed to fetch residuals for ${model}: ${response.statusText}`
      );
    }
    return response.json();
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
  _region: Region = 'north'
): Promise<Record<string, unknown>> {
  void _region;
  try {
    const response = await fetch(
      `/data/${model}/metrics.json`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch metrics for ${model}: ${response.statusText}`
      );
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching metrics for ${model}:`, error);
    throw error;
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
  try {
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
        data[region] = results[idx];
      }
    });

    return data;
  } catch (error) {
    console.error('Error fetching forecast by regions:', error);
    throw error;
  }
}

/**
 * Export forecast data to CSV format using papaparse
 */
export function exportToCSV(
  data: ForecastData,
  model: ModelType,
  regions: string[] = ['north']
): void {
  const headers = ['Datetime', 'Load (MW)', 'Model', 'Horizon', 'Region'];
  const rows = data.forecast.map((point) => [
    point.datetime,
    point.load_mw.toString(),
    model,
    data.horizon,
    regions.join(';'),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `GridCast_${model}_${data.horizon}_${regions.join('_')}_${new Date().toISOString().split('T')[0]}.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export type { Region };
