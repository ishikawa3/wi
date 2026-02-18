"""
Geocoding Service using Nominatim OSM API
Provides address search functionality with rate limiting
"""

import asyncio
from typing import List, Dict, Optional
from datetime import datetime
import httpx
from loguru import logger


class GeocodingService:
    """
    Geocoding service using Nominatim OpenStreetMap API
    Rate limit: 1 request per second per policy
    """

    BASE_URL = "https://nominatim.openstreetmap.org/search"
    USER_AGENT = "WalkabilityIndexApp/1.0 (https://github.com/yourorg/wi-app)"

    # Rate limiting: Track last request time
    _last_request_time: Optional[float] = None
    _min_request_interval = 1.0  # seconds

    @classmethod
    async def _rate_limit(cls):
        """Enforce rate limiting of 1 request per second"""
        if cls._last_request_time is not None:
            elapsed = asyncio.get_event_loop().time() - cls._last_request_time
            if elapsed < cls._min_request_interval:
                await asyncio.sleep(cls._min_request_interval - elapsed)

        cls._last_request_time = asyncio.get_event_loop().time()

    @classmethod
    async def search_address(
        cls,
        query: str,
        limit: int = 5,
        country_codes: str = "jp"
    ) -> List[Dict]:
        """
        Search for addresses using Nominatim API

        Args:
            query: Address search query string
            limit: Maximum number of results (default: 5)
            country_codes: ISO country codes to limit search (default: "jp" for Japan)

        Returns:
            List of search results with lat, lon, display_name, etc.

        Raises:
            httpx.HTTPError: If API request fails
        """
        # Enforce rate limiting
        await cls._rate_limit()

        params = {
            "q": query,
            "format": "json",
            "limit": limit,
            "countrycodes": country_codes,
            "addressdetails": 1,
        }

        headers = {
            "User-Agent": cls.USER_AGENT,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                logger.info(f"Geocoding search: query='{query}', limit={limit}")

                response = await client.get(
                    cls.BASE_URL,
                    params=params,
                    headers=headers
                )
                response.raise_for_status()

                results = response.json()

                logger.info(f"Geocoding returned {len(results)} results")

                # Transform results to our format
                formatted_results = [
                    {
                        "place_id": result.get("place_id"),
                        "display_name": result.get("display_name"),
                        "lat": float(result.get("lat")),
                        "lon": float(result.get("lon")),
                        "type": result.get("type"),
                        "importance": result.get("importance"),
                        "address": result.get("address", {}),
                    }
                    for result in results
                ]

                return formatted_results

        except httpx.HTTPError as e:
            logger.error(f"Geocoding API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in geocoding: {e}")
            raise
