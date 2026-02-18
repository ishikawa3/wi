import React from 'react';

/**
 * Area selector component
 * Note: label is rendered by parent (App.jsx) to support context-specific text
 */
const AreaSelector = ({ areas, selected, onChange }) => {
  return (
    <select
      id="area-select"
      value={selected || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '8px',
        fontSize: '14px',
        borderRadius: '4px',
        border: '1px solid #ccc'
      }}
    >
      <option value="">エリアを選択</option>
      {areas.map((area) => (
        <option key={area} value={area}>
          {area}
        </option>
      ))}
    </select>
  );
};

export default AreaSelector;
