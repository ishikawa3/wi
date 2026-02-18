#!/usr/bin/env python
"""
簡単な動作確認テスト

インストールと基本機能が動作するか確認します。
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from loguru import logger


def test_imports():
    """パッケージインポートのテスト."""
    logger.info("Testing imports...")

    try:
        # Core packages
        import geopandas
        import osmnx
        import networkx
        import pandas
        import numpy
        logger.info("✓ Core packages OK")

        # WI modules
        from src.wi.config import get_config
        from src.wi.data import OSMDataLoader, KokudoDataLoader, DataMerger
        logger.info("✓ WI modules OK")

        return True

    except ImportError as e:
        logger.error(f"✗ Import failed: {e}")
        return False


def test_config():
    """設定読み込みのテスト."""
    logger.info("\nTesting config...")

    try:
        from src.wi.config import get_config

        config = get_config()

        # プロファイル一覧
        profiles = config.list_profiles()
        logger.info(f"  Available profiles: {profiles}")

        # プロファイル取得
        family_profile = config.get_profile('residential_family')
        logger.info(f"  Family profile has {len(family_profile['amenities'])} amenity types")

        # グリッド設定
        grid_config = config.get_grid_config()
        logger.info(f"  Grid cell size: {grid_config['cell_size']}m")

        logger.info("✓ Config OK")
        return True

    except Exception as e:
        logger.error(f"✗ Config test failed: {e}")
        return False


def test_data_loaders():
    """データローダーのインスタンス化テスト."""
    logger.info("\nTesting data loaders...")

    try:
        from src.wi.data import OSMDataLoader, KokudoDataLoader, DataMerger

        # OSM loader
        osm_loader = OSMDataLoader()
        logger.info("  ✓ OSMDataLoader initialized")

        # Kokudo loader
        kokudo_loader = KokudoDataLoader()
        logger.info("  ✓ KokudoDataLoader initialized")

        # Merger
        merger = DataMerger()
        logger.info("  ✓ DataMerger initialized")

        logger.info("✓ Data loaders OK")
        return True

    except Exception as e:
        logger.error(f"✗ Data loader test failed: {e}")
        return False


def main():
    """メインテスト."""
    logger.info("=" * 60)
    logger.info("Walkability Index - Setup Test")
    logger.info("=" * 60)

    results = []

    # Run tests
    results.append(("Imports", test_imports()))
    results.append(("Config", test_config()))
    results.append(("Data Loaders", test_data_loaders()))

    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("Test Summary")
    logger.info("=" * 60)

    passed = 0
    failed = 0

    for name, result in results:
        status = "PASS" if result else "FAIL"
        logger.info(f"  {name}: {status}")

        if result:
            passed += 1
        else:
            failed += 1

    logger.info(f"\nTotal: {passed} passed, {failed} failed")

    if failed == 0:
        logger.info("\n✓ All tests passed! Setup is correct.")
        logger.info("\nNext steps:")
        logger.info("  python scripts/phase1_download_data.py --area '品川区, 東京都, 日本'")
        return 0
    else:
        logger.error("\n✗ Some tests failed. Please check the installation.")
        return 1


if __name__ == '__main__':
    sys.exit(main())
