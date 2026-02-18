"""Profiles router."""

from fastapi import APIRouter, Depends, HTTPException
from typing import List

from ..dependencies import get_app_config
from ...config import Config

router = APIRouter()


@router.get("/profiles")
async def list_profiles(config: Config = Depends(get_app_config)):
    """List all available profiles.

    Returns:
        List of profile objects with metadata
    """
    try:
        profile_names = config.list_profiles()

        profiles = []
        for profile_name in profile_names:
            profile_data = config.get_profile(profile_name)

            # Extract amenity types
            amenity_types = list(profile_data.get("amenities", {}).keys())

            profiles.append({
                "id": profile_name,
                "name": profile_data.get("name", profile_name),
                "description": profile_data.get("description", ""),
                "target_users": profile_data.get("target_users", []),
                "amenity_types": amenity_types,
                "amenity_count": len(amenity_types)
            })

        return {
            "profiles": profiles,
            "count": len(profiles)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list profiles: {str(e)}"
        )


@router.get("/profiles/{profile_id}")
async def get_profile(profile_id: str, config: Config = Depends(get_app_config)):
    """Get detailed information about a specific profile.

    Args:
        profile_id: Profile identifier

    Returns:
        Profile details with amenity weights and parameters
    """
    try:
        profile_data = config.get_profile(profile_id)

        # Format amenity information
        amenities = {}
        for amenity_type, params in profile_data.get("amenities", {}).items():
            amenities[amenity_type] = {
                "weight": params.get("weight"),
                "ideal_distance": params.get("ideal_distance"),
                "max_distance": params.get("max_distance"),
                "decay_type": params.get("decay_type", "exponential"),
                "description": params.get("description", "")
            }

        return {
            "id": profile_id,
            "name": profile_data.get("name", profile_id),
            "description": profile_data.get("description", ""),
            "target_users": profile_data.get("target_users", []),
            "amenities": amenities
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=f"Profile not found: {profile_id}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get profile: {str(e)}"
        )
