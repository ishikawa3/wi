"""
Custom profile API router
Allows users to create custom profiles and calculate WI dynamically
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, List
from pathlib import Path
from pydantic import BaseModel, Field
from ..services.custom_wi_service import CustomWIService
from ..dependencies import get_data_dir

router = APIRouter()


class AmenityWeight(BaseModel):
    """Amenity weight configuration"""
    amenity_type: str = Field(..., description="Amenity type (e.g., 'supermarket')")
    weight: float = Field(..., ge=0, le=1, description="Weight (0-1)")
    ideal_distance: float = Field(..., gt=0, description="Ideal distance in meters")


class CustomProfile(BaseModel):
    """Custom profile definition"""
    name: str = Field(..., description="Profile name")
    weights: List[AmenityWeight] = Field(..., description="Amenity weights and distances")


@router.post("/profiles/custom/calculate")
async def calculate_custom_wi(
    area: str = Body(..., description="Area name"),
    profile: CustomProfile = Body(..., description="Custom profile definition"),
    data_dir: Path = Depends(get_data_dir),
):
    """
    Calculate WI using a custom profile

    This endpoint allows users to define custom weights and ideal distances
    for amenities, then calculates WI scores dynamically.

    **Note:** This is computationally expensive for large areas.
    Use with caution and consider caching results.
    """
    try:
        custom_service = CustomWIService(data_dir)

        # Convert weights to dict format
        weights_dict = {
            w.amenity_type: {
                'weight': w.weight,
                'ideal_distance': w.ideal_distance
            }
            for w in profile.weights
        }

        # Calculate custom WI
        result = custom_service.calculate_custom_wi(
            area=area,
            profile_name=profile.name,
            weights=weights_dict
        )

        return result

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate custom WI: {str(e)}")


@router.get("/profiles/custom/defaults")
async def get_default_weights(
    profile_id: str,
    data_dir: Path = Depends(get_data_dir),
):
    """
    Get default weights for a profile as a starting point for customization
    """
    try:
        custom_service = CustomWIService(data_dir)
        defaults = custom_service.get_profile_defaults(profile_id)
        return defaults

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get defaults: {str(e)}")
