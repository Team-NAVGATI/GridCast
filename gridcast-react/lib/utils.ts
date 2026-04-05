import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ForecastData, Horizon, ModelType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function fetchForecastData(
  model: ModelType,
  horizon: Horizon
): Promise<ForecastData> {
  const response = await fetch(`/data/${model}/forecast_${horizon}.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch forecast data for ${model} ${horizon}`);
  }
  return response.json();
}

export function getMapeClass(mape: number): 'good' | 'warn' | 'bad' {
  if (mape < 2.0) return 'good';
  if (mape < 3.5) return 'warn';
  return 'bad';
}

export function exportToCSV(data: ForecastData, model: ModelType): void {
  const headers = ['Datetime', 'Load (MW)'];
  const rows = data.forecast.map((point) => [
    point.datetime,
    point.load_mw.toString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `gridcast_forecast_${model}_${data.horizon}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function findPeakLoad(forecast: { datetime: string; load_mw: number }[]): {
  value: number;
  datetime: string;
  index: number;
} {
  let peak = { value: 0, datetime: '', index: 0 };
  forecast.forEach((point, idx) => {
    if (point.load_mw > peak.value) {
      peak = { value: point.load_mw, datetime: point.datetime, index: idx };
    }
  });
  return peak;
}

export function findMinLoad(forecast: { datetime: string; load_mw: number }[]): {
  value: number;
  datetime: string;
  index: number;
} {
  let min = { value: Infinity, datetime: '', index: 0 };
  forecast.forEach((point, idx) => {
    if (point.load_mw < min.value) {
      min = { value: point.load_mw, datetime: point.datetime, index: idx };
    }
  });
  return min;
}
