"""WI calculation service."""

from pathlib import Path
from typing import Optional, Dict, Any, Tuple
import json

import geopandas as gpd
import pandas as pd
from loguru import logger
from shapely.geometry import box

from .data_loader import DataLoader
from ..models.common import BoundingBox
from ..models.wi import WIStatistics


class WIService:
    """Service for WI calculations and data retrieval.

    Integrates DataLoader with WI calculation logic.
    Handles bbox filtering, format conversion, statistics.
    """

    def __init__(self, data_loader: DataLoader):
        """Initialize WI service.

        Args:
            data_loader: DataLoader instance for accessing precomputed data
        """
        self.data_loader = data_loader
        logger.info("WIService initialized")

    def get_wi_grid(
        self,
        area: str,
        profile: str,
        bbox: Optional[BoundingBox] = None,
        format: str = "geojson"
    ) -> Dict[str, Any]:
        """Get WI grid data for an area-profile combination.

        Args:
            area: Area name (e.g., "shinagawa")
            profile: Profile name (e.g., "residential_family")
            bbox: Optional bounding box for filtering
            format: Output format ("geojson" or "dict")

        Returns:
            GeoJSON FeatureCollection with WI scores and metadata

        Raises:
            FileNotFoundError: If data file not found
            ValueError: If bbox is invalid
        """
        logger.info(f"Fetching WI grid: area={area}, profile={profile}, bbox={bbox}")

        # Load WI data (uses cache)
        wi_data = self.data_loader.load_wi_data(area, profile, format="parquet")

        # Apply bbox filter if provided
        if bbox:
            wi_data = self._filter_by_bbox(wi_data, bbox)
            logger.info(f"After bbox filter: {len(wi_data)} cells")

        # Check if empty after filtering
        if len(wi_data) == 0:
            logger.warning(f"No data found for bbox: {bbox}")

        # Calculate statistics
        stats = self._calculate_statistics(wi_data)

        # Convert to GeoJSON
        if format == "geojson":
            # Convert to EPSG:4326 (WGS84) for web mapping
            if wi_data.crs and wi_data.crs.to_epsg() != 4326:
                wi_data = wi_data.to_crs(epsg=4326)

            geojson_dict = json.loads(wi_data.to_json())

            # Add metadata
            geojson_dict["metadata"] = {
                "area": area,
                "profile": profile,
                "count": len(wi_data),
                "statistics": stats,
                "bbox": f"{bbox.min_lon},{bbox.min_lat},{bbox.max_lon},{bbox.max_lat}" if bbox else None
            }

            return geojson_dict
        else:
            # Return as dict
            return {
                "data": wi_data.to_dict(orient="records"),
                "metadata": {
                    "area": area,
                    "profile": profile,
                    "count": len(wi_data),
                    "statistics": stats
                }
            }

    def get_wi_statistics(
        self,
        area: str,
        profile: str
    ) -> Dict[str, Any]:
        """Get statistics for WI scores.

        Args:
            area: Area name
            profile: Profile name

        Returns:
            Statistics dictionary
        """
        return self.data_loader.get_wi_statistics(area, profile)

    def _filter_by_bbox(
        self,
        gdf: gpd.GeoDataFrame,
        bbox: BoundingBox
    ) -> gpd.GeoDataFrame:
        """Filter GeoDataFrame by bounding box.

        Args:
            gdf: GeoDataFrame to filter
            bbox: Bounding box

        Returns:
            Filtered GeoDataFrame
        """
        # Create bbox polygon
        bbox_geom = box(bbox.min_lon, bbox.min_lat, bbox.max_lon, bbox.max_lat)

        # Ensure CRS matches
        if gdf.crs and gdf.crs.to_epsg() != 4326:
            # Convert bbox to GeoDataFrame with same CRS
            bbox_gdf = gpd.GeoDataFrame(
                {'geometry': [bbox_geom]},
                crs="EPSG:4326"
            ).to_crs(gdf.crs)
            bbox_geom = bbox_gdf.geometry.iloc[0]

        # Filter: keep cells that intersect bbox
        filtered = gdf[gdf.geometry.intersects(bbox_geom)].copy()

        return filtered

    def _calculate_statistics(
        self,
        gdf: gpd.GeoDataFrame
    ) -> Dict[str, float]:
        """Calculate statistics for WI scores.

        Args:
            gdf: GeoDataFrame with wi_score column

        Returns:
            Statistics dictionary
        """
        if len(gdf) == 0:
            return {
                "mean": 0.0,
                "min": 0.0,
                "max": 0.0,
                "std": 0.0,
                "median": 0.0,
                "count": 0
            }

        stats = {
            "mean": float(gdf["wi_score"].mean()),
            "min": float(gdf["wi_score"].min()),
            "max": float(gdf["wi_score"].max()),
            "std": float(gdf["wi_score"].std()),
            "median": float(gdf["wi_score"].median()),
            "count": len(gdf)
        }

        return stats

    def calculate_point_wi(
        self,
        lat: float,
        lon: float,
        area: str,
        profile: str
    ) -> Dict[str, Any]:
        """Calculate WI for a specific point (nearest grid cell).

        Args:
            lat: Latitude
            lon: Longitude
            area: Area name
            profile: Profile name

        Returns:
            WI result dictionary

        Raises:
            FileNotFoundError: If data files not found
        """
        from shapely.geometry import Point

        logger.info(f"Calculating point WI: lat={lat}, lon={lon}, area={area}, profile={profile}")

        # Load WI data
        wi_data = self.data_loader.load_wi_data(area, profile)

        # Create point
        point = Point(lon, lat)

        # Ensure CRS matches (convert point to data CRS if needed)
        if wi_data.crs and wi_data.crs.to_epsg() != 4326:
            point_gdf = gpd.GeoDataFrame(
                {'geometry': [point]},
                crs="EPSG:4326"
            ).to_crs(wi_data.crs)
            point = point_gdf.geometry.iloc[0]

        # Find nearest grid cell
        wi_data['_distance'] = wi_data.geometry.distance(point)
        nearest_cell = wi_data.loc[wi_data['_distance'].idxmin()]

        # Extract amenity scores
        amenity_scores = {}
        for col in nearest_cell.index:
            if col.startswith('score_'):
                amenity_type = col.replace('score_', '')
                amenity_scores[amenity_type] = float(nearest_cell[col])

        result = {
            'lat': lat,
            'lon': lon,
            'grid_id': str(nearest_cell['grid_id']),
            'wi_score': float(nearest_cell['wi_score']),
            'amenity_scores': amenity_scores,
            'profile': profile,
            'area': area
        }

        logger.info(f"Point WI result: {result['wi_score']:.2f}")

        return result
