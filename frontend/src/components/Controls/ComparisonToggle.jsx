import React from 'react';

/**
 * Toggle switch for comparison mode
 */
const ComparisonToggle = ({ enabled, onToggle }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      backgroundColor: enabled ? '#e8f4f8' : '#f8f9fa',
      borderRadius: '8px',
      border: `2px solid ${enabled ? '#3498db' : '#ddd'}`,
      transition: 'all 0.3s ease'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#2c3e50',
          marginBottom: '4px'
        }}>
          プロファイル比較モード
        </div>
        <div style={{
          fontSize: '11px',
          color: '#7f8c8d'
        }}>
          {enabled ? '2つのプロファイルを並べて比較' : '単一プロファイル表示'}
        </div>
      </div>

      {/* Toggle switch */}
      <label style={{
        position: 'relative',
        display: 'inline-block',
        width: '50px',
        height: '24px',
        cursor: 'pointer'
      }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          style={{
            opacity: 0,
            width: 0,
            height: 0
          }}
        />
        <span style={{
          position: 'absolute',
          cursor: 'pointer',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: enabled ? '#3498db' : '#bdc3c7',
          transition: '0.4s',
          borderRadius: '24px'
        }}>
          <span style={{
            position: 'absolute',
            content: '',
            height: '18px',
            width: '18px',
            left: enabled ? '28px' : '3px',
            bottom: '3px',
            backgroundColor: 'white',
            transition: '0.4s',
            borderRadius: '50%'
          }} />
        </span>
      </label>
    </div>
  );
};

export default ComparisonToggle;
