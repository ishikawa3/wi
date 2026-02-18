#!/usr/bin/env python
"""
Phase 1: データダウンロードスクリプト

OSMと国土数値情報からアメニティデータと道路ネットワークをダウンロード.

使用例:
    python phase1_download_data.py --area "品川区, 東京都, 日本" --profile residential_family
"""

import click
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.wi.data import OSMDataLoader, KokudoDataLoader, DataMerger
from src.wi.config import get_config
from loguru import logger


@click.command()
@click.option(
    '--area',
    required=True,
    help='Area name (e.g., "品川区, 東京都, 日本")'
)
@click.option(
    '--profile',
    default='residential_general',
    help='Profile name (default: residential_general)'
)
@click.option(
    '--output-dir',
    type=click.Path(),
    default=None,
    help='Output directory (default: data/processed)'
)
@click.option(
    '--skip-network',
    is_flag=True,
    help='Skip network download'
)
def main(area: str, profile: str, output_dir: str, skip_network: bool):
    """Phase 1: アメニティデータと道路ネットワークのダウンロード."""

    logger.info("=" * 60)
    logger.info("Phase 1: Data Download")
    logger.info("=" * 60)
    logger.info(f"Area: {area}")
    logger.info(f"Profile: {profile}")

    # Output directory
    if output_dir is None:
        output_dir = Path(__file__).parent.parent.parent / "data" / "processed"
    else:
        output_dir = Path(output_dir)

    output_dir.mkdir(parents=True, exist_ok=True)
    logger.info(f"Output directory: {output_dir}")

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

    # === Step 1: Download OSM amenities ===
    logger.info("\n" + "=" * 60)
    logger.info("Step 1: Downloading OSM amenities...")
    logger.info("=" * 60)

    osm_loader = OSMDataLoader()

    try:
        osm_amenities = osm_loader.download_amenities(area, profile)

        if not osm_amenities.empty:
            osm_output = output_dir / f"osm_amenities_{profile}.geojson"
            osm_amenities.to_file(osm_output, driver='GeoJSON')
            logger.info(f"Saved OSM amenities: {osm_output}")
            logger.info(f"  Total: {len(osm_amenities)} facilities")
        else:
            logger.warning("No OSM amenities found!")

    except Exception as e:
        logger.error(f"Failed to download OSM amenities: {e}")
        osm_amenities = None

    # === Step 2: Download Kokudo data ===
    logger.info("\n" + "=" * 60)
    logger.info("Step 2: Downloading Kokudo data...")
    logger.info("=" * 60)

    # 都道府県を抽出（簡易実装）
    prefecture = None
    for pref in ['東京都', '神奈川県', '埼玉県', '千葉県']:
        if pref in area:
            prefecture = pref
            break

    kokudo_amenities = None

    if prefecture:
        logger.info(f"Prefecture: {prefecture}")

        kokudo_loader = KokudoDataLoader()

        # プロファイルで必要な施設タイプを取得
        required_types = list(profile_config['amenities'].keys())

        # 国土数値情報でカバーできるタイプ
        kokudo_types = [
            t for t in required_types
            if t in ['hospital', 'clinic', 'school', 'kindergarten',
                     'library', 'park', 'welfare']
        ]

        if kokudo_types:
            try:
                kokudo_amenities = kokudo_loader.download_facilities(
                    prefecture,
                    kokudo_types
                )

                if not kokudo_amenities.empty:
                    kokudo_output = output_dir / f"kokudo_amenities_{profile}.geojson"
                    kokudo_amenities.to_file(kokudo_output, driver='GeoJSON')
                    logger.info(f"Saved Kokudo amenities: {kokudo_output}")
                    logger.info(f"  Total: {len(kokudo_amenities)} facilities")
                else:
                    logger.warning("No Kokudo amenities downloaded")

            except Exception as e:
                logger.warning(f"Kokudo download failed: {e}")
                logger.info("Continuing with OSM data only...")

    else:
        logger.info("Prefecture not detected, skipping Kokudo data")

    # === Step 3: Merge data ===
    logger.info("\n" + "=" * 60)
    logger.info("Step 3: Merging data sources...")
    logger.info("=" * 60)

    merger = DataMerger(dedup_threshold_meters=100)

    gdfs_to_merge = []
    if kokudo_amenities is not None and not kokudo_amenities.empty:
        gdfs_to_merge.append(kokudo_amenities)
    if osm_amenities is not None and not osm_amenities.empty:
        gdfs_to_merge.append(osm_amenities)

    if gdfs_to_merge:
        merged_amenities = merger.merge(*gdfs_to_merge)

        if not merged_amenities.empty:
            merged_output = output_dir / f"amenities_{profile}.geojson"
            merged_amenities.to_file(merged_output, driver='GeoJSON')
            logger.info(f"Saved merged amenities: {merged_output}")
            logger.info(f"  Total: {len(merged_amenities)} facilities")

            # Validation
            stats = merger.validate_coverage(merged_amenities)
            logger.info("\nCoverage by amenity type:")
            for amenity_type, count in stats['by_type'].items():
                logger.info(f"  {amenity_type}: {count}")

    # === Step 4: Download network ===
    if not skip_network:
        logger.info("\n" + "=" * 60)
        logger.info("Step 4: Downloading walking network...")
        logger.info("=" * 60)

        try:
            network = osm_loader.download_network(area, network_type='walk')

            # Save network
            import networkx as nx
            network_output = output_dir / "walking_network.graphml"
            nx.write_graphml(network, network_output)
            logger.info(f"Saved network: {network_output}")
            logger.info(f"  Nodes: {len(network.nodes())}")
            logger.info(f"  Edges: {len(network.edges())}")

        except Exception as e:
            logger. error(f"Failed to download network: {e}")

    # === Summary ===
    logger.info("\n" + "=" * 60)
    logger.info("Phase 1 Complete!")
    logger.info("=" * 60)
    logger.info(f"Output directory: {output_dir}")
    logger.info("\nNext steps:")
    logger.info("  1. Review downloaded data")
    logger.info("  2. Run Phase 0: Hedonic analysis (if needed)")
    logger.info("  3. Run Phase 2: WI calculation")


if __name__ == '__main__':
    main()
