"""Common Pydantic models."""

from pydantic import BaseModel, Field, field_validator
from typing import Optional


class BoundingBox(BaseModel):
    """Bounding box for spatial filtering."""
    min_lon: float = Field(..., ge=-180, le=180, description="Minimum longitude")
    min_lat: float = Field(..., ge=-90, le=90, description="Minimum latitude")
    max_lon: float = Field(..., ge=-180, le=180, description="Maximum longitude")
    max_lat: float = Field(..., ge=-90, le=90, description="Maximum latitude")

    @field_validator('max_lon')
    @classmethod
    def validate_lon_order(cls, v, info):
        """Validate that max_lon > min_lon."""
        if 'min_lon' in info.data and v <= info.data['min_lon']:
            raise ValueError('max_lon must be greater than min_lon')
        return v

    @field_validator('max_lat')
    @classmethod
    def validate_lat_order(cls, v, info):
        """Validate that max_lat > min_lat."""
        if 'min_lat' in info.data and v <= info.data['min_lat']:
            raise ValueError('max_lat must be greater than min_lat')
        return v

    @classmethod
    def from_string(cls, bbox_str: str) -> 'BoundingBox':
        """Parse bbox from string format: 'minLon,minLat,maxLon,maxLat'.

        Args:
            bbox_str: Comma-separated bbox string

        Returns:
            BoundingBox instance

        Raises:
            ValueError: If string format is invalid
        """
        try:
            parts = bbox_str.split(',')
            if len(parts) != 4:
                raise ValueError(
                    "bbox must have 4 values: minLon,minLat,maxLon,maxLat"
                )

            min_lon, min_lat, max_lon, max_lat = map(float, parts)

            return cls(
                min_lon=min_lon,
                min_lat=min_lat,
                max_lon=max_lon,
                max_lat=max_lat
            )
        except (ValueError, TypeError) as e:
            raise ValueError(f"Invalid bbox format: {bbox_str}. Error: {str(e)}")


class Point(BaseModel):
    """Geographic point."""
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")
