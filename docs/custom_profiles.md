# カスタムプロファイル作成ガイド

独自のニーズに合わせてWalkability Indexのプロファイルをカスタマイズできます。

## 基本概念

プロファイルは以下の要素で構成されます：

1. **アメニティタイプ** - 評価対象の施設種別
2. **重み (weight)** - 各アメニティの重要度（合計1.0）
3. **理想距離 (ideal_distance)** - この距離以内なら満点
4. **最大距離 (max_distance)** - この距離を超えると0点

## 手順1: プロファイルファイルの編集

`config/profiles.yaml`を編集します。

### 新規プロファイルの追加

既存のプロファイルをコピーして修正するのが簡単です：

```yaml
# config/profiles.yaml

profiles:
  # ... 既存のプロファイル ...

  # === カスタムプロファイル ===

  my_custom_profile:
    name: "私専用プロファイル"
    description: "自分のライフスタイルに合わせた設定"
    target_users: ["在宅ワーカー", "ペット飼育者"]

    amenities:
      # 重要: コンビニは頻繁に使う
      convenience:
        weight: 0.25          # 25%の重み
        ideal_distance: 150   # 150m以内が理想
        max_distance: 400     # 400m超は評価しない
        decay_type: "exponential"
        description: "コンビニエンスストア"

      # カフェ: リモートワークで重要
      cafe:
        weight: 0.20
        ideal_distance: 200
        max_distance: 600
        decay_type: "exponential"
        description: "カフェ（作業スペース）"

      # 公園: ペットの散歩
      park:
        weight: 0.20
        ideal_distance: 400
        max_distance: 1000
        decay_type: "exponential"
        description: "公園（ペット散歩）"

      # スーパー: 週末の買い物
      supermarket:
        weight: 0.15
        ideal_distance: 500
        max_distance: 1200
        decay_type: "exponential"
        description: "スーパーマーケット"

      # フィットネス: 健康維持
      fitness_centre:
        weight: 0.10
        ideal_distance: 600
        max_distance: 1500
        decay_type: "exponential"
        description: "フィットネスジム"

      # 飲食店: たまに外食
      restaurant:
        weight: 0.10
        ideal_distance: 400
        max_distance: 1000
        decay_type: "exponential"
        description: "飲食店"
```

### 重み付けのポイント

**重要度に応じて設定:**
```yaml
超重要: 0.20 - 0.30
重要:   0.10 - 0.20
やや重要: 0.05 - 0.10
```

**全体の合計を1.0に:**
```python
# 確認方法
0.25 + 0.20 + 0.20 + 0.15 + 0.10 + 0.10 = 1.00  ✓
```

### 距離パラメータの設定

**徒歩時間の目安:**
```
歩行速度: 80m/分（一般）

 150m = 徒歩 2分
 300m = 徒歩 4分
 500m = 徒歩 6分
 800m = 徒歩10分
1000m = 徒歩12分
1500m = 徒歩18分
```

**使用頻度に応じた設定:**
```yaml
毎日使う (コンビニ等):
  ideal_distance: 150-200
  max_distance: 400-500

週2-3回 (スーパー等):
  ideal_distance: 400-500
  max_distance: 1000-1200

週1回程度 (図書館等):
  ideal_distance: 600-800
  max_distance: 1500-2000
```

## 手順2: アメニティタイプの確認

利用可能なアメニティタイプは`config/amenities_osm.yaml`を参照：

```yaml
# 主要なアメニティタイプ
- supermarket        # スーパーマーケット
- convenience        # コンビニ
- pharmacy           # 薬局
- hospital           # 病院
- clinic             # 診療所
- kindergarten       # 保育園・幼稚園
- school             # 学校
- library            # 図書館
- park               # 公園
- playground         # 遊び場
- restaurant         # レストラン
- cafe               # カフェ
- fast_food          # ファストフード
- bar                # バー・居酒屋
- bank               # 銀行
- atm                # ATM
- post_office        # 郵便局
- cinema             # 映画館
- theatre            # 劇場
- arts_centre        # 美術館・アートセンター
- sports_centre      # スポーツセンター
- fitness_centre     # フィットネスジム
```

## 手順3: カスタムプロファイルのテスト

```bash
# カスタムプロファイルでWI計算
python scripts/phase2_compute_wi.py \
    --area shinagawa \
    --profile my_custom_profile \
    --max-distance 1500
```

## 実例: ユースケース別プロファイル

### 例1: 子育て共働き世帯

```yaml
working_parents:
  name: "共働き子育て世帯"
  amenities:
    kindergarten:
      weight: 0.30  # 最重要
      ideal_distance: 400
      max_distance: 800

    supermarket:
      weight: 0.20
      ideal_distance: 300
      max_distance: 800

    convenience:
      weight: 0.15
      ideal_distance: 200
      max_distance: 500

    clinic:
      weight: 0.15
      ideal_distance: 500
      max_distance: 1000

    park:
      weight: 0.10
      ideal_distance: 300
      max_distance: 800

    pharmacy:
      weight: 0.10
      ideal_distance: 400
      max_distance: 800
```

### 例2: 大学生・若年層

