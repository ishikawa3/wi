import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

/**
 * DrawControl Component
 * Adds Leaflet.draw toolbar to the map for selecting custom areas.
 * Uses imperative Leaflet API via useMap() for react-leaflet v4 compatibility.
 */
const DrawControl = ({ onDrawComplete, customAreaBounds }) => {
  const map = useMap();
  const drawnItemsRef = useRef(null);
  const controlRef = useRef(null);

  useEffect(() => {
    // Initialize feature group for drawn shapes
    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    // Create draw control with rectangle and polygon only
    const drawControl = new L.Control.Draw({
      position: 'topleft',
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
      draw: {
        rectangle: {
          shapeOptions: {
            color: '#3498db',
            weight: 2,
            dashArray: '5, 5',
            fillOpacity: 0.1,
          },
        },
        polygon: {
          shapeOptions: {
            color: '#3498db',
            weight: 2,
            dashArray: '5, 5',
            fillOpacity: 0.1,
          },
          allowIntersection: false,
        },
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
    });

    controlRef.current = drawControl;
    map.addControl(drawControl);

    // Handle shape creation
    const handleCreated = (e) => {
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);
      const bounds = e.layer.getBounds();
      onDrawComplete({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLon: bounds.getWest(),
        maxLon: bounds.getEast(),
      });
    };

    // Handle shape deletion
    const handleDeleted = () => {
      if (drawnItems.getLayers().length === 0) {
        onDrawComplete(null);
      }
    };

    // Handle shape editing
    const handleEdited = (e) => {
      e.layers.eachLayer((layer) => {
        const bounds = layer.getBounds();
        onDrawComplete({
          minLat: bounds.getSouth(),
          maxLat: bounds.getNorth(),
          minLon: bounds.getWest(),
          maxLon: bounds.getEast(),
        });
      });
    };

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.DELETED, handleDeleted);
    map.on(L.Draw.Event.EDITED, handleEdited);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Clear drawn layers when customAreaBounds is reset to null from outside
  useEffect(() => {
    if (!customAreaBounds && drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
    }
  }, [customAreaBounds]);

  return null;
};

export default DrawControl;
