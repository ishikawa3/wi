import React from 'react';

/**
 * Difference Statistics Component
 * Displays statistical comparison between two profiles with difference calculations
 */
const DifferenceStatistics = ({
  wiData1,
  wiData2,
  profile1Name,
  profile2Name
}) => {
  if (!wiData1?.metadata?.statistics || !wiData2?.metadata?.statistics) {
    return (
      <div style={{
        padding: '15px',
        textAlign: 'center',
        color: '#95a5a6',
        fontSize: '13px',
      }}>
        統計データなし
      </div>
    );
  }

  const stats1 = wiData1.metadata.statistics;
  const stats2 = wiData2.metadata.statistics;

  // Statistical items to display
  const statItems = [
    { label: '平均', key: 'mean' },
    { label: '最小', key: 'min' },
    { label: '最大', key: 'max' },
    { label: '標準偏差', key: 'std' },
  ];

  return (
    <div style={{
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '8px',
    }}>
      <h3 style={{
        fontSize: '14px',
        marginBottom: '15px',
        marginTop: '0',
        color: '#2c3e50',
        fontWeight: 600,
      }}>
        差分統計
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr 1fr',
        gap: '10px 12px',
        fontSize: '11px',
      }}>
        {/* Header row */}
        <div style={{ fontWeight: 600, color: '#555' }}>
          項目
        </div>
        <div style={{
          fontWeight: 600,
          color: '#3498db',
          textAlign: 'right',
        }}>
          {profile1Name || 'Profile 1'}
        </div>
        <div style={{
          fontWeight: 600,
          color: '#e74c3c',
          textAlign: 'right',
        }}>
          {profile2Name || 'Profile 2'}
        </div>

        {/* Data rows */}
        {statItems.map(({ label, key }) => {
          const val1 = stats1[key];
          const val2 = stats2[key];
          const diff = val1 - val2;
          const diffPercent = val2 !== 0 ? ((diff / val2) * 100).toFixed(1) : '0.0';

          return (
            <React.Fragment key={key}>
              <div style={{ color: '#7f8c8d' }}>
                {label}
              </div>

              <div style={{
                color: '#3498db',
                textAlign: 'right',
                fontWeight: 500,
              }}>
                {val1.toFixed(2)}
              </div>

              <div style={{
                color: '#e74c3c',
                textAlign: 'right',
                fontWeight: 500,
              }}>
                {val2.toFixed(2)}
                <span style={{
                  marginLeft: '4px',
                  fontSize: '10px',
                  color: diff >= 0 ? '#27ae60' : '#c0392b',
                  fontWeight: 600,
                }}>
                  ({diff >= 0 ? '+' : ''}{diff.toFixed(1)})
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Summary info */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '10px',
        color: '#7f8c8d',
      }}>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: 600, color: '#3498db' }}>
            {profile1Name || 'Profile 1'}
          </span>
          {' '}の平均WI:{' '}
          <span style={{ fontWeight: 600 }}>
            {stats1.mean.toFixed(1)}
          </span>
        </div>
        <div>
          <span style={{ fontWeight: 600, color: '#e74c3c' }}>
            {profile2Name || 'Profile 2'}
          </span>
          {' '}の平均WI:{' '}
          <span style={{ fontWeight: 600 }}>
            {stats2.mean.toFixed(1)}
          </span>
        </div>
        <div style={{
          marginTop: '6px',
          paddingTop: '6px',
          borderTop: '1px solid #e0e0e0',
        }}>
          平均差分:{' '}
          <span style={{
            fontWeight: 600,
            color: stats1.mean - stats2.mean >= 0 ? '#27ae60' : '#c0392b',
          }}>
            {stats1.mean - stats2.mean >= 0 ? '+' : ''}
            {(stats1.mean - stats2.mean).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DifferenceStatistics;
