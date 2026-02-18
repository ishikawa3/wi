"""Configuration management for Walkability Index."""

import yaml
from pathlib import Path
from typing import Dict, Any
from loguru import logger


class Config:
    """Configuration loader and manager."""

    def __init__(self, config_dir: Path = None):
        """
        Initialize configuration.

        Args:
            config_dir: Path to config directory. Defaults to project root/config
        """
        if config_dir is None:
            # Default: project root/config
            self.config_dir = Path(__file__).parent.parent.parent.parent / "config"
        else:
            self.config_dir = Path(config_dir)

        logger.info(f"Config directory: {self.config_dir}")

        # Load configurations
        self.profiles = self._load_yaml("profiles.yaml")
        self.amenities_osm = self._load_yaml("amenities_osm.yaml")

    def _load_yaml(self, filename: str) -> Dict[str, Any]:
        """Load YAML configuration file."""
        filepath = self.config_dir / filename

        if not filepath.exists():
            logger.warning(f"Config file not found: {filepath}")
            return {}

        with open(filepath, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)

        logger.info(f"Loaded config: {filename}")
        return config

    def get_profile(self, profile_name: str) -> Dict[str, Any]:
        """
        Get profile configuration.

        Args:
            profile_name: Profile name (e.g., 'residential_family')

        Returns:
            Profile configuration dict
        """
        profiles = self.profiles.get('profiles', {})

        if profile_name not in profiles:
            available = list(profiles.keys())
            raise ValueError(
                f"Profile '{profile_name}' not found. "
                f"Available: {available}"
            )

        return profiles[profile_name]

    def list_profiles(self) -> list[str]:
        """Get list of available profile names."""
        return list(self.profiles.get('profiles', {}).keys())

    def get_amenity_osm_tags(self, amenity_type: str) -> list[Dict[str, str]]:
        """
        Get OSM tags for amenity type.

        Args:
            amenity_type: Amenity type (e.g., 'supermarket')

        Returns:
            List of OSM tag dicts [{'key': ..., 'value': ...}, ...]
        """
        amenity_config = self.amenities_osm.get(amenity_type, {})
        return amenity_config.get('osm_tags', [])

    def get_grid_config(self) -> Dict[str, Any]:
        """Get grid configuration."""
        return self.profiles.get('grid', {
            'cell_size': 50,
            'crs': 'EPSG:6677'
        })

    def get_walking_speed(self, user_type: str = 'general') -> float:
        """
        Get walking speed in m/min.

        Args:
            user_type: 'general' or 'elderly'

        Returns:
            Walking speed in meters per minute
        """
        speeds = self.profiles.get('walking_speed', {})
        return speeds.get(user_type, 80)  # Default: 80 m/min


# Global config instance
_config = None

def get_config() -> Config:
    """Get global configuration instance."""
    global _config
    if _config is None:
        _config = Config()
    return _config
