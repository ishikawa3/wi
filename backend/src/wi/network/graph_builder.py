"""歩行ネットワークグラフ構築."""

import networkx as nx
import osmnx as ox
from pathlib import Path
from loguru import logger


class WalkingNetworkBuilder:
    """
    歩行ネットワークグラフを構築・処理.

    OSMnxで取得したグラフに対して、
    - 距離・時間属性の追加
    - 投影座標系への変換
    - 不要エッジの除去
    などを行います。
    """

    def __init__(self, walking_speed_m_per_min: float = 80):
        """
        初期化.

        Args:
            walking_speed_m_per_min: 歩行速度（m/分）デフォルト80
        """
        self.walking_speed = walking_speed_m_per_min
        logger.info(f"WalkingNetworkBuilder: speed={walking_speed_m_per_min}m/min")

    def build(self, G: nx.MultiDiGraph) -> nx.MultiDiGraph:
        """
        ネットワークグラフを処理.

        Args:
            G: OSMnxで取得したグラフ

        Returns:
            処理済みグラフ
        """
        logger.info("Processing network graph...")
        logger.info(f"  Original: {len(G.nodes())} nodes, {len(G.edges())} edges")

        # 投影（まだの場合）
        if not G.graph.get('crs'):
            G = ox.project_graph(G)

        # エッジ長さを追加（まだない場合）
        if not all('length' in data for u, v, data in G.edges(data=True)):
            G = ox.add_edge_lengths(G)

        # 歩行時間を追加
        for u, v, k, data in G.edges(keys=True, data=True):
            length = data.get('length', 0)
            data['walking_time'] = length / self.walking_speed  # 分

        logger.info("  Added walking times")

        # 連結成分チェック
        if not nx.is_strongly_connected(G):
            # 最大強連結成分のみを使用
            largest_cc = max(nx.strongly_connected_components(G), key=len)
            G = G.subgraph(largest_cc).copy()
            logger.warning(
                f"  Network is not strongly connected. "
                f"Using largest component: {len(G.nodes())} nodes"
            )

        logger.info(f"  Final: {len(G.nodes())} nodes, {len(G.edges())} edges")

        return G

    def load(self, filepath: Path) -> nx.MultiDiGraph:
        """
        保存されたグラフを読み込み.

        Args:
            filepath: GraphMLファイルパス

        Returns:
            グラフ
        """
        logger.info(f"Loading network from: {filepath}")

        G = nx.read_graphml(filepath)

        # グラフ属性を復元
        G = nx.MultiDiGraph(G)

        logger.info(f"  Loaded: {len(G.nodes())} nodes, {len(G.edges())} edges")

        return G

    def save(self, G: nx.MultiDiGraph, filepath: Path):
        """
        グラフを保存.

        Args:
            G: グラフ
            filepath: 出力パス
        """
        filepath.parent.mkdir(parents=True, exist_ok=True)

        nx.write_graphml(G, filepath)

        logger.info(f"Saved network: {filepath}")
