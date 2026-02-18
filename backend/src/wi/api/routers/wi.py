"""WI routers - Walkability Index API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, Any, Dict
from pathlib import Path

from ..dependencies import get_data_dir
from ..services.data_loader import DataLoader
from ..services.wi_service import WIService
from ..models.common import BoundingBox
from ..models.wi import WIPointResponse

router = APIRouter()


def get_data_loader(data_dir: Path = Depends(get_data_dir)) -> DataLoader:
    """Get DataLoader instance."""
    return DataLoader(data_dir)


def get_wi_service(loader: DataLoader = Depends(get_data_loader)) -> WIService:
    """Get WIService instance."""
    return WIService(loader)


@router.get("/wi/grid")
async def get_wi_grid(
    area: str = Query(..., description="Area name (e.g., 'shinagawa')"),
    profile: str = Query(..., description="Profile name (e.g., 'residential_family')"),
    bbox: Optional[str] = Query(None, description="Bounding box: minLon,minLat,maxLon,maxLat"),
    format: str = Query("geojson", description="Output format: 'geojson' or 'dict'"),
    wi_service: WIService = Depends(get_wi_service)
) -> Dict[str, Any]:
    """Get WI grid data for an area-profile combination.

    Returns GeoJSON FeatureCollection with WI scores for all grid cells
    in the specified area, optionally filtered by bounding box.

    **Example:**
    ```
    GET /api/v1/wi/grid?area=shinagawa&profile=residential_family
    GET /api/v1/wi/grid?area=shinagawa&profile=residential_family&bbox=139.7,35.6,139.8,35.7
    ```

    **Response format:**
    ```json
    {
      "type": "FeatureCollection",
      "features": [...],
      "metadata": {
        "area": "shinagawa",
        "profile": "residential_family",
        "count": 3245,
        "statistics": {
          "mean": 67.3,
          "min": 12.4,
          "max": 94.1,
          "std": 18.2,
          "median": 69.5,
          "count": 3245
        }
      }
    }
    ```
    """
    try:
        # Parse bbox if provided
        bbox_obj = None
        if bbox:
            try:
                bbox_obj = BoundingBox.from_string(bbox)
            except ValueError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid bbox format: {str(e)}"
                )

        # Get WI grid data
        result = wi_service.get_wi_grid(
            area=area,
            profile=profile,
            bbox=bbox_obj,
            format=format
        )

        return result

    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/wi/point", response_model=WIPointResponse)
async def get_wi_point(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    area: str = Query(..., description="Area name"),
    profile: str = Query(..., description="Profile name"),
    wi_service: WIService = Depends(get_wi_service)
) -> WIPointResponse:
    """Get WI score for a specific point.

    Returns WI score for the nearest grid cell to the specified coordinates.

    **Example:**
    ```
    GET /api/v1/wi/point?lat=35.6284&lon=139.7386&area=shinagawa&profile=residential_family
    ```

    **Response:**
    ```json
    {
      "lat": 35.6284,
      "lon": 139.7386,
      "grid_id": "shinagawa_00123_00456",
      "wi_score": 72.3,
      "amenity_scores": {
        "supermarket": 0.89,
        "kindergarten": 0.75,
        ...
      },
      "profile": "residential_family",
      "area": "shinagawa"
    }
    ```
    """
    try:
        result = wi_service.calculate_point_wi(
            lat=lat,
            lon=lon,
            area=area,
            profile=profile
        )

        return WIPointResponse(**result)

    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/wi/statistics")
async def get_wi_statistics(
    area: str = Query(..., description="Area name"),
    profile: str = Query(..., description="Profile name"),
    wi_service: WIService = Depends(get_wi_service)
) -> Dict[str, Any]:
    """Get statistics for WI scores.

    Returns statistical summary (mean, min, max, std, median, count) for
    the specified area-profile combination.

    **Example:**
    ```
    GET /api/v1/wi/statistics?area=shinagawa&profile=residential_family
    ```

    **Response:**
    ```json
    {
      "mean": 67.3,
      "min": 12.4,
      "max": 94.1,
      "std": 18.2,
      "median": 69.5,
      "count": 3245
    }
    ```
    """
    try:
        stats = wi_service.get_wi_statistics(area=area, profile=profile)
        return stats

    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
