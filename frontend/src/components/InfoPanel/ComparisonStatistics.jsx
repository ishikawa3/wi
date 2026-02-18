import React from 'react';
import { getWIColor } from '../../utils/colors';

/**
 * Comparison statistics component
 * Displays statistics for two profiles side by side
 */
const ComparisonStatistics = ({ stats1, stats2, profile1Name, profile2Name }) => {
  if (!stats1 || !stats2) {
    return (
      <div style={{
        padding: '10px',
        fontSize: '12px',
        color: '#95a5a6',
        textAlign: 'center'
      }}>
        両方のプロファイルデータが必要です
      </div>
    );
  }

  const statItems = [
    { label: '平均', key: 'mean' },
    { label: '最小', key: 'min' },
    { label: '最大', key: 'max' },
    { label: '標準偏差', key: 'std' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
        paddingBottom: '8px',
        borderBottom: '2px solid #ddd'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#7f8c8d' }}>
          項目
        </div>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#3498db',
          textAlign: 'center'
        }}>
          {profile1Name || 'プロファイル1'}
        </div>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#e74c3c',
          textAlign: 'center'
        }}>
          {profile2Name || 'プロファイル2'}
        </div>
      </div>

      {/* Stats rows */}
      {statItems.map(({ label, key }) => {
        const value1 = stats1[key];
        const value2 = stats2[key];
        const diff = value1 - value2;
        const diffPercent = ((diff / value2) * 100).toFixed(1);

        return (
          <div
            key={key}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#2c3e50'
            }}>
              {label}
            </div>

            {/* Value 1 */}
            <div style={{
              textAlign: 'center',
              padding: '6px',
              backgroundColor: '#ecf0f1',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 600,
              color: getWIColor(value1)
            }}>
              {value1.toFixed(1)}
            </div>

            {/* Value 2 */}
            <div style={{
              textAlign: 'center',
              padding: '6px',
              backgroundColor: '#ecf0f1',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 600,
              color: getWIColor(value2)
            }}>
              {value2.toFixed(1)}
            </div>
          </div>
        );
      })}

      {/* Difference summary */}
      <div style={{
        marginTop: '8px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        border: '1px solid #ddd'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#7f8c8d',
          marginBottom: '6px',
          fontWeight: 600
        }}>
          平均値の差
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 700,
            color: stats1.mean > stats2.mean ? '#27ae60' : '#e74c3c'
          }}>
            {stats1.mean > stats2.mean ? '+' : ''}{(stats1.mean - stats2.mean).toFixed(2)}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#7f8c8d'
          }}>
            ({stats1.mean > stats2.mean ? '+' : ''}{((stats1.mean - stats2.mean) / stats2.mean * 100).toFixed(1)}%)
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonStatistics;
