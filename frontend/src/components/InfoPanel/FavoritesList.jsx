import React from 'react';

/**
 * Favorites List Component
 * Shows saved favorite locations in the sidebar
 */
const FavoritesList = ({ favorites, onRemove, onFlyTo, darkMode = false }) => {
  const textPrimary = darkMode ? '#ecf0f1' : '#2c3e50';
  const textMuted = darkMode ? '#95a5a6' : '#7f8c8d';
  const bgItem = darkMode ? '#1e2a3a' : '#f8f9fa';
  const borderColor = darkMode ? '#2c3e50' : '#e0e0e0';

  if (favorites.length === 0) {
    return (
      <div style={{
        fontSize: '12px',
        color: textMuted,
        textAlign: 'center',
        padding: '10px 0',
      }}>
        お気に入りはまだありません。<br />地点詳細から★で登録できます。
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {favorites.map((fav) => (
        <div
          key={fav.id}
          style={{
            padding: '10px',
            backgroundColor: bgItem,
            border: `1px solid ${borderColor}`,
            borderRadius: '6px',
            fontSize: '11px',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '4px',
          }}>
            <div>
              <span style={{ fontSize: '14px', color: 'gold' }}>★</span>
              <span style={{ marginLeft: '6px', fontWeight: 700, color: textPrimary, fontSize: '13px' }}>
                {fav.wi_score != null ? `WI: ${fav.wi_score.toFixed(1)}` : 'WI: N/A'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => onFlyTo(fav)}
                title="地図で表示"
                style={{
                  padding: '3px 7px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                地図
              </button>
              <button
                onClick={() => onRemove(fav.id)}
                title="削除"
                style={{
                  padding: '3px 7px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                削除
              </button>
            </div>
          </div>
          {fav.address && (
            <div style={{ color: textMuted, marginBottom: '2px', fontSize: '10px' }}>
              {fav.address.slice(0, 60)}{fav.address.length > 60 ? '...' : ''}
            </div>
          )}
          <div style={{ color: textMuted, fontSize: '10px' }}>
            {new Date(fav.saved_at).toLocaleString('ja-JP', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          {fav.note && (
            <div style={{ color: textMuted, fontStyle: 'italic', marginTop: '4px', fontSize: '10px' }}>
              {fav.note}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FavoritesList;
