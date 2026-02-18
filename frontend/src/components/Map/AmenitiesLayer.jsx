import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Amenity type to emoji/icon mapping
const AMENITY_ICONS = {
  supermarket: '🛒',
  kindergarten: '👶',
  school: '🏫',
  park: '🌳',
  hospital: '🏥',
};

// Amenity type to color mapping
const AMENITY_COLORS = {
  supermarket: '#3498db',   // Blue
  kindergarten: '#f39c12',  // Orange
  school: '#9b59b6',        // Purple
  park: '#27ae60',          // Green
  hospital: '#e74c3c',      // Red
};

/**
 * Component to display amenity markers on the map
 */
const AmenitiesLayer = ({ amenitiesData }) => {
  if (!amenitiesData || !amenitiesData.features || amenitiesData.features.length === 0) {
    return null;
  }

  /**
   * Create custom icon for amenity type
   */
  const createAmenityIcon = (amenityType) => {
    const emoji = AMENITY_ICONS[amenityType] || '📍';
    const color = AMENITY_COLORS[amenityType] || '#95a5a6';

    return L.divIcon({
      className: 'custom-amenity-marker',
      html: `
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
          <span style="
            position: relative;
            font-size: 18px;
            z-index: 1;
          ">${emoji}</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  return (
    <>
      {amenitiesData.features.map((feature, index) => {
        const { geometry, properties } = feature;
        const [lon, lat] = geometry.coordinates;
        const { amenity_type, name, osm_id } = properties;

        const icon = createAmenityIcon(amenity_type);

        return (
          <Marker
            key={`amenity-${osm_id || index}`}
            position={[lat, lon]}
            icon={icon}
          >
            <Popup>
              <div style={{ padding: '8px', minWidth: '200px' }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  color: '#2c3e50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>
                    {AMENITY_ICONS[amenity_type] || '📍'}
                  </span>
                  {name || 'Unknown'}
                </h3>

                <div style={{ fontSize: '13px', color: '#555' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>種類:</strong> {amenity_type}
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>位置:</strong> {lat.toFixed(5)}, {lon.toFixed(5)}
                  </div>
                  {osm_id && (
                    <div style={{
                      fontSize: '11px',
                      color: '#95a5a6',
                      marginTop: '8px'
                    }}>
                      OSM ID: {osm_id}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default AmenitiesLayer;
