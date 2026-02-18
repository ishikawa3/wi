import React from 'react';

/**
 * Sidebar layout component — Liquid Glass style
 */
const Sidebar = ({ children, darkMode = false }) => {
  return (
    <div
      className="sidebar"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '320px',
        zIndex: 100,
        background: 'linear-gradient(180deg, var(--glass-bg-strong) 0%, var(--glass-bg) 100%)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        padding: '16px',
        overflowY: 'auto',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'background-color 0.3s',
      }}
    >
      {children}
    </div>
  );
};

/**
 * Sidebar section with title — Liquid Glass card
 */
export const SidebarSection = ({ title, children, darkMode = false }) => {
  return (
    <div
      className="sidebar-section"
      style={{
        backgroundColor: 'var(--glass-bg-card)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        boxShadow: 'var(--shadow-glass)',
        border: '1px solid var(--glass-border)',
        transition: 'background-color 0.3s',
      }}
    >
      {title && (
        <h3 style={{
          margin: '0 0 14px 0',
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          borderBottom: '1.5px solid var(--accent)',
          paddingBottom: '8px',
          letterSpacing: '-0.1px',
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Sidebar;
