import React from 'react';

/**
 * Sidebar layout component
 */
const Sidebar = ({ children, darkMode = false }) => {
  return (
    <div style={{
      width: '320px',
      backgroundColor: darkMode ? '#1a1a2e' : '#ecf0f1',
      padding: '20px',
      overflowY: 'auto',
      borderRight: `1px solid ${darkMode ? '#2c3e50' : '#bdc3c7'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      transition: 'background-color 0.3s, border-color 0.3s',
    }}>
      {children}
    </div>
  );
};

/**
 * Sidebar section with title
 */
export const SidebarSection = ({ title, children, darkMode = false }) => {
  return (
    <div style={{
      backgroundColor: darkMode ? '#16213e' : 'white',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
      transition: 'background-color 0.3s',
    }}>
      {title && (
        <h3 style={{
          margin: '0 0 15px 0',
          fontSize: '16px',
          fontWeight: 600,
          color: darkMode ? '#ecf0f1' : '#2c3e50',
          borderBottom: '2px solid #3498db',
          paddingBottom: '8px',
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Sidebar;
