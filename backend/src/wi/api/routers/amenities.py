"""
Amenities API router
Provides endpoints for querying amenity locations
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from pathlib import Path
import geopandas as gpd
from ..services.amenities_service import AmenitiesService
from ..dependencies import get_data_dir

router = APIRouter()


@router.get("/amenities")
async def get_amenities(
    area: str = Query(..., description="Area name"),
    amenity_types: Optional[str] = Query(None, description="Comma-separated list of amenity types (e.g., 'supermarket,school')"),
    bbox: Optional[str] = Query(None, description="Bounding box: min_lon,min_lat,max_lon,max_lat"),
    data_dir: Path = Depends(get_data_dir),
):
    """
    Get amenity locations for a given area

    Returns GeoJSON with amenity points containing:
    - amenity type
    - name (if available)
    - osm_id
    - coordinates
    """
    try:
        amenities_service = AmenitiesService(data_dir)

        # Parse amenity types
        types_list = None
        if amenity_types:
            types_list = [t.strip() for t in amenity_types.split(',') if t.strip()]

        # Parse bbox
        bbox_values = None
        if bbox:
            try:
                bbox_values = [float(x) for x in bbox.split(',')]
                if len(bbox_values) != 4:
                    raise ValueError("Bbox must have 4 values")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid bbox format: {str(e)}")

        # Get amenities
        result = amenities_service.get_amenities(
            area=area,
            amenity_types=types_list,
            bbox=bbox_values
        )

        return result

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load amenities: {str(e)}")


@router.get("/amenities/types")
async def get_amenity_types(
    area: str = Query(..., description="Area name"),
    data_dir: Path = Depends(get_data_dir),
):
    """
    Get list of available amenity types for an area
    """
    try:
        amenities_service = AmenitiesService(data_dir)
        types = amenities_service.get_available_types(area)
        return {
            "area": area,
            "types": types,
            "count": len(types)
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get amenity types: {str(e)}")
