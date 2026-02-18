import React, { useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import { getDiffColorWithOpacity } from '../../utils/diffColors';

/**
 * Component to handle map click events
 */
const MapClickHandler = ({ onClick }) => {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

/**
 * Difference Map View Component
 * Displays WI score differences between two profiles on a single map
 * Blue: Profile 2 higher, Red: Profile 1 higher, Gray: No difference
 */
const DifferenceMapView = ({
  wiData1,
  wiData2,
  profile1Name,
  profile2Name,
  onMapClick
}) => {
  // Compute difference GeoJSON
  const differenceGeoJSON = useMemo(() => {
    if (!wiData1?.features || !wiData2?.features) return null;

    // Create a map of grid_id -> wi_score for wiData2 for efficient lookup
    const data2Map = new Map(
      wiData2.features.map(f => [
        f.properties.grid_id,
        f.properties.wi_score || 0
      ])
    );

    // Calculate difference for each grid cell in wiData1
    const differenceFeatures = wiData1.features.map(feature => {
      const gridId = feature.properties.grid_id;
      const score1 = feature.properties.wi_score || 0;
      const score2 = data2Map.get(gridId) || 0;
      const diff = score1 - score2;  // Positive: P1 higher, Negative: P2 higher

      return {
        ...feature,
        properties: {
          ...feature.properties,
          diff_value: diff,
          score1: score1,
          score2: score2,
        }
      };
    });

    return {
      type: 'FeatureCollection',
      features: differenceFeatures,
      metadata: {
        ...wiData1.metadata,
        type: 'difference',
        profile1: profile1Name,
        profile2: profile2Name,
      }
    };
  }, [wiData1, wiData2, profile1Name, profile2Name]);

  // Style function for GeoJSON features
  const styleFeature = (feature) => {
    const diffValue = feature.properties.diff_value || 0;
    return {
      fillColor: getDiffColorWithOpacity(diffValue, 0.6),
      weight: 1,
      opacity: 0.8,
      color: '#666',
      fillOpacity: 0.6,
    };
  };

  // Event handlers for each feature
  const onEachFeature = (feature, layer) => {
    const { diff_value, score1, score2, grid_id } = feature.properties;

    // Hover effect
    layer.on({
      mouseover: () => {
        layer.setStyle({
          weight: 3,
          color: '#333',
        });
      },
      mouseout: () => {
        layer.setStyle({
          weight: 1,
          color: '#666',
        });
      },
    });

    // Popup content
    const diffSign = diff_value >= 0 ? '+' : '';
    const diffColor = diff_value >= 0 ? '#e74c3c' : '#3498db';

    const popupContent = `
      <div style="font-size: 12px; min-width: 180px;">
        <div style="font-weight: 600; margin-bottom: 8px; color: #2c3e50;">
          Grid: ${grid_id}
        </div>
        <div style="
          font-size: 18px;
          font-weight: 700;
          color: ${diffColor};
          margin-bottom: 8px;
          padding: 8px;
          background-color: ${diffColor}15;
          border-radius: 4px;
          text-align: center;
        ">
          差分: ${diffSign}${diff_value.toFixed(1)}
        </div>
        <div style="
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 6px 12px;
          font-size: 11px;
        ">
          <div style="color: #7f8c8d;">Profile 1:</div>
          <div style="font-weight: 600; color: #3498db;">${score1.toFixed(1)}</div>
          <div style="color: #7f8c8d;">Profile 2:</div>
          <div style="font-weight: 600; color: #e74c3c;">${score2.toFixed(1)}</div>
        </div>
        <div style="
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #ecf0f1;
          font-size: 10px;
          color: #95a5a6;
        ">
          <div>${profile1Name || 'Profile 1'}</div>
          <div>${profile2Name || 'Profile 2'}</div>
        </div>
      </div>
    `;

    layer.bindPopup(popupContent);
  };

  // Loading state
  if (!differenceGeoJSON) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
      }}>
        <div>
          <div style={{
            fontSize: '14px',
            color: '#7f8c8d',
            marginBottom: '8px',
          }}>
            差分データを計算中...
          </div>
          <div style={{
            fontSize: '12px',
            color: '#95a5a6',
          }}>
            2つのプロファイルのデータを読み込んでいます
          </div>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[35.681, 139.767]}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <GeoJSON
        key={JSON.stringify(differenceGeoJSON.metadata)}
        data={differenceGeoJSON}
        style={styleFeature}
        onEachFeature={onEachFeature}
      />

      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
    </MapContainer>
  );
};

export default DifferenceMapView;
