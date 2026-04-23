'use client';

import Chart from 'react-apexcharts';
import { useMemo } from 'react';
import { ForecastData } from '@/types';

interface ModelComparisonProps {
  xgboostData: ForecastData | null;
  lstmData: ForecastData | null;
  horizon: Horizon;
  loading: boolean;
}

export function ModelComparison({
  xgboostData,
  lstmData,
  horizon,
  loading,
}: ModelComparisonProps) {
  const chartOptions = useMemo(() => {
    if (!xgboostData || !lstmData) {
      return {
        chart: { type: 'bar' as const },
        series: [],
        xaxis: { categories: [] },
      };
    }

    const metrics = ['MAE', 'RMSE', 'MAPE'];
    const xgbValues = [
      xgboostData.horizon_metrics[horizon]?.mae || 0,
      xgboostData.horizon_metrics[horizon]?.rmse || 0,
      xgboostData.horizon_metrics[horizon]?.mape || 0,
    ];
    const lstmValues = [
      lstmData.horizon_metrics[horizon]?.mae || 0,
      lstmData.horizon_metrics[horizon]?.rmse || 0,
      lstmData.horizon_metrics[horizon]?.mape || 0,
    ];

    return {
      chart: {
        type: 'bar' as const,
        toolbar: { show: false },
        fontFamily: 'DM Sans, sans-serif',
        background: 'transparent',
        height: 280,
      },
      series: [
        {
          name: 'XGBoost',
          data: xgbValues,
          color: '#4c79b8',
        },
        {
          name: 'LSTM',
          data: lstmValues,
          color: '#7C3AED',
        },
      ],
      xaxis: {
        categories: metrics,
        labels: {
          style: {
            fontSize: '12px',
            colors: '#94a3b8',
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        title: {
          text: 'Error Value',
          style: {
            fontSize: '11px',
            color: '#94a3b8',
          },
        },
        labels: {
          style: {
            fontSize: '11px',
            colors: '#94a3b8',
          },
        },
      },
      tooltip: {
        enabled: true,
        theme: 'dark',
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => val.toFixed(3),
        },
      },
      legend: {
        position: 'top' as const,
        horizontalAlign: 'right' as const,
        fontSize: '12px',
        fontFamily: 'DM Sans, sans-serif',
      },
      grid: {
        show: true,
        borderColor: '#e2e8f0',
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4,
          dataLabels: {
            position: 'top' as const,
          },
        },
      },
    };
  }, [xgboostData, lstmData, horizon]);

  if (loading) {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 h-72 animate-pulse flex items-center justify-center">
        <span className="text-sm text-[#94a3b8]">Syncing comparison data...</span>
      </div>
    );
  }

  if (!xgboostData || !lstmData) {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 flex items-center justify-center h-72">
        <span className="text-sm text-[#94a3b8]">No comparison data available</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg p-6 shadow-sm">
      <div className="mb-6 px-1">
        <h3 className="text-15px font-bold text-[#003d99] tracking-tight">
          Model Comparison
        </h3>
        <p className="text-11px text-[#94a3b8] font-medium mt-1">
          Backtest Performance: XGBoost vs LSTM ({horizon})
        </p>
      </div>
      <Chart
        options={chartOptions}
        series={chartOptions.series}
        type="bar"
        height={280}
      />
    </div>
  );
}
