import React from 'react';
import { getWIColor } from '../../utils/colors';

/**
 * Statistics display component
 */
const Statistics = ({ statistics }) => {
  if (!statistics) {
    return (
      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>
        統計情報がありません
      </div>
    );
  }

  const statItems = [
    { label: '平均', value: statistics.mean, format: (v) => v.toFixed(1) },
    { label: '最小値', value: statistics.min, format: (v) => v.toFixed(1) },
    { label: '最大値', value: statistics.max, format: (v) => v.toFixed(1) },
    { label: '標準偏差', value: statistics.std, format: (v) => v.toFixed(1) },
    { label: '中央値', value: statistics.median, format: (v) => v.toFixed(1) },
    { label: 'セル数', value: statistics.count, format: (v) => v.toLocaleString() }
  ];

  // Visual range display
  const mean = statistics.mean;
  const meanPosition = mean;

  return (
    <div style={{
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>
        統計情報
      </h3>

      {/* Visual score range */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '5px',
          fontSize: '12px',
          color: '#666'
        }}>
          <span>0</span>
          <span style={{ fontWeight: 600, color: '#2c3e50' }}>
            平均: {mean.toFixed(1)}
          </span>
          <span>100</span>
        </div>
        <div style={{
          position: 'relative',
          height: '20px',
          background: 'linear-gradient(to right, #d73027, #fc8d59, #fee090, #91cf60, #1a9850)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {/* Mean indicator */}
          <div style={{
            position: 'absolute',
            left: `${meanPosition}%`,
            top: '0',
            bottom: '0',
            width: '3px',
            backgroundColor: '#2c3e50',
            boxShadow: '0 0 4px rgba(0,0,0,0.5)'
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '5px',
          fontSize: '11px',
          color: '#999'
        }}>
          <span>Min: {statistics.min.toFixed(1)}</span>
          <span>Max: {statistics.max.toFixed(1)}</span>
        </div>
      </div>

      {/* Detailed stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {statItems.map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px'
            }}
          >
            <span style={{ fontSize: '13px', color: '#555' }}>
              {item.label}
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: item.label === '平均' || item.label === '中央値'
                ? getWIColor(item.value)
                : '#2c3e50'
            }}>
              {item.format(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
