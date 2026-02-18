"""
Amenities service for loading and filtering amenity data
"""

from typing import List, Optional, Dict, Any
from pathlib import Path
from functools import lru_cache
import geopandas as gpd
from shapely.geometry import box
from loguru import logger


class AmenitiesService:
    """Service for managing amenity data"""

    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.raw_data_dir = data_dir.parent / "raw"

    @lru_cache(maxsize=10)
    def _load_amenities_data(self, area: str) -> gpd.GeoDataFrame:
        """
        Load amenities data for an area from OSM data

        Looks for amenities_{area}.parquet or amenities_{area}.geojson
        """
        # Try Parquet first
        parquet_path = self.raw_data_dir / f"amenities_{area}.parquet"
        if parquet_path.exists():
            logger.info(f"Loading amenities from {parquet_path}")
            return gpd.read_parquet(parquet_path)

        # Try GeoJSON
        geojson_path = self.raw_data_dir / f"amenities_{area}.geojson"
        if geojson_path.exists():
            logger.info(f"Loading amenities from {geojson_path}")
            return gpd.read_file(geojson_path)

        # If neither exists, try to extract from WI data
        wi_parquet = self.data_dir / f"wi_{area}_residential_family.parquet"
        if not wi_parquet.exists():
            raise FileNotFoundError(f"Amenities data not found for area: {area}")

        # For now, return empty GeoDataFrame with proper schema
        # In production, you would extract amenities from OSM during Phase 1
        logger.warning(f"No amenities data found for {area}, returning empty result")
        return gpd.GeoDataFrame(
            {
                'amenity_type': [],
                'name': [],
                'osm_id': [],
            },
            geometry=[],
            crs="EPSG:4326"
        )

    def get_amenities(
        self,
        area: str,
        amenity_types: Optional[List[str]] = None,
        bbox: Optional[List[float]] = None
    ) -> Dict[str, Any]:
        """
        Get amenities for an area with optional filtering

        Args:
            area: Area name
            amenity_types: List of amenity types to filter (e.g., ['supermarket', 'school'])
            bbox: Bounding box [min_lon, min_lat, max_lon, max_lat]

        Returns:
            GeoJSON FeatureCollection with amenity points
        """
        # Load amenities data
        amenities = self._load_amenities_data(area)

        if amenities.empty:
            return {
                "type": "FeatureCollection",
                "features": [],
                "metadata": {
                    "area": area,
                    "count": 0,
                    "types": []
                }
            }

        # Filter by amenity types
        if amenity_types:
            amenities = amenities[amenities['amenity_type'].isin(amenity_types)].copy()

        # Filter by bounding box
        if bbox:
            min_lon, min_lat, max_lon, max_lat = bbox
            bbox_geom = box(min_lon, min_lat, max_lon, max_lat)

            # Convert bbox to amenities CRS if needed
            if amenities.crs and amenities.crs.to_epsg() != 4326:
                bbox_gdf = gpd.GeoDataFrame({'geometry': [bbox_geom]}, crs="EPSG:4326")
                bbox_gdf = bbox_gdf.to_crs(amenities.crs)
                bbox_geom = bbox_gdf.geometry.iloc[0]

            amenities = amenities[amenities.geometry.within(bbox_geom)].copy()

        # Convert to EPSG:4326 for web mapping
        if amenities.crs and amenities.crs.to_epsg() != 4326:
            amenities = amenities.to_crs("EPSG:4326")

        # Get unique types
        unique_types = amenities['amenity_type'].unique().tolist() if not amenities.empty else []

        # Convert to GeoJSON
        geojson = amenities.to_json()

        # Parse and add metadata
        import json
        result = json.loads(geojson)
        result['metadata'] = {
            'area': area,
            'count': len(amenities),
            'types': unique_types,
            'filtered_types': amenity_types,
            'bbox': bbox
        }

        return result

    def get_available_types(self, area: str) -> List[str]:
        """Get list of available amenity types for an area"""
        amenities = self._load_amenities_data(area)

        if amenities.empty or 'amenity_type' not in amenities.columns:
            return []

        return sorted(amenities['amenity_type'].unique().tolist())
