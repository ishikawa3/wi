import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { calculateHistogramBins } from '../../utils/chartHelpers';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * WI Score Histogram Component
 * Displays distribution of WI scores in a bar chart using Chart.js
 */
const WIHistogram = ({ wiData, title = 'WIスコア分布' }) => {
  // Calculate histogram data using useMemo for performance
  const chartData = useMemo(() => {
    if (!wiData?.features) return null;

    // Extract WI scores from GeoJSON features
    const scores = wiData.features.map(f => f.properties.wi_score || 0);

    // Calculate histogram bins (10 bins)
    const bins = calculateHistogramBins(scores, 10);

    if (!bins || bins.length === 0) return null;

    return {
      labels: bins.map(b => b.label),
      datasets: [
        {
          label: 'セル数',
          data: bins.map(b => b.count),
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
          borderColor: 'rgba(52, 152, 219, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [wiData]);

  // Chart.js options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 14,
          weight: '600',
        },
        color: '#2c3e50',
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return `スコア範囲: ${tooltipItems[0].label}`;
          },
          label: (context) => {
            return `セル数: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'セル数',
          font: {
            size: 11,
          },
          color: '#555',
        },
        ticks: {
          precision: 0,
          font: {
            size: 10,
          },
          color: '#666',
        },
        grid: {
          color: '#e0e0e0',
        },
      },
      x: {
        title: {
          display: true,
          text: 'WIスコア範囲',
          font: {
            size: 11,
          },
          color: '#555',
        },
        ticks: {
          font: {
            size: 9,
          },
          color: '#666',
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  // Loading state
  if (!chartData) {
    return (
      <div style={{
        height: '250px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#95a5a6',
        fontSize: '13px',
      }}>
        データがありません
      </div>
    );
  }

  return (
    <div style={{ height: '250px' }} data-chart-type="histogram">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default WIHistogram;