```yaml
student:
  name: "大学生・若年層"
  amenities:
    convenience:
      weight: 0.30  # コンビニ最重要
      ideal_distance: 100
      max_distance: 300

    fast_food:
      weight: 0.20
      ideal_distance: 200
      max_distance: 500

    cafe:
      weight: 0.15
      ideal_distance: 300
      max_distance: 600

    restaurant:
      weight: 0.15
      ideal_distance: 300
      max_distance: 700

    supermarket:
      weight: 0.10
      ideal_distance: 500
      max_distance: 1000

    bar:
      weight: 0.10
      ideal_distance: 400
      max_distance: 1000
```

### 例3: 健康志向・アクティブシニア

```yaml
active_senior:
  name: "アクティブシニア"
  amenities:
    hospital:
      weight: 0.25
      ideal_distance: 500
      max_distance: 1200

    pharmacy:
      weight: 0.20
      ideal_distance: 300
      max_distance: 600

    park:
      weight: 0.20  # 散歩・運動
      ideal_distance: 300
      max_distance: 800

    supermarket:
      weight: 0.15
      ideal_distance: 300
      max_distance: 700

    library:
      weight: 0.10
      ideal_distance: 600
      max_distance: 1500

    fitness_centre:
      weight: 0.10
      ideal_distance: 500
      max_distance: 1200
```

### 例4: リモートワーカー

```yaml
remote_worker:
  name: "リモートワーカー"
  amenities:
    cafe:
      weight: 0.30  # 作業場所
      ideal_distance: 200
      max_distance: 500

    convenience:
      weight: 0.20
      ideal_distance: 150
      max_distance: 400

    restaurant:
      weight: 0.15
      ideal_distance: 300
      max_distance: 700

    supermarket:
      weight: 0.15
      ideal_distance: 400
      max_distance: 1000

    park:
      weight: 0.10  # 気分転換
      ideal_distance: 400
      max_distance: 1000

    fitness_centre:
      weight: 0.10
      ideal_distance: 500
      max_distance: 1200
```

## 手順4: 減衰関数のカスタマイズ（上級）

デフォルトは指数減衰ですが、他の関数も選択可能：

```yaml
amenities:
  supermarket:
    weight: 0.20
    ideal_distance: 400
    max_distance: 1000
    decay_type: "exponential"  # または "gaussian", "linear"
```

### 減衰関数の比較

**指数減衰（exponential）** - デフォルト・推奨
- 距離が遠くなるほど急激に効用が低下
- 論文で使用されている手法

**ガウス減衰（gaussian）**
- より緩やかな減衰
- 中距離でも比較的高スコア

**線形減衰（linear）**
- 最もシンプル
- ideal_distance から max_distance まで比例的に減少

## 手順5: プロファイルの比較

複数のプロファイルを作成したら、比較して調整：

```bash
# カスタムプロファイルでWI計算
python scripts/phase2_compute_wi.py \
    --area shinagawa \
    --profile my_custom_profile

# 既存プロファイルと比較
python scripts/compare_areas.py \
    --area shinagawa \
    --profiles my_custom_profile residential_general
```

## トラブルシューティング

### エラー: "Profile 'XXX' not found"

- YAMLファイルのインデントを確認
- プロファイル名のスペルミスをチェック
- YAMLシンタックスエラーがないか確認

```bash
# YAML検証
python -c "import yaml; yaml.safe_load(open('config/profiles.yaml'))"
```

### 重みの合計が1.0にならない

```python
# 自動計算ツール
weights = {
    'convenience': 0.25,
    'cafe':        0.20,
    'park':        0.20,
    'supermarket': 0.15,
    'fitness':     0.10,
    'restaurant':  0.10,
}

total = sum(weights.values())
print(f"Total: {total}")  # 1.0であることを確認

# 正規化（合計が1.0でない場合）
normalized = {k: v/total for k, v in weights.items()}
```

### すべてのスコアが低い

- `max_distance`を長くする
- `ideal_distance`を調整する
- アメニティが実際に存在するか確認（OSMデータの品質）

## ベストプラクティス

1. **既存プロファイルをベースに**
   - ゼロから作るより修正する方が簡単

2. **少数の重要アメニティに注目**
   - 5-8個程度が管理しやすい
   - 多すぎると重みが分散

3. **実際の行動パターンを反映**
   - 毎日使うものは weight 大・distance 小
   - たまに使うものは weight 小・distance 大

4. **エリアの特性を consider**
   - 都心: 近距離重視（ideal_distance 短く）
   - 郊外: 長距離許容（max_distance 長く）

5. **反復テストと調整**
   - 実際に計算してみて調整
   - 知っているエリアで妥当性を確認

## 参考: 重み設定の考慮事項

**頻度ベース:**
```
毎日: 0.20-0.30
週3-4回: 0.15-0.20
週1-2回: 0.10-0.15
月数回: 0.05-0.10
```

**必要性ベース:**
```
生活必需: 0.20-0.30 (食料品、医療)
重要: 0.10-0.20 (教育、交通)
好ましい: 0.05-0.10 (娯楽、文化)
```

**世帯構成ベース:**
```
単身: 利便性重視 (コンビニ、飲食)
ファミリー: 子育て重視 (保育園、公園)
高齢者: 医療・福祉重視 (病院、薬局)
```
