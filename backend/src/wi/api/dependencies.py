"""Dependency injection for FastAPI."""

from functools import lru_cache
from pathlib import Path

from ..config import get_config, Config


@lru_cache()
def get_app_config() -> Config:
    """Get application configuration (singleton).

    Returns:
        Config instance
    """
    return get_config()


def get_data_dir() -> Path:
    """Get data directory path.

    Returns:
        Path to data/processed directory
    """
    # Default to data/processed relative to project root
    project_root = Path(__file__).parent.parent.parent.parent.parent
    data_dir = project_root / "data" / "processed"
    return data_dir
