"""Data loader service for precomputed WI data."""

from pathlib import Path
from typing import Optional, Tuple
from functools import lru_cache
import re

import geopandas as gpd
import pandas as pd
from loguru import logger


class DataLoader:
    """Load and cache precomputed WI data from files.

    Responsibilities:
    - Load WI grid data from Parquet/GeoJSON
    - Load grid geometries
    - Load distance calculations
    - Cache loaded data in memory (LRU)
    - List available areas
    """

    def __init__(self, data_dir: Path):
        """Initialize data loader.

        Args:
            data_dir: Directory containing processed data files
        """
        self.data_dir = Path(data_dir)
        if not self.data_dir.exists():
            logger.warning(f"Data directory does not exist: {self.data_dir}")

        logger.info(f"DataLoader initialized with data_dir: {self.data_dir}")

    @lru_cache(maxsize=5)
    def load_wi_data(
        self,
        area: str,
        profile: str,
        format: str = "parquet"
    ) -> gpd.GeoDataFrame:
        """Load WI grid data for an area-profile combination.

        Args:
            area: Area name (e.g., "shinagawa")
            profile: Profile name (e.g., "residential_family")
            format: File format ("parquet" or "geojson")

        Returns:
            GeoDataFrame with WI scores

        Raises:
            FileNotFoundError: If data file not found
        """
        if format == "parquet":
            file_path = self.data_dir / f"wi_{area}_{profile}.parquet"
        else:  # geojson
            file_path = self.data_dir / f"wi_{area}_{profile}.geojson"

        if not file_path.exists():
            raise FileNotFoundError(
                f"WI data not found: {file_path}. "
                f"Please run Phase 2: python scripts/phase2_compute_wi.py "
                f"--area {area} --profile {profile}"
            )

        logger.info(f"Loading WI data: {file_path}")

        if format == "parquet":
            wi_data = gpd.read_parquet(file_path)
        else:
            wi_data = gpd.read_file(file_path)

        logger.info(f"Loaded {len(wi_data)} grid cells for {area}/{profile}")

        return wi_data

    @lru_cache(maxsize=5)
    def load_grid_data(
        self,
        area: str,
        profile: str
    ) -> gpd.GeoDataFrame:
        """Load grid geometries.

        Args:
            area: Area name
            profile: Profile name

        Returns:
            GeoDataFrame with grid cells

        Raises:
            FileNotFoundError: If grid file not found
        """
        file_path = self.data_dir / f"grid_{area}_{profile}.geojson"

        if not file_path.exists():
            # Try loading from WI file instead
            logger.warning(f"Grid file not found: {file_path}, using WI data")
            return self.load_wi_data(area, profile)

        logger.info(f"Loading grid data: {file_path}")
        grid_data = gpd.read_file(file_path)

        return grid_data

    @lru_cache(maxsize=5)
    def load_distances_data(
        self,
        area: str,
        profile: str
    ) -> pd.DataFrame:
        """Load distance calculations.

        Args:
            area: Area name
            profile: Profile name

        Returns:
            DataFrame with distance pairs

        Raises:
            FileNotFoundError: If distances file not found
        """
        file_path = self.data_dir / f"distances_{area}_{profile}.parquet"

        if not file_path.exists():
            raise FileNotFoundError(
                f"Distances data not found: {file_path}"
            )

        logger.info(f"Loading distances data: {file_path}")
        distances_df = pd.read_parquet(file_path)

        return distances_df

    def list_available_areas(self) -> list[str]:
        """List all available areas by scanning data directory.

        Returns:
            List of area names

        Example:
            >>> loader.list_available_areas()
            ["shinagawa", "shibuya", "meguro"]
        """
        if not self.data_dir.exists():
            return []

        # Pattern: wi_{area}_{profile}.parquet
        pattern = re.compile(r"wi_(.+?)_(.+?)\.parquet")

        areas = set()
        for file_path in self.data_dir.glob("wi_*.parquet"):
            match = pattern.match(file_path.name)
            if match:
                area = match.group(1)
                areas.add(area)

        logger.info(f"Found {len(areas)} areas: {sorted(areas)}")

        return sorted(list(areas))

    def list_available_profiles(self, area: Optional[str] = None) -> list[str]:
        """List available profiles for a given area.

        Args:
            area: Area name (if None, list all profiles)

        Returns:
            List of profile names
        """
        if not self.data_dir.exists():
            return []

        if area:
            pattern = re.compile(rf"wi_{re.escape(area)}_(.+?)\.parquet")
        else:
            pattern = re.compile(r"wi_.+?_(.+?)\.parquet")

        profiles = set()
        for file_path in self.data_dir.glob("wi_*.parquet"):
            match = pattern.match(file_path.name)
            if match:
                profile = match.group(1)
                profiles.add(profile)

        return sorted(list(profiles))

    def get_wi_statistics(
        self,
        area: str,
        profile: str
    ) -> dict:
        """Calculate statistics for WI scores.

        Args:
            area: Area name
            profile: Profile name

        Returns:
            Dictionary with mean, min, max, std, median
        """
        wi_data = self.load_wi_data(area, profile)

        stats = {
            "mean": float(wi_data["wi_score"].mean()),
            "min": float(wi_data["wi_score"].min()),
            "max": float(wi_data["wi_score"].max()),
            "std": float(wi_data["wi_score"].std()),
            "median": float(wi_data["wi_score"].median()),
            "count": len(wi_data)
        }

        return stats

    def clear_cache(self):
        """Clear all cached data."""
        self.load_wi_data.cache_clear()
        self.load_grid_data.cache_clear()
        self.load_distances_data.cache_clear()
        logger.info("Data cache cleared")
