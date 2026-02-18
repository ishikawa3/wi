import React from 'react';

/**
 * Application header component
 */
const Header = ({ darkMode = false, onToggleDarkMode }) => {
  return (
    <header style={{
      backgroundColor: darkMode ? '#0f3460' : '#2c3e50',
      color: 'white',
      padding: '15px 20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      transition: 'background-color 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: 600
        }}>
          Walkability Index
        </h1>
        <span style={{
          marginLeft: '15px',
          fontSize: '14px',
          opacity: 0.8
        }}>
          Web Visualization
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDarkMode}
          title={darkMode ? 'ライトモードに切替' : 'ダークモードに切替'}
          style={{
            padding: '6px 14px',
            backgroundColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = darkMode
              ? 'rgba(255,255,255,0.15)'
              : 'rgba(255,255,255,0.1)';
          }}
        >
          {darkMode ? '☀ ライト' : '☾ ダーク'}
        </button>
        <div style={{
          fontSize: '14px',
          opacity: 0.8
        }}>
          v1.0.0
        </div>
      </div>
    </header>
  );
};

export default Header;
