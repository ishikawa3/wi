import React, { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/**
 * Amenity Contribution Radar Chart Component
 * Displays amenity_scores as a radar chart for a selected grid point
 */
const AmenityRadarChart = ({ amenityScores, darkMode = false }) => {
  const textColor = darkMode ? '#ecf0f1' : '#2c3e50';
  const gridColor = darkMode ? 'rgba(236,240,241,0.2)' : 'rgba(0,0,0,0.1)';

  const chartData = useMemo(() => {
    if (!amenityScores || Object.keys(amenityScores).length === 0) return null;

    const labels = Object.keys(amenityScores);
    const values = labels.map(k => +(amenityScores[k] * 100).toFixed(1));

    return {
      labels,
      datasets: [
        {
          label: 'スコア (%)',
          data: values,
          backgroundColor: 'rgba(52, 152, 219, 0.25)',
          borderColor: 'rgba(52, 152, 219, 0.9)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(52, 152, 219, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(52, 152, 219, 1)',
          pointRadius: 4,
        },
      ],
    };
  }, [amenityScores]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed.r.toFixed(1)}%`,
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: darkMode ? '#bdc3c7' : '#888',
          backdropColor: 'transparent',
          font: { size: 9 },
        },
        grid: { color: gridColor },
        angleLines: { color: gridColor },
        pointLabels: {
          color: textColor,
          font: { size: 10 },
        },
      },
    },
  };

  if (!chartData) return null;

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{
        fontSize: '13px',
        fontWeight: 600,
        color: textColor,
        marginBottom: '8px',
        paddingBottom: '6px',
        borderBottom: '2px solid #e67e22',
      }}>
        アメニティ寄与度レーダー
      </div>
      <div style={{ height: '240px' }}>
        <Radar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AmenityRadarChart;
