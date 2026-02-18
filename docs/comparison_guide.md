# 複数エリア・プロファイル比較ガイド

## 1. 複数エリアの比較

### ステップ1: 各エリアのデータ取得

```bash
# 品川区
python scripts/phase1_download_data.py \
    --area "品川区, 東京都, 日本" \
    --profile residential_family

python scripts/phase2_compute_wi.py \
    --area shinagawa \
    --profile residential_family

# 渋谷区
python scripts/phase1_download_data.py \
    --area "渋谷区, 東京都, 日本" \
    --profile residential_family

python scripts/phase2_compute_wi.py \
    --area shibuya \
    --profile residential_family

# 目黒区
python scripts/phase1_download_data.py \
    --area "目黒区, 東京都, 日本" \
    --profile residential_family

python scripts/phase2_compute_wi.py \
    --area meguro \
    --profile residential_family
```

### ステップ2: 比較分析の実行

```bash
python scripts/compare_areas.py \
    --areas shinagawa shibuya meguro \
    --profile residential_family \
    --output comparison_results
```

### 出力結果

`comparison_results/`ディレクトリに以下が生成されます：

1. **`area_comparison_residential_family.csv`**
   - 統計サマリー（平均、標準偏差、最小値、最大値等）

2. **`area_histogram_residential_family.png`**
   - WIスコア分布のヒストグラム重ね合わせ

3. **`area_boxplot_residential_family.png`**
   - 箱ひげ図による比較

4. **`area_barplot_residential_family.png`**
   - 平均・最大値の棒グラフ

### 結果の解釈

#### CSVファイル例

```csv
Area,Cells,Mean WI,Std WI,Min WI,Max WI,Median WI
shinagawa,3245,67.3,18.2,12.4,94.1,69.5
shibuya,2892,72.1,15.6,18.7,96.3,74.2
meguro,3567,65.8,17.9,10.2,91.8,67.1
```

**読み方:**
- **Mean WI**: 渋谷区が最も高い（72.1）
- **Std WI**: 渋谷区のばらつきが最も小さい（15.6）
- **Max WI**: 渋谷区の最高スコアエリアが最も高い（96.3）

**結論例:**
> 渋谷区は全体的にWalkabilityが高く、エリア内のばらつきも小さい。品川区と目黒区は平均的には近いが、品川区の方が高スコアエリアがやや多い。

## 2. 同一エリアでのプロファイル比較

### ステップ1: 複数プロファイルでWI計算

```bash
# 品川区で3つのプロファイルを計算

# ファミリー向け
python scripts/phase2_compute_wi.py \
    --area shinagawa \
    --profile residential_family

# 高齢者向け
python scripts/phase2_compute_wi.py \
    --area shinagawa \
    --profile residential_elderly

# オフィス向け
python scripts/phase2_compute_wi.py \
    --area shinagawa \
    --profile office
```

### ステップ2: プロファイル比較

```bash
python scripts/compare_areas.py \
    --area shinagawa \
    --profiles residential_family residential_elderly office \
    --output comparison_results
```

### 出力結果

1. **`profile_comparison_shinagawa.csv`**
   - プロファイル別統計

2. **`profile_histogram_shinagawa.png`**
   - プロファイル別WI分布

3. **`profile_scatter_shinagawa.png`** (2プロファイルの場合のみ)
   - 相関散布図

### 結果例

```csv
Profile,Mean WI,Std WI,Min WI,Max WI,Median WI
residential_family,67.3,18.2,12.4,94.1,69.5
residential_elderly,62.1,20.1,8.3,89.7,64.2
office,71.8,16.4,15.2,95.6,73.1
```

**解釈:**
- オフィス向けが最も高スコア（飲食店・カフェが集中）
- 高齢者向けが最も低い（医療施設が分散）
- ファミリー向けは中間（保育園の分布に依存）

## 3. Python スクリプトでの高度な分析

### カスタム分析例

```python
# custom_analysis.py
import geopandas as gpd
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# データ読み込み
shinagawa_family = gpd.read_parquet('data/processed/wi_shinagawa_residential_family.parquet')
shibuya_family = gpd.read_parquet('data/processed/wi_shibuya_residential_family.parquet')

# 1. 高スコアエリアの割合
def high_score_percentage(gdf, threshold=80):
    return (gdf['wi_score'] >= threshold).sum() / len(gdf) * 100

print(f"品川区: {high_score_percentage(shinagawa_family):.1f}% が WI≥80")
print(f"渋谷区: {high_score_percentage(shibuya_family):.1f}% が WI≥80")

# 2. 分位点比較
for q in [0.25, 0.50, 0.75, 0.90]:
    s_val = shinagawa_family['wi_score'].quantile(q)
    sb_val = shibuya_family['wi_score'].quantile(q)
    print(f"{int(q*100)}%点: 品川={s_val:.1f}, 渋谷={sb_val:.1f}")

# 3. アメニティ別スコア比較
amenity_types = ['score_supermarket', 'score_pharmacy', 'score_park']

fig, axes = plt.subplots(1, 3, figsize=(15, 5))

for i, amenity in enumerate(amenity_types):
    if amenity in shinagawa_family.columns:
        axes[i].hist(shinagawa_family[amenity], bins=30, alpha=0.5, label='品川区')
        axes[i].hist(shibuya_family[amenity], bins=30, alpha=0.5, label='渋谷区')
        axes[i].set_title(amenity.replace('score_', ''))
        axes[i].legend()

plt.tight_layout()
plt.savefig('amenity_comparison.png', dpi=300)
```

