"""空間インデックス（R-tree）."""

import geopandas as gpd
import numpy as np
from scipy.spatial import cKDTree
from typing import List, Tuple
from loguru import logger


class SpatialIndex:
    """
    高速な近傍検索のための空間インデックス.

    KD-Treeを使用して、指定距離内のアメニティを効率的に検索します。
    """

    def __init__(self, amenities: gpd.GeoDataFrame):
        """
        初期化.

        Args:
            amenities: アメニティGeoDataFrame
        """
        if amenities.empty:
            raise ValueError("Empty amenities GeoDataFrame")

        self.amenities = amenities.copy()

        # 座標抽出
        self.coords = np.array([
            [geom.y, geom.x] for geom in amenities.geometry
        ])

        # KD-Tree構築
        self.tree = cKDTree(self.coords)

        logger.info(f"SpatialIndex built: {len(amenities)} amenities")

    def find_within_radius(
        self,
        point: Tuple[float, float],
        radius_meters: float
    ) -> gpd.GeoDataFrame:
        """
        指定距離内のアメニティを検索.

        Args:
            point: (lat, lon) タプル
            radius_meters: 検索半径（メートル）

        Returns:
            距離内のアメニティGeoDataFrame
        """
        lat, lon = point

        # 度に変換（緯度35度付近での近似）
        # 1度 ≈ 111km
        radius_deg = radius_meters / 111000

        # KD-Treeで検索
        indices = self.tree.query_ball_point([lat, lon], radius_deg)

        if not indices:
            return gpd.GeoDataFrame()

        # 該当するアメニティを返す
        return self.amenities.iloc[indices].copy()

    def find_nearest(
        self,
        point: Tuple[float, float],
        k: int = 1,
        amenity_type: str = None
    ) -> gpd.GeoDataFrame:
        """
        最近傍のアメニティを検索.

        Args:
            point: (lat, lon) タプル
            k: 取得する件数
            amenity_type: アメニティタイプでフィルタ（オプション）

        Returns:
            最近傍のアメニティGeoDataFrame
        """
        lat, lon = point

        # タイプでフィルタ
        if amenity_type:
            filtered = self.amenities[
                self.amenities['amenity_type'] == amenity_type
            ]

            if filtered.empty:
                return gpd.GeoDataFrame()

            # フィルタ後の座標
            coords_filtered = np.array([
                [geom.y, geom.x] for geom in filtered.geometry
            ])
            tree_filtered = cKDTree(coords_filtered)

            distances, indices = tree_filtered.query([lat, lon], k=k)

            return filtered.iloc[indices].copy()

        else:
            # 全体から検索
            distances, indices = self.tree.query([lat, lon], k=k)

            return self.amenities.iloc[indices].copy()

    def count_within_radius(
        self,
        point: Tuple[float, float],
        radius_meters: float,
        amenity_type: str = None
    ) -> int:
        """
        指定距離内のアメニティ数をカウント.

        Args:
            point: (lat, lon) タプル
            radius_meters: 検索半径（メートル）
            amenity_type: アメニティタイプでフィルタ（オプション）

        Returns:
            アメニティ数
        """
        amenities_within = self.find_within_radius(point, radius_meters)

        if amenity_type:
            amenities_within = amenities_within[
                amenities_within['amenity_type'] == amenity_type
            ]

        return len(amenities_within)
