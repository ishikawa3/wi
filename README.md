# Walkability Index (WI) 計算システム

東京大学CSIS論文「Walkability と不動産価値」(2020)の方法論に基づき、徒歩圏内のアメニティ充実度を0-100点で評価するシステム。

## 概要

- **50m×50mメッシュ単位**での詳細評価
- **ヘドニック理論**に基づく科学的な重み付け
- **フィッシャー理想指数式**による厳密なスコア計算
- **プロファイル別評価**（ファミリー、シングル、高齢者、オフィス）

## データソース

| データ | 用途 | 取得方法 |
|--------|------|---------|
| OpenStreetMap | 商業施設・道路ネットワーク | OSMnx経由 |
| 国土数値情報 | 公共施設（医療・教育・文化・公園） | 国土交通省API |
| 地価公示データ | ヘドニック分析（重み推定） | 国土交通省 |

## プロジェクト構造

```
wi/
├── backend/
│   ├── src/wi/
│   │   ├── data/          # データ取得
│   │   ├── hedonic/       # ヘドニック分析（重み推定）
│   │   ├── network/       # 道路ネットワーク構築
│   │   ├── grid/          # 50mメッシュ生成
│   │   ├── scoring/       # WIスコア計算
│   │   ├── cache/         # キャッシング
│   │   └── api/           # FastAPI
│   ├── tests/
│   └── scripts/           # 実行スクリプト
│
├── frontend/              # Web可視化（React + Mapbox）
├── config/                # 設定ファイル
├── data/                  # データ保存（.gitignore）
└── docs/                  # ドキュメント
```

## 実装フェーズ

### Phase 0: ヘドニック分析（Week 1-3）
不動産価格データから各アメニティへの支払意思額を統計的に推定

### Phase 1-2: データ収集とネットワーク（Week 4-7）
OSM・国土数値情報からアメニティと歩行ネットワークを取得

### Phase 3-4: スコアリング（Week 8-11）
フィッシャー指数によるWI計算、並列処理による最適化

### Phase 5-6: API・可視化（Week 12-15）
FastAPI実装、Webマップ可視化

### Phase 7: 展開（Week 16-18）
東京23区全域対応、検証、ドキュメント整備

## セットアップ

### 必要環境
- Python 3.9+
- Node.js 18+（フロントエンド）
- 約50GB のストレージ（データ保存用）

### インストール

```bash
# Pythonパッケージ
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# フロントエンド（Phase 5以降）
cd frontend
npm install
```

## 使用方法

### 1. データ取得

```bash
# OSMデータと国土数値情報をダウンロード
python backend/scripts/phase1_download_data.py --area "品川区, 東京都, 日本"
```

### 2. ヘドニック分析（重み推定）

```bash
# 不動産価格データからアメニティの重みを推定
python backend/scripts/phase0_hedonic_analysis.py --data data/raw/land_prices.csv
```

### 3. WI計算

```bash
# 50mメッシュごとにWIスコアを計算
python backend/scripts/phase2_compute_wi.py --area "品川区" --profile family
```

### 4. API起動

```bash
# FastAPIサーバー起動
cd backend
uvicorn src.wi.api.app:app --reload --port 8000
```

### 5. Web可視化

```bash
# フロントエンド起動
cd frontend
npm run dev
```

→ http://localhost:3000 でヒートマップ表示

## 設定

`config/profiles.yaml` でプロファイル別のパラメータを調整可能：

```yaml
residential_family:
  amenities:
    supermarket:
      ideal_distance: 400  # 理想距離(m)
      max_distance: 1000   # 最大距離(m)
    daycare:
      ideal_distance: 500
      max_distance: 1000
    # ...
```

## API エンドポイント

- `GET /api/v1/wi/grid/{area_id}?profile=family` - グリッドWIスコア取得
- `GET /api/v1/wi/point?lat=35.6&lon=139.7&profile=family` - 地点WI取得
- `GET /api/v1/amenities/{area_id}` - アメニティ位置情報取得
- `GET /api/v1/profiles` - 利用可能なプロファイル一覧

## 理論的背景

### ヘドニック理論
不動産価格を建物属性・立地属性・アメニティ集積で回帰分析し、各要素の限界支払意思額を推定。

```
log(Price) = β₀ + Σ(β_i × Amenity_i) + ...
```

### フィッシャー理想指数
物価指数理論を応用し、アメニティの「価格（支払意思額）」と「数量（距離減衰考慮）」から厳密に指数化。

```
WI = [Laspeyres × Paasche]^(1/2) × 100
```

## 参考文献

- 清水千弘ほか (2020) 「Walkability と不動産価値: Walkability Index の開発」CSIS Discussion Paper No.163
- Shimizu et al. (2014) "Do Urban Amenities drive Housing Rent?" CSIS Discussion Paper No.131

## ライセンス

MIT License

## 貢献

Issue・Pull Request歓迎。

## 連絡先

- GitHub: https://github.com/ishikawa3/wi
