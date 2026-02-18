import React from 'react';

/**
 * Application header component — Liquid Glass style
 */
const Header = ({ darkMode = false, onToggleDarkMode }) => {
  return (
    <header style={{
      backgroundColor: 'var(--glass-bg-strong)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderBottom: '1px solid var(--glass-border)',
      color: 'var(--text-primary)',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      transition: 'background-color 0.3s',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1 style={{
          margin: 0,
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.3px',
        }}>
          Walkability Index
        </h1>
        <span style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          fontWeight: 400,
        }}>
          Web Visualization
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDarkMode}
          title={darkMode ? 'ライトモードに切替' : 'ダークモードに切替'}
          style={{
            padding: '6px 14px',
            backgroundColor: darkMode
              ? 'rgba(255,255,255,0.12)'
              : 'rgba(0,0,0,0.06)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = darkMode
              ? 'rgba(255,255,255,0.20)'
              : 'rgba(0,0,0,0.10)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = darkMode
              ? 'rgba(255,255,255,0.12)'
              : 'rgba(0,0,0,0.06)';
          }}
        >
          {darkMode ? '☀ ライト' : '☾ ダーク'}
        </button>
        <div style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          fontWeight: 400,
        }}>
          v1.0.0
        </div>
      </div>
    </header>
  );
};

export default Header;
