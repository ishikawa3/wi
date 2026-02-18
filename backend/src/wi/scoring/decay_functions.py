"""距離減衰関数."""

import numpy as np
from typing import Dict, Any


class Dec ayFunction:
    """
    距離減衰関数.

    アメニティまでの距離に応じて効用が減衰する関数を提供します。
    論文では指数減衰が使用されています。
    """

    @staticmethod
    def exponential(
        distance: float,
        ideal_distance: float,
        max_distance: float,
        min_score: float = 0.1
    ) -> float:
        """
        指数減衰関数.

        論文の式:
        - distance <= ideal_distance: score = 1.0
        - ideal_distance < distance <= max_distance:
            score = exp(k × (distance - ideal_distance))
            where k = log(min_score) / (max_distance - ideal_distance)
        - distance > max_distance: score = 0.0

        Args:
            distance: アメニティまでの距離（メートル）
            ideal_distance: 理想距離（メートル）
            max_distance: 最大距離（メートル）
            min_score: max_distanceでのスコア

        Returns:
            スコア（0.0～1.0）
        """
        if distance <= ideal_distance:
            return 1.0
        elif distance > max_distance:
            return 0.0
        else:
            k = np.log(min_score) / (max_distance - ideal_distance)
            score = np.exp(k * (distance - ideal_distance))
            return max(score, 0.0)

    @staticmethod
    def exponential_vectorized(
        distances: np.ndarray,
        ideal_distance: float,
        max_distance: float,
        min_score: float = 0.1
    ) -> np.ndarray:
        """
        指数減衰関数（ベクトル化版）.

        Args:
            distances: 距離の配列
            ideal_distance: 理想距離
            max_distance: 最大距離
            min_score: max_distanceでのスコア

        Returns:
            スコアの配列
        """
        scores = np.ones_like(distances, dtype=float)

        # 減衰範囲
        mask_decay = (distances > ideal_distance) & (distances <= max_distance)
        # ゼロ範囲
        mask_zero = distances > max_distance

        if np.any(mask_decay):
            k = np.log(min_score) / (max_distance - ideal_distance)
            scores[mask_decay] = np.exp(k * (distances[mask_decay] - ideal_distance))

        scores[mask_zero] = 0.0

        return scores

    @staticmethod
    def gaussian(
        distance: float,
        ideal_distance: float,
        max_distance: float,
        sigma_factor: float = 0.3
    ) -> float:
        """
        ガウス減衰関数（代替手法）.

        score = exp(-((distance - ideal_distance) / sigma)^2)
        where sigma = (max_distance - ideal_distance) * sigma_factor

        Args:
            distance: 距離
            ideal_distance: 理想距離
            max_distance: 最大距離
            sigma_factor: シグマ係数

        Returns:
            スコア（0.0～1.0）
        """
        if distance <= ideal_distance:
            return 1.0
        elif distance > max_distance:
            return 0.0
        else:
            sigma = (max_distance - ideal_distance) * sigma_factor
            score = np.exp(-((distance - ideal_distance) / sigma) ** 2)
            return max(score, 0.0)

    @staticmethod
    def linear(
        distance: float,
        ideal_distance: float,
        max_distance: float
    ) -> float:
        """
        線形減衰関数（シンプル版）.

        Args:
            distance: 距離
            ideal_distance: 理想距離
            max_distance: 最大距離

        Returns:
            スコア（0.0～1.0）
        """
        if distance <= ideal_distance:
            return 1.0
        elif distance > max_distance:
            return 0.0
        else:
            # 線形補間
            score = 1.0 - (distance - ideal_distance) / (max_distance - ideal_distance)
            return max(score, 0.0)

    @classmethod
    def get_function(cls, decay_type: str):
        """
        減衰関数を取得.

        Args:
            decay_type: 'exponential', 'gaussian', 'linear'

        Returns:
            減衰関数
        """
        functions = {
            'exponential': cls.exponential,
            'gaussian': cls.gaussian,
            'linear': cls.linear,
        }

        if decay_type not in functions:
            raise ValueError(
                f"Unknown decay type: {decay_type}. "
                f"Available: {list(functions.keys())}"
            )

        return functions[decay_type]
