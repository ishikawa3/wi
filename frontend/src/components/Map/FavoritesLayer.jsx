import React from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

/**
 * Star icon for favorite markers
 */
const starIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:22px;line-height:1;color:gold;text-shadow:0 0 3px rgba(0,0,0,0.5);">★</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

/**
 * Helper component: fly to a given location
 */
const FlyToLocation = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lon], 16, { duration: 1.2 });
    }
  }, [location, map]);
  return null;
};

/**
 * Favorites Layer Component
 * Renders star markers for all saved favorites on the map
 */
const FavoritesLayer = ({ favorites, onRemove, flyToTarget }) => {
  return (
    <>
      {flyToTarget && <FlyToLocation location={flyToTarget} />}
      {favorites.map((fav) => (
        <Marker
          key={fav.id}
          position={[fav.lat, fav.lon]}
          icon={starIcon}
        >
          <Popup>
            <div style={{ padding: '6px', minWidth: '160px' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '14px' }}>
                WI Score: {fav.wi_score != null ? fav.wi_score.toFixed(1) : 'N/A'}
              </div>
              {fav.address && (
                <div style={{ fontSize: '11px', color: '#555', marginBottom: '4px' }}>
                  {fav.address}
                </div>
              )}
              {fav.note && (
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', fontStyle: 'italic' }}>
                  {fav.note}
                </div>
              )}
              <button
                onClick={() => onRemove(fav.id)}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                削除
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default FavoritesLayer;
