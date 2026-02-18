"""Walkability Index計算エンジン."""

import pandas as pd
import geopandas as gpd
import numpy as np
from typing import Dict, Any, Optional
from loguru import logger
from tqdm import tqdm

from .decay_functions import DecayFunction
from .profiles import ProfileManager


class WalkabilityCalculator:
    """
    Walkability Indexのメイン計算クラス.

    論文のフィッシャー理想指数式に基づいてWIを計算します。

    基本式（簡略版）:
        WI = Σ(weight_i × score_i) × 100

    where:
        score_i = decay_function(distance_to_nearest_amenity_i)
    """

    def __init__(self, profile_name: str):
        """
        初期化.

        Args:
            profile_name: 使用するプロファイル名
        """
        self.profile_name = profile_name
        self.profile_manager = ProfileManager()

        # プロファイル読み込み
        self.profile = self.profile_manager.get_profile(profile_name)
        self.amenities_config = self.profile['amenities']

        # 減衰関数パラメータ
        self.decay_params = self.profile_manager.get_decay_params()

        # 効用逓減パラメータ
        self.diminishing_params = self.profile_manager.get_diminishing_returns_params()

        logger.info(f"WalkabilityCalculator: profile={profile_name}")
        logger.info(f"  Amenity types: {len(self.amenities_config)}")

    def calculate_amenity_score(
        self,
        distance: float,
        amenity_type: str
    ) -> float:
        """
        単一アメニティのスコアを計算.

        Args:
            distance: アメニティまでの距離（メートル）
            amenity_type: アメニティタイプ

        Returns:
            スコア（0.0～1.0）
        """
        if amenity_type not in self.amenities_config:
            return 0.0

        params = self.amenities_config[amenity_type]

        ideal_distance = params['ideal_distance']
        max_distance = params['max_distance']
        decay_type = params.get('decay_type', 'exponential')

        # 減衰関数を適用
        decay_fn = Dec ayFunction.get_function(decay_type)

        score = decay_fn(
            distance,
            ideal_distance,
            max_distance,
            **self.decay_params
        )

        return score

    def calculate_wi_for_grid(
        self,
        grid: gpd.GeoDataFrame,
        distances_df: pd.DataFrame
    ) -> gpd.GeoDataFrame:
        """
        全グリッドセルのWIを計算.

        Args:
            grid: グリッドGeoDataFrame
            distances_df: 距離DataFrame (grid_id, amenity_id, amenity_type, distance)

        Returns:
            WIスコア付きGeoDataFrame
        """
        logger.info(f"Calculating WI for {len(grid)} grid cells...")

        wi_scores = []

        for idx, cell in tqdm(grid.iterrows(), total=len(grid), desc="Calculating WI"):
            grid_id = cell['grid_id']

            # このグリッドの距離データ
            cell_distances = distances_df[distances_df['grid_id'] == grid_id]

            # WIを計算
            wi_score, amenity_scores = self._calculate_wi_for_cell(
                cell_distances
            )

            wi_scores.append({
                'grid_id': grid_id,
                'wi_score': wi_score,
                **{f"score_{k}": v for k, v in amenity_scores.items()}
            })

        # 結果をDataFrameに
        wi_df = pd.DataFrame(wi_scores)

        # グリッドとマージ
        result = grid.merge(wi_df, on='grid_id', how='left')

        # WIがNaNの場合は0に
        result['wi_score'] = result['wi_score'].fillna(0)

        logger.info(f"WI calculation complete")
        logger.info(f"  Mean WI: {result['wi_score'].mean():.2f}")
        logger.info(f"  Min WI:  {result['wi_score'].min():.2f}")
        logger.info(f"  Max WI:  {result['wi_score'].max():.2f}")

        return result

    def _calculate_wi_for_cell(
        self,
        cell_distances: pd.DataFrame
    ) -> tuple[float, Dict[str, float]]:
        """
        単一グリッドセルのWIを計算.

        Args:
            cell_distances: このセルの距離DataFrame

        Returns:
            (wi_score, amenity_scores辞書)
        """
        amenity_scores = {}
        weighted_sum = 0.0

        for amenity_type, params in self.amenities_config.items():
            # このタイプのアメニティを抽出
            type_distances = cell_distances[
                cell_distances['amenity_type'] == amenity_type
            ]

            if len(type_distances) == 0:
                # アメニティなし
                amenity_scores[amenity_type] = 0.0
                continue

            # 距離でソート
            type_distances = type_distances.sort_values('distance')

            # スコア計算（効用逓減を考慮）
            if self.diminishing_params['enabled']:
                # 複数のアメニティがある場合、効用逓減を適用
                scores = []
                for i, (_, row) in enumerate(type_distances.iterrows()):
                    base_score = self.calculate_amenity_score(
                        row['distance'],
                        amenity_type
                    )

                    # 効用逓減: n番目のアメニティは 1 / (n+1)^exponent
                    exponent = self.diminishing_params['exponent']
                    diminished_score = base_score / ((i + 1) ** exponent)

                    scores.append(diminished_score)

                # 合計（上限は1.0）
                total_score = min(sum(scores), 1.0)

            else:
                # 最寄りのみ使用
                nearest_distance = type_distances.iloc[0]['distance']
                total_score = self.calculate_amenity_score(
                    nearest_distance,
                    amenity_type
                )

            amenity_scores[amenity_type] = total_score

            # 重み付け
            weight = params['weight']
            weighted_sum += weight * total_score

        # 100点満点に変換
        wi_score = weighted_sum * 100

        return wi_score, amenity_scores

    def calculate_wi_for_point(
        self,
        lat: float,
        lon: float,
        distances_df: pd.DataFrame,
        grid: gpd.GeoDataFrame
    ) -> Dict[str, Any]:
        """
        特定地点のWIを計算（最寄りグリッドで補間）.

        Args:
            lat: 緯度
            lon: 経度
            distances_df: 距離DataFrame
            grid: グリッドGeoDataFrame

        Returns:
            WI結果辞書
        """
        from shapely.geometry import Point

        point = Point(lon, lat)

        # 最寄りグリッドを検索
        grid['_distance'] = grid.geometry.distance(point)
        nearest_grid = grid.loc[grid['_distance'].idxmin()]

        grid_id = nearest_grid['grid_id']

        # このグリッドの距離データ
        cell_distances = distances_df[distances_df['grid_id'] == grid_id]

        # WI計算
        wi_score, amenity_scores = self._calculate_wi_for_cell(cell_distances)

        return {
            'lat': lat,
            'lon': lon,
            'grid_id': grid_id,
            'wi_score': wi_score,
            'amenity_scores': amenity_scores
        }
