import React from 'react';

/**
 * Comparison Mode Selector Component
 * Toggle button to switch between side-by-side and difference view
 */
const ComparisonModeSelector = ({ mode, onModeChange }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      marginTop: '10px',
      marginBottom: '10px',
    }}>
      <button
        onClick={() => onModeChange('sideBySide')}
        style={{
          flex: 1,
          padding: '8px',
          backgroundColor: mode === 'sideBySide' ? '#3498db' : '#ecf0f1',
          color: mode === 'sideBySide' ? 'white' : '#555',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => {
          if (mode !== 'sideBySide') {
            e.target.style.backgroundColor = '#d5dbdb';
          }
        }}
        onMouseOut={(e) => {
          if (mode !== 'sideBySide') {
            e.target.style.backgroundColor = '#ecf0f1';
          }
        }}
      >
        サイドバイサイド
      </button>

      <button
        onClick={() => onModeChange('difference')}
        style={{
          flex: 1,
          padding: '8px',
          backgroundColor: mode === 'difference' ? '#3498db' : '#ecf0f1',
          color: mode === 'difference' ? 'white' : '#555',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => {
          if (mode !== 'difference') {
            e.target.style.backgroundColor = '#d5dbdb';
          }
        }}
        onMouseOut={(e) => {
          if (mode !== 'difference') {
            e.target.style.backgroundColor = '#ecf0f1';
          }
        }}
      >
        差分表示
      </button>
    </div>
  );
};

export default ComparisonModeSelector;
