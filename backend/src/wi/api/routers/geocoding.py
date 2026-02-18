"""
Geocoding API Router
Provides address search endpoints using Nominatim OSM API
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict
from loguru import logger

from ..services.geocoding_service import GeocodingService


router = APIRouter()


@router.get("/geocoding/search", response_model=List[Dict])
async def search_address(
    q: str = Query(..., description="Address search query", min_length=1),
    limit: int = Query(5, description="Maximum number of results", ge=1, le=10)
):
    """
    Search for addresses using Nominatim OSM API

    - **q**: Address search query (e.g., "東京都品川区", "Shibuya Station")
    - **limit**: Maximum number of results (1-10, default: 5)

    Returns list of search results with coordinates, display name, and address details.

    Rate limit: 1 request per second (enforced by service)
    """
    try:
        logger.info(f"Geocoding API request: q='{q}', limit={limit}")

        results = await GeocodingService.search_address(
            query=q,
            limit=limit,
            country_codes="jp"  # Limit to Japan for this application
        )

        return results

    except Exception as e:
        logger.error(f"Geocoding API error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Geocoding search failed: {str(e)}"
        )
