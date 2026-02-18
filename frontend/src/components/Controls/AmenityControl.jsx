import React from 'react';

// Amenity type display names
const AMENITY_LABELS = {
  supermarket: 'スーパーマーケット',
  kindergarten: '保育園・幼稚園',
  school: '学校',
  park: '公園',
  hospital: '病院・クリニック',
};

// Amenity type to emoji mapping
const AMENITY_ICONS = {
  supermarket: '🛒',
  kindergarten: '👶',
  school: '🏫',
  park: '🌳',
  hospital: '🏥',
};

/**
 * Control component for toggling amenity visibility
 */
const AmenityControl = ({ availableTypes, selectedTypes, onToggle }) => {
  if (!availableTypes || availableTypes.length === 0) {
    return (
      <div style={{
        padding: '10px',
        fontSize: '12px',
        color: '#95a5a6',
        textAlign: 'center'
      }}>
        アメニティデータがありません
      </div>
    );
  }

  const handleSelectAll = () => {
    onToggle(availableTypes);
  };

  const handleDeselectAll = () => {
    onToggle([]);
  };

  return (
    <div>
      {/* Select All / Deselect All buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <button
          onClick={handleSelectAll}
          style={{
            flex: 1,
            padding: '6px',
            fontSize: '11px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
        >
          すべて選択
        </button>
        <button
          onClick={handleDeselectAll}
          style={{
            flex: 1,
            padding: '6px',
            fontSize: '11px',
            backgroundColor: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#7f8c8d'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#95a5a6'}
        >
          すべて解除
        </button>
      </div>

      {/* Amenity type checkboxes */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {availableTypes.map(type => {
          const isSelected = selectedTypes.includes(type);
          const label = AMENITY_LABELS[type] || type;
          const icon = AMENITY_ICONS[type] || '📍';

          return (
            <label
              key={type}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                backgroundColor: isSelected ? '#ecf0f1' : 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                border: '1px solid #ddd'
              }}
              onMouseOver={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseOut={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    onToggle([...selectedTypes, type]);
                  } else {
                    onToggle(selectedTypes.filter(t => t !== type));
                  }
                }}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '18px' }}>{icon}</span>
              <span style={{
                flex: 1,
                fontSize: '13px',
                color: '#2c3e50',
                fontWeight: isSelected ? 600 : 400
              }}>
                {label}
              </span>
            </label>
          );
        })}
      </div>

      {/* Selected count */}
      <div style={{
        marginTop: '12px',
        padding: '8px',
        backgroundColor: '#e8f4f8',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#2980b9',
        textAlign: 'center'
      }}>
        {selectedTypes.length} / {availableTypes.length} 種類を表示中
      </div>
    </div>
  );
};

export default AmenityControl;