### 空間的な比較

```python
# 高スコアエリアを抽出して比較
shinagawa_high = shinagawa_family[shinagawa_family['wi_score'] >= 80]
shibuya_high = shibuya_family[shibuya_family['wi_score'] >= 80]

# 統計
print(f"品川区 高スコアエリア: {len(shinagawa_high)} セル")
print(f"  平均WI: {shinagawa_high['wi_score'].mean():.2f}")

print(f"渋谷区 高スコアエリア: {len(shibuya_high)} セル")
print(f"  平均WI: {shibuya_high['wi_score'].mean():.2f}")

# 高スコアエリアを地図で可視化（GeoJSON出力）
shinagawa_high.to_file('high_wi_shinagawa.geojson', driver='GeoJSON')
shibuya_high.to_file('high_wi_shibuya.geojson', driver='GeoJSON')
```

## 4. QGISでの並列比較

### 方法1: 複数レイヤーの重ね合わせ

1. QGISで両方のGeoJSONを読み込み
2. レイヤーパネルで順序を調整
3. 各レイヤーの透明度を50%に設定
4. 重なった部分で比較

### 方法2: レイアウトで並べて表示

1. `プロジェクト` → `新規レイアウト`
2. 2つの地図フレームを作成:
   - 左: 品川区
   - 右: 渋谷区
3. 同じカラーランプ・範囲（0-100）を使用
4. 凡例とタイトルを追加
5. PDF出力

## 5. 統計的検定（上級）

### 平均値の差の検定

```python
from scipy import stats

shinagawa_scores = shinagawa_family['wi_score'].values
shibuya_scores = shibuya_family['wi_score'].values

# t検定
t_stat, p_value = stats.ttest_ind(shinagawa_scores, shibuya_scores)

print(f"t統計量: {t_stat:.3f}")
print(f"p値: {p_value:.4f}")

if p_value < 0.05:
    print("有意差あり（5%水準）")
else:
    print("有意差なし")
```

### 分布の比較（Kolmogorov-Smirnov検定）

```python
ks_stat, ks_p = stats.ks_2samp(shinagawa_scores, shibuya_scores)

print(f"KS統計量: {ks_stat:.3f}")
print(f"p値: {ks_p:.4f}")
```

## 6. 時系列比較（将来対応）

データを定期的に更新している場合：

```python
# 2026年と2027年のデータ比較
wi_2026 = gpd.read_parquet('data/wi_shinagawa_2026.parquet')
wi_2027 = gpd.read_parquet('data/wi_shinagawa_2027.parquet')

# grid_idでマージ
merged = wi_2026[['grid_id', 'wi_score']].merge(
    wi_2027[['grid_id', 'wi_score']],
    on='grid_id',
    suffixes=('_2026', '_2027')
)

# 変化量
merged['wi_change'] = merged['wi_score_2027'] - merged['wi_score_2026']

# 改善・悪化エリアの特定
improving = merged[merged['wi_change'] > 5]
declining = merged[merged['wi_change'] < -5]

print(f"改善エリア: {len(improving)} セル")
print(f"悪化エリア: {len(declining)} セル")
```

## 7. レポート作成例

### Markdown レポート自動生成

```python
# generate_report.py
import geopandas as gpd
import pandas as pd
from datetime import datetime

areas = ['shinagawa', 'shibuya', 'meguro']
profile = 'residential_family'

# データ読み込み
data = {}
for area in areas:
    gdf = gpd.read_parquet(f'data/processed/wi_{area}_{profile}.parquet')
    data[area] = gdf

# レポート生成
report = f"""# Walkability Index 比較レポート

**生成日時**: {datetime.now().strftime('%Y-%m-%d %H:%M')}
**プロファイル**: {profile}
**対象エリア**: {', '.join(areas)}

## サマリー

| エリア | 平均WI  | 標準偏差 | 最小値 | 最大値 |
|--------|---------|----------|--------|--------|
"""

for area, gdf in data.items():
    mean = gdf['wi_score'].mean()
    std = gdf['wi_score'].std()
    min_wi = gdf['wi_score'].min()
    max_wi = gdf['wi_score'].max()

    report += f"| {area} | {mean:.1f} | {std:.1f} | {min_wi:.1f} | {max_wi:.1f} |\n"

report += """
## 分析結果

### 総合評価

"""

# 平均WIでソート
sorted_areas = sorted(data.items(), key=lambda x: x[1]['wi_score'].mean(), reverse=True)

report += f"1位: **{sorted_areas[0][0]}** (平均WI: {sorted_areas[0][1]['wi_score'].mean():.1f})\n\n"
report += f"詳細分析は添付の図表を参照してください。\n"

# 保存
with open('wi_comparison_report.md', 'w', encoding='utf-8') as f:
    f.write(report)

print("レポート生成完了: wi_comparison_report.md")
```

## まとめ

複数エリア・プロファイルの比較により：

✅ **エリアの特性**を定量的に把握
✅ **プロファイル間の違い**を明確化
✅ **データに基づく意思決定**が可能

次のステップ:
- Web可視化（FastAPI + React）
- ダッシュボード作成
- API経由でのリアルタイム比較
