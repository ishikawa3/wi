"""Areas router."""

from fastapi import APIRouter, Depends, HTTPException
from pathlib import Path

from ..dependencies import get_data_dir
from ..services.data_loader import DataLoader

router = APIRouter()


def get_data_loader(data_dir: Path = Depends(get_data_dir)) -> DataLoader:
    """Get DataLoader instance.

    Args:
        data_dir: Data directory path

    Returns:
        DataLoader instance
    """
    return DataLoader(data_dir)


@router.get("/areas")
async def list_areas(loader: DataLoader = Depends(get_data_loader)):
    """List all available areas with WI data.

    Scans the data directory for WI files and extracts area names.

    Returns:
        List of area names
    """
    try:
        areas = loader.list_available_areas()

        return {
            "areas": areas,
            "count": len(areas)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list areas: {str(e)}"
        )


@router.get("/areas/{area}/profiles")
async def list_area_profiles(
    area: str,
    loader: DataLoader = Depends(get_data_loader)
):
    """List available profiles for a specific area.

    Args:
        area: Area name

    Returns:
        List of profile names available for this area
    """
    try:
        profiles = loader.list_available_profiles(area=area)

        if not profiles:
            raise HTTPException(
                status_code=404,
                detail=f"No profile data found for area: {area}"
            )

        return {
            "area": area,
            "profiles": profiles,
            "count": len(profiles)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list profiles for area {area}: {str(e)}"
        )
