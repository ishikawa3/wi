# セットアップガイド

## 環境要件

- Python 3.9以上
- 約10GB の空きディスクスペース（データ保存用）
- インターネット接続（OSMデータダウンロード用）

## インストール手順

### 1. リポジトリのクローン

```bash
cd /Users/ishikawa/Dev/wi
```

### 2. 仮想環境の作成

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows
```

### 3. パッケージのインストール

```bash
# 本体パッケージ
pip install -r requirements.txt

# 開発用ツール（オプション）
pip install -r requirements-dev.txt
```

### 4. 動作確認

```bash
python scripts/test_setup.py
```

すべてのテストがPASSすればセットアップ完了です。

## 使い方

### Phase 1: データダウンロード

```bash
python scripts/phase1_download_data.py \
    --area "品川区, 東京都, 日本" \
    --profile residential_family
```

**オプション:**
- `--area`: 対象エリア（OSMの地名形式）
- `--profile`: プロファイル名
  - `residential_general`: 一般居住者
  - `residential_family`: ファミリー
  - `residential_single`: 単身
  - `residential_elderly`: 高齢者
  - `office`: オフィス
- `--output-dir`: 出力先ディレクトリ
- `--skip-network`: ネットワークダウンロードをスキップ

### データ確認

ダウンロードしたデータは `data/processed/` に保存されます：

```bash
ls -lh data/processed/
# amenities_residential_family.geojson
# osm_amenities_residential_family.geojson
# kokudo_amenities_residential_family.geojson (if available)
# walking_network.graphml
```

GeoJSONファイルはQGISなどのGISソフトで確認できます。

### 次のステップ

データダウンロードが完了したら：

1. データ品質を確認
2. Phase 0: ヘドニック分析（重み推定）を実施
3. Phase 2: WI計算を実行

## トラブルシューティング

### OSMnxのインストールエラー

```bash
# rtreeが必要な場合
brew install spatialindex  # macOS
sudo apt-get install libspatialindex-dev  # Linux

pip install rtree
```

### 国土数値情報のダウンロード

現時点ではAPIが未実装のため、手動ダウンロードが必要：

1. https://nlftp.mlit.go.jp/ksj/ にアクセス
2. 必要なデータセット（P04, P05, P12, P13, P29）をダウンロード
3. Shapefileを解凍
4. `KokudoDataLoader.download_from_file()` で読み込み

### メモリ不足

大きなエリア（23区全体など）ではメモリ不足が発生する可能性があります：

- 区単位で分割処理
- `--skip-network` オプションでネットワークダウンロードをスキップ
- より多くのメモリを搭載したマシンを使用

## よくある質問

**Q: どのエリアがサポートされていますか？**

A: OpenStreetMapでカバーされている全世界のエリアが対象です。ただし、日本国内（特に東京都）で最も高品質なデータが得られます。

**Q: データの更新頻度は？**

A: OSMデータはリアルタイムで最新版が取得されます。国土数値情報は年1回程度の更新です。

**Q: 商用利用は可能ですか？**

A: OSMデータはODbL、国土数値情報は政府標準利用規約に従います。詳細は各データ提供元のライセンスを確認してください。

