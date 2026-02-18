import React, { useState, useEffect } from 'react';

/**
 * Profile Editor Component
 * Allows users to customize amenity weights and ideal distances
 */
const ProfileEditor = ({ baseProfile, onApply, onCancel }) => {
  const [profileName, setProfileName] = useState('');
  const [weights, setWeights] = useState([]);
  const [isModified, setIsModified] = useState(false);

  // Initialize from base profile
  useEffect(() => {
    if (baseProfile && baseProfile.weights) {
      setProfileName(`${baseProfile.name} (カスタム)`);
      setWeights(baseProfile.weights.map(w => ({ ...w })));
    }
  }, [baseProfile]);

  // Handle weight change
  const handleWeightChange = (index, newWeight) => {
    const newWeights = [...weights];
    newWeights[index].weight = parseFloat(newWeight);
    setWeights(newWeights);
    setIsModified(true);
  };

  // Handle ideal distance change
  const handleDistanceChange = (index, newDistance) => {
    const newWeights = [...weights];
    newWeights[index].ideal_distance = parseFloat(newDistance);
    setWeights(newWeights);
    setIsModified(true);
  };

  // Reset to defaults
  const handleReset = () => {
    if (baseProfile && baseProfile.weights) {
      setWeights(baseProfile.weights.map(w => ({ ...w })));
      setIsModified(false);
    }
  };

  // Apply custom profile
  const handleApply = () => {
    if (onApply) {
      onApply({
        name: profileName,
        weights
      });
    }
  };

  // Amenity type labels
  const amenityLabels = {
    supermarket: 'スーパーマーケット',
    kindergarten: '保育園・幼稚園',
    school: '学校',
    park: '公園',
    hospital: '病院・クリニック',
  };

  if (!weights || weights.length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#95a5a6',
        fontSize: '13px'
      }}>
        プロファイルを読み込み中...
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      {/* Profile Name */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '5px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#555'
        }}>
          プロファイル名
        </label>
        <input
          type="text"
          value={profileName}
          onChange={(e) => {
            setProfileName(e.target.value);
            setIsModified(true);
          }}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '13px'
          }}
        />
      </div>

      {/* Weight Sliders */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {weights.map((w, index) => (
          <div
            key={w.amenity_type}
            style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}
          >
            {/* Amenity Type Header */}
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#2c3e50',
              marginBottom: '12px'
            }}>
              {amenityLabels[w.amenity_type] || w.amenity_type}
            </div>

            {/* Weight Slider */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <span style={{ fontSize: '11px', color: '#7f8c8d' }}>
                  重要度
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#3498db'
                }}>
                  {(w.weight * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={w.weight}
                onChange={(e) => handleWeightChange(index, e.target.value)}
                style={{
                  width: '100%',
                  cursor: 'pointer'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                color: '#95a5a6',
                marginTop: '4px'
              }}>
                <span>低</span>
                <span>高</span>
              </div>
            </div>

            {/* Ideal Distance Slider */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <span style={{ fontSize: '11px', color: '#7f8c8d' }}>
                  理想距離
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#e67e22'
                }}>
                  {w.ideal_distance}m
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={w.ideal_distance}
                onChange={(e) => handleDistanceChange(index, e.target.value)}
                style={{
                  width: '100%',
                  cursor: 'pointer'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                color: '#95a5a6',
                marginTop: '4px'
              }}>
                <span>100m</span>
                <span>2000m</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '10px'
      }}>
        <button
          onClick={handleReset}
          disabled={!isModified}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: isModified ? '#95a5a6' : '#ecf0f1',
            color: isModified ? 'white' : '#bdc3c7',
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isModified ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (isModified) {
              e.target.style.backgroundColor = '#7f8c8d';
            }
          }}
          onMouseOut={(e) => {
            if (isModified) {
              e.target.style.backgroundColor = '#95a5a6';
            }
          }}
        >
          リセット
        </button>

        <button
          onClick={handleApply}
          disabled={!isModified}
          style={{
            flex: 2,
            padding: '10px',
            backgroundColor: isModified ? '#27ae60' : '#ecf0f1',
            color: isModified ? 'white' : '#bdc3c7',
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isModified ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (isModified) {
              e.target.style.backgroundColor = '#229954';
            }
          }}
          onMouseOut={(e) => {
            if (isModified) {
              e.target.style.backgroundColor = '#27ae60';
            }
          }}
        >
          カスタムプロファイルを適用
        </button>
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: 'transparent',
            color: '#7f8c8d',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          キャンセル
        </button>
      )}
    </div>
  );
};

export default ProfileEditor;
