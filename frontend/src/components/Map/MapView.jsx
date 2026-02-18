import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getWIColorWithOpacity, getWIColor } from '../../utils/colors';
import AmenitiesLayer from './AmenitiesLayer';
import FavoritesLayer from './FavoritesLayer';
import DrawControl from './DrawControl';

/**
 * Component to handle map click events
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
 * Main map component using Leaflet
 */
const MapView = ({
  wiData,
  amenitiesData,
  onMapClick,
  darkMode = false,
  favorites = [],
  flyToTarget = null,
  onRemoveFavorite,
  customAreaBounds,
  onDrawComplete,
}) => {
  // State for clicked location marker
  const [clickedLocation, setClickedLocation] = useState(null);

  // Default center: Tokyo Station
  const defaultCenter = [35.681, 139.767];
  const defaultZoom = 13;

  // Custom marker icon for clicked location
  const clickedIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      background-color: #e74c3c;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  /**
   * Handle map click (for point query)
   */
  const handleMapClick = (latlng) => {
    console.log('Map clicked at:', latlng);
    setClickedLocation(latlng);

    if (onMapClick) {
      onMapClick(latlng.lat, latlng.lng);
    }
  };

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
   * Handle feature click
   */
  const onEachFeature = (feature, layer) => {
    layer.on({
      click: (e) => {
        if (onMapClick) {
          const { lat, lng } = e.latlng;
          onMapClick({ lat, lon: lng, feature: feature.properties });
        }
      },
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

    // Bind popup with amenity scores
    const props = feature.properties;
    const wiScore = props.wi_score?.toFixed(1) || 'N/A';

    // Extract amenity scores (properties starting with 'score_')
    const amenityScores = Object.keys(props)
      .filter(key => key.startsWith('score_'))
      .map(key => ({
        name: key.replace('score_', ''),
        score: props[key]
      }))
      .sort((a, b) => b.score - a.score);

    let popupContent = `
      <div style="padding: 10px; min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 18px;">WI Score: ${wiScore}</h3>
        <p style="margin: 5px 0; font-size: 12px; color: #666;"><strong>Grid ID:</strong> ${props.grid_id}</p>`;

    if (amenityScores.length > 0) {
      popupContent += `
        <hr style="margin: 10px 0; border: none; border-top: 1px solid #ddd;">
        <h4 style="margin: 5px 0 8px 0; font-size: 14px; color: #2c3e50;">Amenity Scores:</h4>
        <div style="font-size: 12px;">`;

      amenityScores.forEach(({ name, score }) => {
        const percentage = (score * 100).toFixed(0);
        popupContent += `
          <div style="margin: 5px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span>${name}</span>
              <span style="font-weight: 600;">${percentage}%</span>
            </div>
            <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: #3498db; height: 100%; width: ${percentage}%; transition: width 0.3s;"></div>
            </div>
          </div>`;
      });

      popupContent += `</div>`;
    }

    popupContent += `</div>`;

    layer.bindPopup(popupContent);
  };

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
    >
      {/* Map click handler */}
      <MapClickHandler onClick={handleMapClick} />

      {/* Tile layer - switches based on dark mode */}
      {darkMode ? (
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
      ) : (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      )}

      {/* WI Grid layer */}
      {wiData && wiData.features && (
        <GeoJSON
          key={`${JSON.stringify(wiData.metadata || {})}-${wiData.features.length}`}
          data={wiData}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />
      )}

      {/* Clicked location marker */}
      {clickedLocation && (
        <Marker
          position={[clickedLocation.lat, clickedLocation.lng]}
          icon={clickedIcon}
        />
      )}

      {/* Amenities layer */}
      {amenitiesData && <AmenitiesLayer amenitiesData={amenitiesData} />}

      {/* Favorites layer */}
      <FavoritesLayer
        favorites={favorites}
        onRemove={onRemoveFavorite}
        flyToTarget={flyToTarget}
      />

      {/* Draw control for custom area selection */}
      {onDrawComplete && (
        <DrawControl
          onDrawComplete={onDrawComplete}
          customAreaBounds={customAreaBounds}
        />
      )}
    </MapContainer>
  );
};

export default MapView;
