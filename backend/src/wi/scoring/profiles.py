"""プロファイル管理."""

from typing import Dict, Any
from loguru import logger

from ..config import get_config


class ProfileManager:
    """
    プロファイル管理クラス.

    設定ファイルからプロファイルを読み込み、
    スコア計算に必要なパラメータを提供します。
    """

    def __init__(self):
        """初期化."""
        self.config = get_config()
        self.profiles_config = self.config.profiles

    def get_profile(self, profile_name: str) -> Dict[str, Any]:
        """
        プロファイル設定を取得.

        Args:
            profile_name: プロファイル名

        Returns:
            プロファイル設定辞書
        """
        return self.config.get_profile(profile_name)

    def get_amenity_params(
        self,
        profile_name: str,
        amenity_type: str
    ) -> Dict[str, Any]:
        """
        特定アメニティのパラメータを取得.

        Args:
            profile_name: プロファイル名
            amenity_type: アメニティタイプ

        Returns:
            パラメータ辞書（weight, ideal_distance, max_distance等）
        """
        profile = self.get_profile(profile_name)
        amenities = profile.get('amenities', {})

        if amenity_type not in amenities:
            logger.warning(
                f"Amenity type '{amenity_type}' not found in profile '{profile_name}'"
            )
            return None

        return amenities[amenity_type]

    def get_decay_params(self, decay_type: str = 'exponential') -> Dict[str, Any]:
        """
        減衰関数のパラメータを取得.

        Args:
            decay_type: 減衰関数タイプ

        Returns:
            パラメータ辞書
        """
        decay_functions = self.profiles_config.get('decay_functions', {})
        return decay_functions.get(decay_type, {})

    def get_diminishing_returns_params(self) -> Dict[str, Any]:
        """
        効用逓減のパラメータを取得.

        Returns:
            パラメータ辞書
        """
        return self.profiles_config.get('diminishing_returns', {
            'enabled': True,
            'exponent': 0.5
        })

    def list_profiles(self) -> list:
        """利用可能なプロファイル一覧を取得."""
        return self.config.list_profiles()
