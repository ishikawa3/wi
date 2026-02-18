import React, { useMemo } from 'react';
import { calculateBoxPlotData } from '../../utils/chartHelpers';

/**
 * WI Score Box Plot Component
 * Displays quartiles, median, min, max, and outliers using custom SVG
 */
const WIBoxPlot = ({ wiData, width = 300, height = 200 }) => {
  // Calculate box plot data using useMemo for performance
  const plotData = useMemo(() => {
    if (!wiData?.features) return null;

    // Extract WI scores from GeoJSON features
    const scores = wiData.features.map(f => f.properties.wi_score || 0);

    return calculateBoxPlotData(scores);
  }, [wiData]);

  if (!plotData) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '20px',
        color: '#95a5a6',
        fontSize: '13px',
      }}>
        データがありません
      </div>
    );
  }

  const { min, q1, median, q3, max, outliers } = plotData;

  // SVG layout constants
  const padding = 20;
  const plotHeight = height - 2 * padding;
  const centerX = width / 2;
  const boxWidth = 60;

  // Convert WI score (0-100) to Y coordinate
  const valueToY = (value) => {
    return height - padding - (value / 100) * plotHeight;
  };

  return (
    <div data-chart-type="boxplot">
      <h4 style={{
        textAlign: 'center',
        fontSize: '14px',
        marginBottom: '10px',
        marginTop: '0',
        color: '#2c3e50',
        fontWeight: 600,
      }}>
        WIスコア箱ひげ図
      </h4>

      <svg width={width} height={height}>
        {/* Vertical line connecting min to max */}
        <line
          x1={centerX}
          y1={valueToY(min)}
          x2={centerX}
          y2={valueToY(max)}
          stroke="#333"
          strokeWidth="1.5"
        />

        {/* Box (Q1 to Q3) */}
        <rect
          x={centerX - boxWidth / 2}
          y={valueToY(q3)}
          width={boxWidth}
          height={valueToY(q1) - valueToY(q3)}
          fill="rgba(52, 152, 219, 0.3)"
          stroke="#3498db"
          strokeWidth="2"
        />

        {/* Median line */}
        <line
          x1={centerX - boxWidth / 2}
          y1={valueToY(median)}
          x2={centerX + boxWidth / 2}
          y2={valueToY(median)}
          stroke="#e74c3c"
          strokeWidth="2.5"
        />

        {/* Min horizontal line */}
        <line
          x1={centerX - 15}
          y1={valueToY(min)}
          x2={centerX + 15}
          y2={valueToY(min)}
          stroke="#333"
          strokeWidth="1.5"
        />

        {/* Max horizontal line */}
        <line
          x1={centerX - 15}
          y1={valueToY(max)}
          x2={centerX + 15}
          y2={valueToY(max)}
          stroke="#333"
          strokeWidth="1.5"
        />

        {/* Outliers */}
        {outliers && outliers.map((value, i) => (
          <circle
            key={i}
            cx={centerX}
            cy={valueToY(value)}
            r="3"
            fill="#e74c3c"
          />
        ))}

        {/* Labels */}
        <text
          x={centerX + boxWidth / 2 + 10}
          y={valueToY(max) + 4}
          fontSize="10"
          fill="#555"
        >
          Max: {max.toFixed(1)}
        </text>

        <text
          x={centerX + boxWidth / 2 + 10}
          y={valueToY(q3) + 4}
          fontSize="10"
          fill="#555"
        >
          Q3: {q3.toFixed(1)}
        </text>

        <text
          x={centerX + boxWidth / 2 + 10}
          y={valueToY(median) + 4}
          fontSize="10"
          fill="#e74c3c"
          fontWeight="600"
        >
          Med: {median.toFixed(1)}
        </text>

        <text
          x={centerX + boxWidth / 2 + 10}
          y={valueToY(q1) + 4}
          fontSize="10"
          fill="#555"
        >
          Q1: {q1.toFixed(1)}
        </text>

        <text
          x={centerX + boxWidth / 2 + 10}
          y={valueToY(min) + 4}
          fontSize="10"
          fill="#555"
        >
          Min: {min.toFixed(1)}
        </text>

        {/* Y-axis scale indicators */}
        <text x="5" y="20" fontSize="9" fill="#999">100</text>
        <text x="5" y={height / 2} fontSize="9" fill="#999">50</text>
        <text x="5" y={height - 10} fontSize="9" fill="#999">0</text>
      </svg>

      {/* Outliers legend */}
      {outliers && outliers.length > 0 && (
        <div style={{
          marginTop: '10px',
          fontSize: '10px',
          color: '#7f8c8d',
          textAlign: 'center',
        }}>
          外れ値: {outliers.length}個
        </div>
      )}
    </div>
  );
};

export default WIBoxPlot;
