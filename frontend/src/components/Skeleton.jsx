import React from 'react';

/**
 * Skeleton loader for sidebar sections
 */
export const SkeletonSidebarSection = () => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      {/* Title skeleton */}
      <div style={{
        height: '16px',
        width: '60%',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        marginBottom: '15px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />

      {/* Content skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          height: '40px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          marginBottom: '10px',
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 0.1}s`
        }} />
      ))}
    </div>
  );
};

/**
 * Skeleton loader for map area
 */
export const SkeletonMapView = () => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#ecf0f1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Loading spinner */}
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid #e0e0e0',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />

      {/* Loading text */}
      <div style={{
        position: 'absolute',
        bottom: '40%',
        fontSize: '16px',
        color: '#7f8c8d',
        fontWeight: 500
      }}>
        地図を読み込んでいます...
      </div>
    </div>
  );
};

/**
 * CSS animations - Add to global styles
 */
const skeletonStyles = `
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = skeletonStyles;
  document.head.appendChild(style);
}
