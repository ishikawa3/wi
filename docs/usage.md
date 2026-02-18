# Walkability Index 実装完了ガイド

## 完成した機能

✅ **Phase 1: データ取得**
- OSMデータローダー
- 国土数値情報ローダー
- データ統合・重複除去

✅ **Phase 2: WI計算**
- 50mメッシュグリッド生成
- 歩行距離計算（Dijkstra法）
- フィッシャー指数ベースのWI計算
- 距離減衰関数
- 効用逓減モデル

## クイックスタート

### 1. セットアップ

```bash
cd /Users/ishikawa/Dev/wi/backend

# 仮想環境作成
python3 -m venv venv
source venv/bin/activate

# パッケージインストール
pip install -r requirements.txt

# 動作確認
python scripts/test_setup.py
```

### 2. データダウンロード（Phase 1）

```bash
# 品川区のデータを取得（ファミリー向けプロファイル）
python scripts/phase1_download_data.py \
    --area "品川区, 東京都, 日本" \
    --profile residential_family
```

**出力:**
- `data/processed/amenities_residential_family.geojson` - アメニティ位置情報
- `data/processed/walking_network.graphml` - 歩行ネットワーク

### 3. WI計算（Phase 2）

```bash
# Walkability Indexを計算
python scripts/phase2_compute_wi.py \
    --area shinagawa \
    --profile residential_family \
    --max-distance 1000
```

**出力:**
- `data/processed/grid_shinagawa_residential_family.geojson` - 50mグリッド
- `data/processed/distances_shinagawa_residential_family.parquet` - 歩行距離データ
- `data/processed/wi_shinagawa_residential_family.geojson` - **WIスコア（最終結果）**

### 4. 結果の可視化

#### QGISで可視化

1. QGISを起動
2. `wi_shinagawa_residential_family.geojson`をドラッグ&ドロップ
3. スタイリング:
   - 列: `wi_score`
   - 分類: 段階的（Graduated）
   - カラーランプ: 青→黄→赤
   - 範囲: 0-100

#### Pythonで簡易可視化

```python
import geopandas as gpd
import matplotlib.pyplot as plt

# WIデータ読み込み
wi = gpd.read_file('data/processed/wi_shinagawa_residential_family.geojson')

# プロット
fig, ax = plt.subplots(1, 1,figsize=(10, 10))
wi.plot(column='wi_score',
        cmap='RdYlGn',
        legend=True,
        ax=ax,
        vmin=0, vmax=100)

ax.set_title('Walkability Index - Shinagawa (Family)', fontsize=16)
ax.axis('off')
plt.tight_layout()
plt.savefig('wi_map.png', dpi=300)
plt.show()
```

## プロファイル一覧

| プロファイル | 対象ユーザー | 重視するアメニティ |
|------------|------------|-----------------|
| `residential_general` | 一般居住者 | スーパー、コンビニ、薬局、カフェ |
| `residential_family` | ファミリー世帯 | 保育園、学校、公園、医療機関 |
| `residential_single` | 単身世帯 | コンビニ、飲食店、カフェ |
| `residential_elderly` | 高齢者 | 病院、薬局、スーパー |
| `office` | オフィスワーカー | 飲食店、カフェ、コンビニ |

## よくあるトラブル

### メモリ不足エラー

大きなエリアでは計算に大量のメモリが必要です：

```bash
# 最大距離を短くする
python scripts/phase2_compute_wi.py \
    --area shinagawa \
    --profile residential_family \
    --max-distance 500  # 1000m → 500m
```

### ネットワークが読み込めない

Phase 1でネットワークダウンロードをスキップした場合：

```bash
# Phase 1を再実行（--skip-networkを外す）
python scripts/phase1_download_data.py \
    --area "品川区, 東京都, 日本" \
    --profile residential_family
```

### アメニティが少ない

OSMデータの品質に依存します。国土数値情報で補完するか、データが充実しているエリアを選択してください。

## パフォーマンス目安

| エリアサイズ | グリッド数 | 計算時間（目安） | メモリ使用量 |
|------------|----------|--------------|------------|
| 1km² | 400セル | 1-2分 | 500MB |
| 10km² （1区程度） | 4,000セル | 10-20分 | 2GB |
| 100km²（23区全体） | 40,000セル | 2-4時間 | 8GB+ |

**推奨環境:**
- CPU: 4コア以上
- RAM: 8GB以上
- SSD推奨

## 次のステップ

### 複数エリアの比較

```bash
# 品川区
python scripts/phase2_compute_wi.py --area shinagawa --profile residential_family

# 渋谷区
python scripts/phase1_download_data.py --area "渋谷区, 東京都, 日本" --profile residential_family
python scripts/phase2_compute_wi.py --area shibuya --profile residential_family

# 比較分析
python -c "
import geopandas as gpd
wi_shinagawa = gpd.read_file('data/processed/wi_shinagawa_residential_family.geojson')
wi_shibuya = gpd.read_file('data/processed/wi_shibuya_residential_family.geojson')

print(f'品川区平均WI: {wi_shinagawa[\"wi_score\"].mean():.2f}')
print(f'渋谷区平均WI: {wi_shibuya[\"wi_score\"].mean():.2f}')
"
```

### カスタムプロファイル作成

`config/profiles.yaml`を編集して独自のプロファイルを追加できます：

```yaml
my_custom_profile:
  name: "自分専用プロファイル"
  amenities:
    supermarket:
      weight: 0.30  # 重みを調整
      ideal_distance: 300
      max_distance: 800
    # ... 他のアメニティ
```

### API・Web可視化（Phase 5）

今後実装予定：
- FastAPI でRESTful API
- React + Mapbox でインタラクティブマップ
- リアルタイムWI照会

## 技術サポート

- Issue: https://github.com/ishikawa3/wi/issues
- ドキュメント: `docs/` ディレクトリ
- 論文: CSIS Discussion Paper No.163
