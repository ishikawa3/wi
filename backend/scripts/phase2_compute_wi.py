#!/usr/bin/env python
"""
Phase 2: Walkability Index計算スクリプト

Phase 1で取得したデータを使用してWIスコアを計算します。

使用例:
    python phase2_compute_wi.py --area shinagawa --profile residential_family
"""

import click
from pathlib import Path
import sys
import networkx as nx

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.wi.grid import GridGenerator
from src.wi.network import WalkingNetworkBuilder, WalkingDistanceCalculator
from src.wi.scoring import WalkabilityCalculator
from src.wi.config import get_config
from loguru import logger
import geopandas as gpd


@click.command()
@click.option(
    '--area',
    required=True,
    help='Area name (used for finding data files)'
)
@click.option(
    '--profile',
    default='residential_general',
    help='Profile name (default: residential_general)'
)
@click.option(
    '--data-dir',
    type=click.Path(),
    default=None,
    help='Data directory (default: data/processed)'
)
@click.option(
    '--output-dir',
    type=click.Path(),
    default=None,
    help='Output directory (default: data/processed)'
)
@click.option(
    '--max-distance',
    type=int,
    default=1000,
    help='Maximum walking distance in meters (default: 1000)'
)
def main(area: str, profile: str, data_dir: str, output_dir: str, max_distance: int):
    """Phase 2: Walkability Index計算."""

    logger.info("=" * 60)
    logger.info("Phase 2: Walkability Index Calculation")
    logger.info("=" * 60)
    logger.info(f"Area: {area}")
    logger.info(f"Profile: {profile}")
    logger.info(f"Max distance: {max_distance}m")

    # Directories
    if data_dir is None:
        data_dir = Path(__file__).parent.parent.parent / "data" / "processed"
    else:
        data_dir = Path(data_dir)

    if output_dir is None:
        output_dir = data_dir
    else:
        output_dir = Path(output_dir)

    output_dir.mkdir(parents=True, exist_ok=True)

    # Config
    config = get_config()

    # Validate profile
    try:
        profile_config = config.get_profile(profile)
    except ValueError as e:
        logger.error(str(e))
        available = config.list_profiles()
        logger.info(f"Available profiles: {available}")
        sys.exit(1)

    # === Step 1: Load data ===
    logger.info("\n" + "=" * 60)
    logger.info("Step 1: Loading data...")
    logger.info("=" * 60)

    # Load amenities
    amenities_file = data_dir / f"amenities_{profile}.geojson"

    if not amenities_file.exists():
        logger.error(f"Amenities file not found: {amenities_file}")
        logger.info("Please run Phase 1 first:")
        logger.info(f"  python scripts/phase1_download_data.py --area '{area}' --profile {profile}")
        sys.exit(1)

    amenities = gpd.read_file(amenities_file)
    logger.info(f"Loaded amenities: {len(amenities)}")

    # Load network
    network_file = data_dir / "walking_network.graphml"

    if not network_file.exists():
        logger.error(f"Network file not found: {network_file}")
        logger.info("Please run Phase 1 without --skip-network")
        sys.exit(1)

    builder = WalkingNetworkBuilder()
    network = builder.load(network_file)
    logger.info(f"Loaded network: {len(network.nodes())} nodes")

    # === Step 2: Generate grid ===
    logger.info("\n" + "=" * 60)
    logger.info("Step 2: Generating 50m grid...")
    logger.info("=" * 60)

    grid_generator = GridGenerator(cell_size=50)

    # エリア境界を取得（アメニティから推定）
    boundary = amenities.total_bounds  # minx, miny, maxx, maxy
    from shapely.geometry import box
    boundary_geom = gpd.GeoDataFrame(
        {'geometry': [box(*boundary)]},
        crs=amenities.crs
    )

    grid = grid_generator.generate(boundary_geom, area)

    logger.info(f"Generated grid: {len(grid)} cells")

    # グリッドを保存
    grid_file = output_dir / f"grid_{area}_{profile}.geojson"
    grid.to_file(grid_file, driver='GeoJSON')
    logger.info(f"Saved grid: {grid_file}")

    # === Step 3: Calculate distances ===
    logger.info("\n" + "=" * 60)
    logger.info("Step 3: Calculating walking distances...")
    logger.info("=" * 60)

    distance_calculator = WalkingDistanceCalculator(network)

    distances_df = distance_calculator.calculate_distances_batch(
        grid,
        amenities,
        max_distance=max_distance
    )

    logger.info(f"Calculated {len(distances_df)} distance pairs")

    # 距離データを保存
    distances_file = output_dir / f"distances_{area}_{profile}.parquet"
    distances_df.to_parquet(distances_file)
    logger.info(f"Saved distances: {distances_file}")

    # === Step 4: Calculate WI ===
    logger.info("\n" + "=" * 60)
    logger.info("Step 4: Calculating Walkability Index...")
    logger.info("=" * 60)

    wi_calculator = WalkabilityCalculator(profile)

    grid_with_wi = wi_calculator.calculate_wi_for_grid(grid, distances_df)

    # === Step 5: Save results ===
    logger.info("\n" + "=" * 60)
    logger.info("Step 5: Saving results...")
    logger.info("=" * 60)

    # GeoJSON
    wi_geojson = output_dir / f"wi_{area}_{profile}.geojson"
    grid_with_wi.to_file(wi_geojson, driver='GeoJSON')
    logger.info(f"Saved WI (GeoJSON): {wi_geojson}")

    # Parquet (より効率的)
    wi_parquet = output_dir / f"wi_{area}_{profile}.parquet"
    grid_with_wi.to_parquet(wi_parquet)
    logger.info(f"Saved WI (Parquet): {wi_parquet}")

    # 統計情報
    stats = {
        'area': area,
        'profile': profile,
        'total_cells': len(grid_with_wi),
        'mean_wi': float(grid_with_wi['wi_score'].mean()),
        'std_wi': float(grid_with_wi['wi_score'].std()),
        'min_wi': float(grid_with_wi['wi_score'].min()),
        'max_wi': float(grid_with_wi['wi_score'].max()),
        'median_wi': float(grid_with_wi['wi_score'].median()),
    }

    logger.info("\n" + "=" * 60)
    logger.info("Statistics")
    logger.info("=" * 60)
    for key, value in stats.items():
        if isinstance(value, float):
            logger.info(f"  {key}: {value:.2f}")
        else:
            logger.info(f"  {key}: {value}")

    # === Summary ===
    logger.info("\n" + "=" * 60)
    logger.info("Phase 2 Complete!")
    logger.info("=" * 60)
    logger.info(f"Output files:")
    logger.info(f"  - Grid: {grid_file}")
    logger.info(f"  - Distances: {distances_file}")
    logger.info(f"  - WI (GeoJSON): {wi_geojson}")
    logger.info(f"  - WI (Parquet): {wi_parquet}")

    logger.info("\nNext steps:")
    logger.info("  1. Visualize results in QGIS or web map")
    logger.info("  2. Run Phase 5: API setup for web visualization")


if __name__ == '__main__':
    main()
