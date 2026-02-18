import React, { useState, useCallback } from 'react';

/**
 * WI Score Dual Range Slider Filter Component — Liquid Glass
 */
const WIScoreFilter = ({ min, max, onChange }) => {
  const [thumbTop, setThumbTop] = useState('max');

  const handleMinChange = useCallback((e) => {
    const newMin = Math.min(Number(e.target.value), max - 1);
    setThumbTop('min');
    onChange({ min: newMin, max });
  }, [max, onChange]);

  const handleMaxChange = useCallback((e) => {
    const newMax = Math.max(Number(e.target.value), min + 1);
    setThumbTop('max');
    onChange({ min, max: newMax });
  }, [min, onChange]);

  const handleReset = () => onChange({ min: 0, max: 100 });
  const isFiltered = min !== 0 || max !== 100;
  const leftPct = min;
  const widthPct = max - min;

  const sliderStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    WebkitAppearance: 'none',
    appearance: 'none',
    background: 'transparent',
    pointerEvents: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>スコア範囲</span>
        <span style={{
          fontSize: '13px',
          fontWeight: 700,
          color: isFiltered ? 'var(--accent-warning)' : 'var(--text-primary)',
          minWidth: '80px',
          textAlign: 'right',
        }}>
          {min} — {max}
        </span>
      </div>

      <div style={{ position: 'relative', height: '28px', marginBottom: '6px' }}>
        {/* Track background */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          height: '4px', transform: 'translateY(-50%)',
          backgroundColor: 'var(--glass-border)', borderRadius: '2px', pointerEvents: 'none',
        }} />
        {/* Active track */}
        <div style={{
          position: 'absolute', top: '50%', left: `${leftPct}%`, width: `${widthPct}%`,
          height: '4px', transform: 'translateY(-50%)',
          backgroundColor: 'var(--accent)', borderRadius: '2px', pointerEvents: 'none',
        }} />
        <input type="range" min={0} max={100} step={1} value={min}
          onChange={handleMinChange}
          onMouseDown={() => setThumbTop('min')} onTouchStart={() => setThumbTop('min')}
          style={{ ...sliderStyle, zIndex: thumbTop === 'min' ? 5 : 4 }}
        />
        <input type="range" min={0} max={100} step={1} value={max}
          onChange={handleMaxChange}
          onMouseDown={() => setThumbTop('max')} onTouchStart={() => setThumbTop('max')}
          style={{ ...sliderStyle, zIndex: thumbTop === 'max' ? 5 : 4 }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px' }}>
        <span>0</span>
        <span>100</span>
      </div>

      {isFiltered && (
        <button
          onClick={handleReset}
          style={{
            width: '100%',
            padding: '7px',
            backgroundColor: 'transparent',
            color: 'var(--accent-warning)',
            border: '1px solid var(--accent-warning)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}
        >
          フィルターをリセット
        </button>
      )}

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--accent, #007AFF);
          border: 2.5px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.20);
          cursor: pointer;
          pointer-events: all;
          transition: transform 0.15s;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        input[type='range']::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--accent, #007AFF);
          border: 2.5px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.20);
          cursor: pointer;
          pointer-events: all;
        }
      `}</style>
    </div>
  );
};

export default WIScoreFilter;
