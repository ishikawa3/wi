#!/usr/bin/env python
"""
複数エリア・プロファイルの比較分析スクリプト

使用例:
    # 品川区と渋谷区を比較
    python compare_areas.py --areas shinagawa shibuya --profile residential_family

    # 1つのエリアで複数プロファイルを比較
    python compare_areas.py --area shinagawa --profiles residential_family residential_elderly
"""

import click
from pathlib import Path
import sys
import pandas as pd
import geopandas as gpd
import matplotlib.pyplot as plt
import seaborn as sns

sys.path.insert(0, str(Path(__file__).parent.parent))

from loguru import logger


@click.command()
@click.option(
    '--areas',
    multiple=True,
    help='Area names to compare (can specify multiple)'
)
@click.option(
    '--area',
    help='Single area name (for profile comparison)'
)
@click.option(
    '--profiles',
    multiple=True,
    help='Profile names to compare (can specify multiple)'
)
@click.option(
    '--profile',
    help='Single profile name (for area comparison)'
)
@click.option(
    '--data-dir',
    type=click.Path(),
    default=None,
    help='Data directory'
)
@click.option(
    '--output',
    type=click.Path(),
    default='comparison_results',
    help='Output directory for results'
)
def main(areas, area, profiles, profile, data_dir, output):
    """複数エリア・プロファイルの比較分析."""

    logger.info("=" * 60)
    logger.info("Walkability Index Comparison Analysis")
    logger.info("=" * 60)

    # Data directory
    if data_dir is None:
        data_dir = Path(__file__).parent.parent.parent / "data" / "processed"
    else:
        data_dir = Path(data_dir)

    output_dir = Path(output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Determine comparison type
    if areas and profile:
        # エリア比較
        logger.info(f"Comparing areas: {areas}")
        logger.info(f"Profile: {profile}")
        compare_areas_analysis(list(areas), profile, data_dir, output_dir)

    elif area and profiles:
        # プロファイル比較
        logger.info(f"Area: {area}")
        logger.info(f"Comparing profiles: {profiles}")
        compare_profiles_analysis(area, list(profiles), data_dir, output_dir)

    else:
        logger.error("Please specify either:")
        logger.error("  --areas AREA1 AREA2 --profile PROFILE  (area comparison)")
        logger.error("  --area AREA --profiles PROF1 PROF2     (profile comparison)")
        sys.exit(1)


def compare_areas_analysis(areas: list, profile: str, data_dir: Path, output_dir: Path):
    """複数エリアの比較分析."""

    logger.info("\n" + "=" * 60)
    logger.info("Loading WI data...")
    logger.info("=" * 60)

    # データ読み込み
    wi_data = {}

    for area in areas:
        file_path = data_dir / f"wi_{area}_{profile}.parquet"

        if not file_path.exists():
            # Try GeoJSON
            file_path = data_dir / f"wi_{area}_{profile}.geojson"

        if not file_path.exists():
            logger.error(f"File not found for {area}: {file_path}")
            continue

        if file_path.suffix == '.parquet':
            gdf = gpd.read_parquet(file_path)
        else:
            gdf = gpd.read_file(file_path)

        wi_data[area] = gdf
        logger.info(f"  {area}: {len(gdf)} cells")

    if len(wi_data) < 2:
        logger.error("Need at least 2 areas to compare")
        sys.exit(1)

    # 統計情報
    logger.info("\n" + "=" * 60)
    logger.info("Statistics Summary")
    logger.info("=" * 60)

    stats_rows = []

    for area, gdf in wi_data.items():
        stats = {
            'Area': area,
            'Cells': len(gdf),
            'Mean WI': gdf['wi_score'].mean(),
            'Std WI': gdf['wi_score'].std(),
            'Min WI': gdf['wi_score'].min(),
            'Max WI': gdf['wi_score'].max(),
            'Median WI': gdf['wi_score'].median(),
        }
        stats_rows.append(stats)

        logger.info(f"\n{area}:")
        logger.info(f"  Mean: {stats['Mean WI']:.2f}")
        logger.info(f"  Std:  {stats['Std WI']:.2f}")
        logger.info(f"  Range: {stats['Min WI']:.2f} - {stats['Max WI']:.2f}")

    # DataFrameに変換
    stats_df = pd.DataFrame(stats_rows)

    # CSV出力
    stats_file = output_dir / f"area_comparison_{profile}.csv"
    stats_df.to_csv(stats_file, index=False)
    logger.info(f"\n統計情報を保存: {stats_file}")

    # ===  可視化 ===
    logger.info("\n" + "=" * 60)
    logger.info("Creating visualizations...")
    logger.info("=" * 60)

    # 1. ヒストグラム比較
    fig, ax = plt.subplots(figsize=(12, 6))

    for area, gdf in wi_data.items():
        ax.hist(gdf['wi_score'], bins=50, alpha=0.5, label=area, density=True)

    ax.set_xlabel('Walkability Index', fontsize=12)
    ax.set_ylabel('Density', fontsize=12)
    ax.set_title(f'WI Distribution Comparison ({profile})', fontsize=14)
    ax.legend()
    ax.grid(True, alpha=0.3)

    hist_file = output_dir / f"area_histogram_{profile}.png"
    plt.tight_layout()
    plt.savefig(hist_file, dpi=300)
    logger.info(f"  ヒストグラム: {hist_file}")
    plt.close()

    # 2. ボックスプロット
    fig, ax = plt.subplots(figsize=(10, 6))

    data_for_box = [gdf['wi_score'].values for area, gdf in wi_data.items()]
    labels = list(wi_data.keys())

    bp = ax.boxplot(data_for_box, labels=labels, patch_artist=True)

    # 色付け
    colors = sns.color_palette("Set2", len(wi_data))
    for patch, color in zip(bp['boxes'], colors):
        patch.set_facecolor(color)

    ax.set_ylabel('Walkability Index', fontsize=12)
    ax.set_title(f'WI Comparison ({profile})', fontsize=14)
    ax.grid(True, alpha=0.3, axis='y')

    box_file = output_dir / f"area_boxplot_{profile}.png"
    plt.tight_layout()
    plt.savefig(box_file, dpi=300)
    logger.info(f"  ボックスプロット: {box_file}")
    plt.close()

    # 3. 統計サマリーバー
    fig, ax = plt.subplots(figsize=(12, 6))

    x = range(len(stats_df))
    width = 0.35

    ax.bar([i - width/2 for i in x], stats_df['Mean WI'], width,
           label='Mean', alpha=0.8, color='skyblue')
    ax.bar([i + width/2 for i in x], stats_df['Max WI'], width,
           label='Max', alpha=0.8, color='coral')

    ax.set_ylabel('WI Score', fontsize=12)
    ax.set_title(f'Mean and Max WI by Area ({profile})', fontsize=14)
    ax.set_xticks(x)
    ax.set_xticks(labels)
    ax.legend()
    ax.grid(True, alpha=0.3, axis='y')

    bar_file = output_dir / f"area_barplot_{profile}.png"
    plt.tight_layout()
    plt.savefig(bar_file, dpi=300)
    logger.info(f"  バープロット: {bar_file}")
    plt.close()

    logger.info("\n" + "=" * 60)
    logger.info("Area Comparison Complete!")
    logger.info("=" * 60)
    logger.info(f"Results saved to: {output_dir}")


def compare_profiles_analysis(area: str, profiles: list, data_dir: Path, output_dir: Path):
    """同一エリアで複数プロファイルを比較."""

    logger.info("\n" + "=" * 60)
    logger.info("Loading WI data...")
    logger.info("=" * 60)

    # データ読み込み
    wi_data = {}

    for profile in profiles:
        file_path = data_dir / f"wi_{area}_{profile}.parquet"

        if not file_path.exists():
            file_path = data_dir / f"wi_{area}_{profile}.geojson"

        if not file_path.exists():
            logger.error(f"File not found for {profile}: {file_path}")
            continue

        if file_path.suffix == '.parquet':
            gdf = gpd.read_parquet(file_path)
        else:
            gdf = gpd.read_file(file_path)

        wi_data[profile] = gdf
        logger.info(f"  {profile}: {len(gdf)} cells")

    if len(wi_data) < 2:
        logger.error("Need at least 2 profiles to compare")
        sys.exit(1)

    # 統計情報
    logger.info("\n" + "=" * 60)
    logger.info("Statistics Summary")
    logger.info("=" * 60)

    stats_rows = []

    for profile, gdf in wi_data.items():
        stats = {
            'Profile': profile,
            'Mean WI': gdf['wi_score'].mean(),
            'Std WI': gdf['wi_score'].std(),
            'Min WI': gdf['wi_score'].min(),
            'Max WI': gdf['wi_score'].max(),
            'Median WI': gdf['wi_score'].median(),
        }
        stats_rows.append(stats)

        logger.info(f"\n{profile}:")
        logger.info(f"  Mean: {stats['Mean WI']:.2f}")
        logger.info(f"  Std:  {stats['Std WI']:.2f}")

    stats_df = pd.DataFrame(stats_rows)

    stats_file = output_dir / f"profile_comparison_{area}.csv"
    stats_df.to_csv(stats_file, index=False)
    logger.info(f"\n統計情報を保存: {stats_file}")

    # 可視化
    logger.info("\n" + "=" * 60)
    logger.info("Creating visualizations...")
    logger.info("=" * 60)

    # ヒストグラム
    fig, ax = plt.subplots(figsize=(12, 6))

    for profile, gdf in wi_data.items():
        ax.hist(gdf['wi_score'], bins=50, alpha=0.5, label=profile, density=True)

    ax.set_xlabel('Walkability Index', fontsize=12)
    ax.set_ylabel('Density', fontsize=12)
    ax.set_title(f'WI Distribution by Profile ({area})', fontsize=14)
    ax.legend()
    ax.grid(True, alpha=0.3)

    hist_file = output_dir / f"profile_histogram_{area}.png"
    plt.tight_layout()
    plt.savefig(hist_file, dpi=300)
    logger.info(f"  ヒストグラム: {hist_file}")
    plt.close()

    # 散布図（2つのプロファイルの相関）
    if len(wi_data) == 2:
        profile1, profile2 = list(wi_data.keys())
        gdf1 = wi_data[profile1]
        gdf2 = wi_data[profile2]

        # grid_idでマージ
        merged = gdf1[['grid_id', 'wi_score']].merge(
            gdf2[['grid_id', 'wi_score']],
            on='grid_id',
            suffixes=('_1', '_2')
        )

        fig, ax = plt.subplots(figsize=(8, 8))

        ax.scatter(merged['wi_score_1'], merged['wi_score_2'], alpha=0.3, s=10)

        # 対角線
        lims = [0, 100]
        ax.plot(lims, lims, 'r--', alpha=0.5, label='y=x')

        ax.set_xlabel(f'WI ({profile1})', fontsize=12)
        ax.set_ylabel(f'WI ({profile2})', fontsize=12)
        ax.set_title(f'WI Correlation ({area})', fontsize=14)
        ax.legend()
        ax.grid(True, alpha=0.3)
        ax.set_xlim(lims)
        ax.set_ylim(lims)

        scatter_file = output_dir / f"profile_scatter_{area}.png"
        plt.tight_layout()
        plt.savefig(scatter_file, dpi=300)
        logger.info(f"  散布図: {scatter_file}")
        plt.close()

        # 相関係数
        corr = merged['wi_score_1'].corr(merged['wi_score_2'])
        logger.info(f"\n相関係数 ({profile1} vs {profile2}): {corr:.3f}")

    logger.info("\n" + "=" * 60)
    logger.info("Profile Comparison Complete!")
    logger.info("=" * 60)
    logger.info(f"Results saved to: {output_dir}")


if __name__ == '__main__':
    main()
