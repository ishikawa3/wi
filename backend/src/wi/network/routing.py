"""歩行距離計算（ルーティング）."""

import networkx as nx
import geopandas as gpd
import pandas as pd
import numpy as np
from scipy.spatial import cKDTree
from typing import Dict, List, Tuple
from loguru import logger
from tqdm import tqdm


class WalkingDistanceCalculator:
    """
    ネットワーク上の歩行距離を計算.

    Dijkstra法を使用して、グリッドセルからアメニティまでの
    実際の歩行経路に基づく距離を計算します。
    """

    def __init__(self, network: nx.MultiDiGraph):
        """
        初期化.

        Args:
            network: 歩行ネットワークグラフ
        """
        self.G = network

        # ノード座標を抽出（高速検索用）
        self.node_coords = np.array([
            (data['y'], data['x'])
            for node, data in network.nodes(data=True)
        ])
        self.node_ids = list(network.nodes())

        # KD-Tree構築
        self.node_tree = cKDTree(self.node_coords)

        logger.info(
            f"WalkingDistanceCalculator: "
            f"{len(network.nodes())} nodes, {len(network.edges())} edges"
        )

    def find_nearest_node(self, lat: float, lon: float) -> int:
        """
        座標に最も近いネットワークノードを検索.

        Args:
            lat: 緯度
            lon: 経度

        Returns:
            ノードID
        """
        distance, index = self.node_tree.query([lat, lon])
        return self.node_ids[index]

    def calculate_distances_from_point(
        self,
        origin: Tuple[float, float],
        amenities: gpd.GeoDataFrame,
        max_distance: float = 1000
    ) -> Dict[str, float]:
        """
        起点から各アメニティまでの距離を計算.

        Args:
            origin: (lat, lon) 起点座標
            amenities: アメニティGeoDataFrame
            max_distance: 最大距離（メートル）

        Returns:
            {amenity_id: distance} の辞書
        """
        lat, lon = origin

        # 最寄りノードを検索
        origin_node = self.find_nearest_node(lat, lon)

        # Dijkstra法で距離計算
        try:
            distances = nx.single_source_dijkstra_path_length(
                self.G,
                origin_node,
                cutoff=max_distance,
                weight='length'
            )
        except nx.NetworkXError:
            # ノードが到達不可能
            return {}

        # 各アメニティまでの距離を計算
        result = {}

        for idx, amenity in amenities.iterrows():
            amenity_node = self.find_nearest_node(
                amenity.geometry.y,
                amenity.geometry.x
            )

            if amenity_node in distances:
                # アメニティIDがある場合はそれを使用、なければindexを使用
                amenity_id = amenity.get('amenity_id', idx)
                result[amenity_id] = distances[amenity_node]

        return result

    def calculate_distances_batch(
        self,
        grid: gpd.GeoDataFrame,
        amenities: gpd.GeoDataFrame,
        max_distance: float = 1000,
        parallel: bool = False
    ) -> pd.DataFrame:
        """
        全グリッドセルからアメニティまでの距離を計算.

        Args:
            grid: グリッドGeoDataFrame
            amenities: アメニティGeoDataFrame
            max_distance: 最大距離（メートル）
            parallel: 並列処理を使用（未実装）

        Returns:
            DataFrame with columns: grid_id, amenity_id, amenity_type, distance
        """
        logger.info(
            f"Calculating distances: "
            f"{len(grid)} grids × {len(amenities)} amenities"
        )

        # アメニティIDを追加（なければ）
        if 'amenity_id' not in amenities.columns:
            amenities = amenities.copy()
            amenities['amenity_id'] = [f"amenity_{i}" for i in range(len(amenities))]

        all_distances = []

        # 各グリッドセルについて計算
        for idx, cell in tqdm(grid.iterrows(), total=len(grid), desc="Calculating distances"):
            origin = (cell['centroid_lat'], cell['centroid_lon'])
            grid_id = cell['grid_id']

            # 距離計算
            distances = self.calculate_distances_from_point(
                origin,
                amenities,
                max_distance
            )

            # 結果を記録
            for amenity_id, distance in distances.items():
                # アメニティタイプを取得
                amenity_row = amenities[amenities['amenity_id'] == amenity_id].iloc[0]

                all_distances.append({
                    'grid_id': grid_id,
                    'amenity_id': amenity_id,
                    'amenity_type': amenity_row['amenity_type'],
                    'distance': distance
                })

        # DataFrameに変換
        distances_df = pd.DataFrame(all_distances)

        logger.info(f"Calculated {len(distances_df)} distance pairs")

        return distances_df

    def get_reachable_amenities(
        self,
        origin: Tuple[float, float],
        max_distance: float = 1000
    ) -> List[int]:
        """
        起点から到達可能なノード一覧を取得.

        Args:
            origin: (lat, lon) 起点座標
            max_distance: 最大距離（メートル）

        Returns:
            到達可能なノードIDのリスト
        """
        lat, lon = origin
        origin_node = self.find_nearest_node(lat, lon)

        try:
            distances = nx.single_source_dijkstra_path_length(
                self.G,
                origin_node,
                cutoff=max_distance,
                weight='length'
            )
            return list(distances.keys())

        except nx.NetworkXError:
            return []
