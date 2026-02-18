"""50mメッシュグリッド生成."""

import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.geometry import Polygon, Point, box
from typing import Optional, Union
from loguru import logger

from ..config import get_config


class GridGenerator:
    """
    50m×50mメッシュグリッドを生成.

    エリアの境界に基づいてグリッドセルを作成し、
    各セルに一意のIDと重心座標を付与します。
    """

    def __init__(self, cell_size: int = 50, crs: str = None):
        """
        初期化.

        Args:
            cell_size: セルサイズ（メートル）デフォルト50m
            crs: 座標参照系。Noneの場合は設定から読み込み
        """
        config = get_config()
        grid_config = config.get_grid_config()

        self.cell_size = cell_size or grid_config.get('cell_size', 50)
        self.crs = crs or grid_config.get('crs', 'EPSG:6677')

        logger.info(f"GridGenerator: cell_size={self.cell_size}m, crs={self.crs}")

    def generate(
        self,
        boundary: Union[gpd.GeoDataFrame, Polygon],
        area_name: str = "area"
    ) -> gpd.GeoDataFrame:
        """
        境界内にグリッドを生成.

        Args:
            boundary: 境界ポリゴン（GeoDataFrameまたはPolygon）
            area_name: エリア名（グリッドID生成用）

        Returns:
            GeoDataFrame with columns:
                - grid_id: グリッド一意ID
                - geometry: セルポリゴン
                - centroid_lat: 重心緯度
                - centroid_lon: 重心経度
        """
        logger.info(f"Generating {self.cell_size}m grid for: {area_name}")

        # GeoDataFrameからPolygonを抽出
        if isinstance(boundary, gpd.GeoDataFrame):
            if len(boundary) == 0:
                raise ValueError("Empty boundary GeoDataFrame")
            boundary_geom = boundary.geometry.iloc[0]
        else:
            boundary_geom = boundary

        # WGS84に変換（まだの場合）
        if isinstance(boundary, gpd.GeoDataFrame):
            if boundary.crs != 'EPSG:4326':
                boundary = boundary.to_crs('EPSG:4326')
                boundary_geom = boundary.geometry.iloc[0]

        # 投影座標系に変換（距離計算用）
        boundary_gdf = gpd.GeoDataFrame(
            {'geometry': [boundary_geom]},
            crs='EPSG:4326'
        )
        boundary_proj = boundary_gdf.to_crs(self.crs)
        boundary_geom_proj = boundary_proj.geometry.iloc[0]

        # Bounding box取得
        minx, miny, maxx, maxy = boundary_geom_proj.bounds

        logger.info(f"Boundary: ({minx:.0f}, {miny:.0f}) to ({maxx:.0f}, {maxy:.0f})")

        # グリッドセル生成
        x_coords = np.arange(minx, maxx, self.cell_size)
        y_coords = np.arange(miny, maxy, self.cell_size)

        logger.info(f"Grid dimensions: {len(x_coords)} x {len(y_coords)} = {len(x_coords) * len(y_coords)} cells")

        cells = []
        grid_ids = []

        for i, x in enumerate(x_coords):
            for j, y in enumerate(y_coords):
                # セルポリゴン作成
                cell = box(x, y, x + self.cell_size, y + self.cell_size)

                # 境界と交差チェック
                if cell.intersects(boundary_geom_proj):
                    cells.append(cell)
                    grid_ids.append(f"{area_name}_{i:05d}_{j:05d}")

        logger.info(f"Generated {len(cells)} cells within boundary")

        if len(cells) == 0:
            raise ValueError("No grid cells generated within boundary")

        # GeoDataFrame作成
        grid_gdf = gpd.GeoDataFrame(
            {'grid_id': grid_ids, 'geometry': cells},
            crs=self.crs
        )

        # 重心座標を追加（WGS84）
        grid_gdf['centroid_geom'] = grid_gdf.geometry.centroid

        # WGS84に変換
        grid_wgs84 = grid_gdf.to_crs('EPSG:4326')

        # 重心の緯度経度
        grid_wgs84['centroid_lat'] = grid_wgs84['centroid_geom'].y
        grid_wgs84['centroid_lon'] = grid_wgs84['centroid_geom'].x

        # 不要な列を削除
        grid_wgs84 = grid_wgs84.drop(columns=['centroid_geom'])

        logger.info(f"Grid generation complete: {len(grid_wgs84)} cells")

        return grid_wgs84

    def generate_from_place(
        self,
        place_name: str
    ) -> gpd.GeoDataFrame:
        """
        地名からグリッドを生成.

        Args:
            place_name: 地名（例: "品川区, 東京都, 日本"）

        Returns:
            GeoDataFrame with grid cells
        """
        import osmnx as ox

        logger.info(f"Fetching boundary for: {place_name}")

        # 境界取得
        boundary = ox.geocode_to_gdf(place_name)

        # エリア名を抽出（簡易）
        area_name = place_name.split(',')[0].strip().replace(' ', '_')

        # グリッド生成
        grid = self.generate(boundary, area_name)

        return grid

    def save(
        self,
        grid: gpd.GeoDataFrame,
        output_path: str
    ):
        """
        グリッドをファイルに保存.

        Args:
            grid: Grid GeoDataFrame
            output_path: 出力パス（.geojson, .parquet等）
        """
        from pathlib import Path

        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        if output_path.suffix == '.geojson':
            grid.to_file(output_path, driver='GeoJSON')
        elif output_path.suffix == '.parquet':
            grid.to_parquet(output_path)
        else:
            raise ValueError(f"Unsupported format: {output_path.suffix}")

        logger.info(f"Saved grid: {output_path}")
