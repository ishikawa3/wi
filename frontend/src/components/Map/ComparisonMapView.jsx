import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getWIColorWithOpacity } from '../../utils/colors';

/**
 * Map click handler
 */
const MapClickHandler = ({ onClick }) => {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick(e.latlng);
      }
    },
  });
  return null;
};

/**
 * Comparison view with two side-by-side maps
 */
const ComparisonMapView = ({ wiData1, wiData2, profile1Name, profile2Name, onMapClick }) => {
  const defaultCenter = [35.681, 139.767];
  const defaultZoom = 13;

  /**
   * Style function for GeoJSON features
   */
  const styleFeature = (feature) => {
    const wiScore = feature.properties.wi_score || 0;
    return {
      fillColor: getWIColorWithOpacity(wiScore, 0.6),
      weight: 1,
      opacity: 0.8,
      color: '#666',
      fillOpacity: 0.6,
    };
  };

  /**
   * Handle feature interactions
   */
  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(styleFeature(feature));
      },
    });

    // Bind popup
    const props = feature.properties;
    const wiScore = props.wi_score?.toFixed(1) || 'N/A';
    const popupContent = `
      <div style="padding: 10px; min-width: 150px;">
        <h3 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 16px;">WI Score: ${wiScore}</h3>
        <p style="margin: 5px 0; font-size: 11px; color: #666;"><strong>Grid ID:</strong> ${props.grid_id}</p>
      </div>
    `;
    layer.bindPopup(popupContent);
  };

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      gap: '4px'
    }}>
      {/* Map 1 */}
      <div style={{
        flex: 1,
        position: 'relative',
        border: '2px solid #3498db',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {/* Map 1 Label */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(52, 152, 219, 0.95)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          pointerEvents: 'none'
        }}>
          {profile1Name || 'プロファイル 1'}
        </div>

        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          <MapClickHandler onClick={onMapClick} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {wiData1 && wiData1.features && (
            <GeoJSON
              key={JSON.stringify(wiData1.metadata || {})}
              data={wiData1}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </div>

      {/* Map 2 */}
      <div style={{
        flex: 1,
        position: 'relative',
        border: '2px solid #e74c3c',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {/* Map 2 Label */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(231, 76, 60, 0.95)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          pointerEvents: 'none'
        }}>
          {profile2Name || 'プロファイル 2'}
        </div>

        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          <MapClickHandler onClick={onMapClick} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {wiData2 && wiData2.features && (
            <GeoJSON
              key={JSON.stringify(wiData2.metadata || {})}
              data={wiData2}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default ComparisonMapView;
