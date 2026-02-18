# QGIS可視化ガイド - Walkability Indexヒートマップ

## 必要なもの

- QGIS 3.x（無料、オープンソース）
- 計算済みのWIデータ（`.geojson`ファイル）

## QGISのインストール

### macOS
```bash
brew install --cask qgis
```

または https://qgis.org/ja/site/forusers/download.html からダウンロード

## 手順1: データの読み込み

1. **QGISを起動**

2. **レイヤーを追加**
   - メニュー: `レイヤー` → `レイヤーを追加` → `ベクタレイヤを追加`
   - または、GeoJSONファイルを直接ドラッグ&ドロップ

3. **読み込むファイル**
   ```
   data/processed/wi_shinagawa_residential_family.geojson
   ```

## 手順2: ヒートマップスタイリング

### 基本設定

1. レイヤーを**右クリック** → `プロパティ`

2. **シンボロジー**タブを選択

3. スタイルを変更:
   - **単一シンボル** → **段階に分けられた**に変更

4. 設定項目:
   ```
   カラム: wi_score
   モード: 等間隔
   カラーランプ: Spectral（反転）または RdYlGn（緑→黄→赤）
   階級数: 10
   ```

5. **分類**ボタンをクリック

6. **適用** → **OK**

### 高度な設定（おすすめ）

#### カラーランプのカスタマイズ

1. カラーランプの横の▼をクリック → `カラーランプを作成` → `カタログ: cpt-city`

2. おすすめのカラーランプ:
   - **`td/DEM_screen`** - 青→緑→黄→赤（DEM風）
   - **`cb/div/RdYlGn_11`** - 赤→黄→緑（色覚多様性対応）
   - **`mpl/viridis`** - 紫→青→緑→黄（科学的可視化向け）

#### 透明度の調整

1. シンボロジー → **レイヤの描画方法**
2. `レイヤ全体の不透明度`: **70-80%** に設定
3. 背景地図と重ねる場合に有効

## 手順3: 背景地図の追加（オプション）

### OpenStreetMapを背景に

1. **ブラウザパネル** → **XYZ Tiles** → **OpenStreetMap**
2. ダブルクリックで追加

3. レイヤー順序を調整:
   ```
   [上] wi_shinagawa_residential_family (WIヒートマップ)
   [下] OpenStreetMap (背景地図)
   ```

### Google Satellite（衛星画像）を背景に

1. メニュー: `プラグイン` → `プラグインの管理とインストール`
2. `QuickMapServices`を検索してインストール
3. メニュー: `Web` → `QuickMapServices` → `Google` → `Google Satellite`

## 手順4: ラベル表示（WIスコア）

各グリッドにスコアを表示する場合:

1. レイヤープロパティ → **ラベル**タブ
2. **単一定義によるラベル**を選択
3. ラベル元: `wi_score`
4. **テキスト**タブ:
   - サイズ: 8pt
   - バッファ: 有効（白・1mm）
5. **描画**タブ:
   - ラベル元の値でラベルを表示: `wi_score > 0`（スコア0のセルは非表示）

## 手順5: 凡例の作成

### 凡例パネル

1. メニュー: `ビュー` → `パネル` → `レイヤースタイル`を有効化
2. 自動的に凡例が表示される

### レイアウトで凡例を含む地図を出力

1. メニュー: `プロジェクト` → `新規レイアウト`
2. **地図アイテムを追加**
   - ツール: `地図を追加`
   - 地図範囲をドラッグで配置
3. **凡例を追加**
   - ツール: `凡例を追加`
   - 凡例をドラッグで配置
4. **スケールバーを追加**
   - ツール: `スケールバーを追加`
5. **タイトルを追加**
   - ツール: `ラベルを追加`
   - 例: "Walkability Index - 品川区（ファミリー向け）"

6. **画像として出力**
   - メニュー: `レイアウト` → `画像としてエクスポート`
   - PNG（Web用）またはPDF（印刷用）を選択

## 使用例: 高スコアエリアの特定

### フィルタリング

1. レイヤーを右クリック → `属性テーブルを開く`
2. ツールバー: **選択機能** → **式による地物選択**
3. 式を入力:
   ```
   "wi_score" >= 80
   ```
4. **地物を選択**

5. 選択されたエリアが黄色でハイライト表示される

### 高スコアエリアを別レイヤーとして保存

1. 選択状態で、レイヤーを右クリック
2. `エクスポート` → `地物を別名で保存`
3. ファイル名: `high_wi_areas.geojson`
4. `選択された地物のみ保存する`にチェック

## 複数プロファイルの比較表示

### サイドバイサイド表示

1. メニュー: `ビュー` → `新しい地図ビュー`
2. 元のビューと新しいビューを並べて表示
3. それぞれで異なるプロファイルを表示

### 差分マップ

QGISコンソールで計算:

1. メニュー: `プラグイン` → `Pythonコンソール`
2. 以下を実行:

```python
from qgis.core import QgsVectorLayer, QgsProject

# 2つのレイヤーを読み込み
family = QgsVectorLayer('data/processed/wi_shinagawa_residential_family.geojson', 'family', 'ogr')
elderly = QgsVectorLayer('data/processed/wi_shinagawa_residential_elderly.geojson', 'elderly', 'ogr')

# レイヤーを追加
QgsProject.instance().addMapLayer(family)
QgsProject.instance().addMapLayer(elderly)

# Processing ツールで空間結合
# レイヤー → "ジオメトリによる属性の結合"
# family (target) + elderly (join) → wi_score の差分を計算
```

または、PythonスクリプトでGeoDataFrameの差分を計算してから読み込む方が簡単です。

## ヒートマップ（点密度）スタイル

グリッドではなく、アメニティの位置をヒートマップで表示する場合:

1. アメニティGeoJSON（`amenities_*.geojson`）を読み込み
2. シンボロジー → **ヒートマップ**を選択
3. 設定:
   - 半径: 100m
   - カラーランプ: YlOrRd
   - 最大値: 自動

これでアメニティ集積度が視覚化されます。

## エクスポート設定（推奨）

### Web公開用PNG

- 解像度: 150 dpi
- 幅: 1920px
- 抗エリアス: 有効
- 背景: 透明または白

### 印刷用PDF

- 解像度: 300 dpi
- ラスタライゼーション: 無効（ベクターのまま）
- PDF/A互換: 有効

## トラブルシューティング

### グリッドが表示されない

- CRS（座標系）を確認: EPSG:4326 (WGS84) であることを確認
- プロジェクトのCRSを同じにする: 右下のCRS表示 → EPSG:4326を選択

### スコアが0ばかり

- 距離計算が正しく行われていない可能性
- Phase 2を再実行: `--max-distance 1000`を確認

### レイヤーが重い

- GeoJSONではなくParquet形式を使用（QGISはParquetも読める）
- または、グリッドを間引く（100mメッシュに変更）

## 参考リンク

- QGIS公式マニュアル: https://docs.qgis.org/
- QGISチュートリアル: https://www.qgistutorials.com/ja/
- カラーランプギャラリー: http://soliton.vm.bytemark.co.uk/pub/cpt-city/
