"""
Custom WI calculation service
Allows dynamic WI calculation with user-defined weights
"""

from typing import Dict, Any, List
from pathlib import Path
import geopandas as gpd
import json
from loguru import logger

from ...config import get_config


class CustomWIService:
    """Service for calculating WI with custom profiles"""

    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.config = get_config()

    def get_profile_defaults(self, profile_id: str) -> Dict[str, Any]:
        """
        Get default weights for a profile

        Returns:
            Dict with amenity types, weights, and ideal distances
        """
        # Load profile configuration
        profiles_dict = self.config.profiles.get('profiles', {})

        if profile_id not in profiles_dict:
            raise FileNotFoundError(f"Profile not found: {profile_id}")

        profile = profiles_dict[profile_id]

        # Extract weights
        weights = []
        for amenity_type, config in profile['amenities'].items():
            weights.append({
                'amenity_type': amenity_type,
                'weight': config['weight'],
                'ideal_distance': config['ideal_distance']
            })

        return {
            'profile_id': profile_id,
            'name': profile['name'],
            'description': profile.get('description', ''),
            'weights': weights
        }

    def calculate_custom_wi(
        self,
        area: str,
        profile_name: str,
        weights: Dict[str, Dict[str, float]]
    ) -> Dict[str, Any]:
        """
        Calculate WI with custom weights

        Args:
            area: Area name
            profile_name: Custom profile name
            weights: Dict mapping amenity_type to {weight, ideal_distance}

        Returns:
            GeoJSON with WI scores
        """
        logger.info(f"Calculating custom WI for area '{area}' with profile '{profile_name}'")

        # Load grid data
        # For simplicity, we'll load from an existing WI result and recalculate
        # In production, you'd load the grid and amenity data separately
        processed_dir = self.data_dir

        # Find any existing WI data for this area to get grid structure
        existing_files = list(processed_dir.glob(f"wi_{area}_*.parquet"))
        if not existing_files:
            raise FileNotFoundError(f"No WI data found for area: {area}")

        # Load existing grid structure
        base_gdf = gpd.read_parquet(existing_files[0])
        logger.info(f"Loaded {len(base_gdf)} grid cells for recalculation")

        # Create custom profile dict
        custom_profile = {
            'id': 'custom',
            'name': profile_name,
            'amenities': {
                amenity_type: {
                    'weight': config['weight'],
                    'ideal_distance': config['ideal_distance']
                }
                for amenity_type, config in weights.items()
            }
        }

        # Initialize calculator with custom profile
        # Note: This is a simplified version
        # In production, you'd need to recalculate accessibility scores
        # For now, we'll just recalculate WI based on existing amenity scores

        # Recalculate WI scores based on new weights
        wi_scores = []
        for _, row in base_gdf.iterrows():
            amenity_scores = {}
            total_weighted_score = 0
            total_weight = 0

            for amenity_type, config in weights.items():
                score_col = f"score_{amenity_type}"
                if score_col in base_gdf.columns:
                    amenity_score = row[score_col]
                    amenity_scores[amenity_type] = amenity_score

                    weighted_score = amenity_score * config['weight']
                    total_weighted_score += weighted_score
                    total_weight += config['weight']

            # Calculate weighted average
            if total_weight > 0:
                wi_score = (total_weighted_score / total_weight) * 100
            else:
                wi_score = 0

            wi_scores.append(wi_score)

        # Update WI scores
        result_gdf = base_gdf.copy()
        result_gdf['wi_score'] = wi_scores

        # Convert to EPSG:4326 for web
        if result_gdf.crs and result_gdf.crs.to_epsg() != 4326:
            result_gdf = result_gdf.to_crs("EPSG:4326")

        # Calculate statistics
        stats = {
            'mean': float(result_gdf['wi_score'].mean()),
            'min': float(result_gdf['wi_score'].min()),
            'max': float(result_gdf['wi_score'].max()),
            'std': float(result_gdf['wi_score'].std()),
            'median': float(result_gdf['wi_score'].median()),
            'count': len(result_gdf)
        }

        # Convert to GeoJSON
        geojson_str = result_gdf.to_json()
        geojson = json.loads(geojson_str)

        # Add metadata
        geojson['metadata'] = {
            'area': area,
            'profile_name': profile_name,
            'profile_type': 'custom',
            'weights': weights,
            'statistics': stats,
            'feature_count': len(result_gdf)
        }

        logger.info(f"Custom WI calculation completed. Mean: {stats['mean']:.2f}")

        return geojson
