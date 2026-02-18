import React from 'react';
import { colorScale } from '../../utils/colors';

/**
 * Color legend component
 */
const Legend = () => {
  return (
    <div style={{
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>
        Walkability Index
      </h3>
      {colorScale.map((item) => (
        <div
          key={item.min}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '5px'
          }}
        >
          <div
            style={{
              width: '30px',
              height: '20px',
              backgroundColor: item.color,
              marginRight: '10px',
              border: '1px solid #999',
              borderRadius: '2px'
            }}
          />
          <span style={{ fontSize: '13px' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
