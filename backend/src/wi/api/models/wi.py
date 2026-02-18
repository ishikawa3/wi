"""Pydantic models for WI API."""

from pydantic import BaseModel, Field
from typing import Dict, Optional, Any


class WIStatistics(BaseModel):
    """Statistics for WI scores."""
    mean: float = Field(..., description="Mean WI score")
    min: float = Field(..., description="Minimum WI score")
    max: float = Field(..., description="Maximum WI score")
    std: float = Field(..., description="Standard deviation")
    median: float = Field(..., description="Median WI score")
    count: int = Field(..., description="Number of grid cells")


class WIGridMetadata(BaseModel):
    """Metadata for WI grid response."""
    area: str = Field(..., description="Area name")
    profile: str = Field(..., description="Profile name")
    count: int = Field(..., description="Number of features returned")
    statistics: WIStatistics = Field(..., description="Statistical summary")
    bbox: Optional[str] = Field(None, description="Bounding box filter applied")


class WIPointRequest(BaseModel):
    """Request model for point WI query."""
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")
    area: str = Field(..., description="Area name")
    profile: str = Field(..., description="Profile name")


class WIPointResponse(BaseModel):
    """Response model for point WI query."""
    lat: float = Field(..., description="Query latitude")
    lon: float = Field(..., description="Query longitude")
    grid_id: str = Field(..., description="Grid cell ID")
    wi_score: float = Field(..., description="Walkability Index score (0-100)")
    amenity_scores: Dict[str, float] = Field(..., description="Scores by amenity type")
    profile: str = Field(..., description="Profile used")
    area: str = Field(..., description="Area name")


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str = Field(..., description="Error type")
    detail: str = Field(..., description="Error details")
    code: str = Field(..., description="Error code")
