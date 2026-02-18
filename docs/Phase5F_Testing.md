# Phase 5F: 地点クリック・詳細表示 - 動作確認手順

## 実装内容

Phase 5F では、地図上の任意の地点をクリックして、最寄りグリッドセルの詳細 WI 情報を取得・表示する機能を実装しました。

### 実装された機能

#### 1. **地図クリックイベント処理** ✅

- MapClickHandler コンポーネント（react-leaflet の useMapEvents 使用）
- クリック位置の座標取得（緯度・経度）
- クリック位置にマーカー表示（赤色の円形マーカー）

#### 2. **Point Query API 統合** ✅

- fetchWIPoint エンドポイント関数
- React Query による自動データフェッチ
- ローディング状態管理

#### 3. **詳細情報パネル** ✅

左サイドバーに「地点詳細」セクションを追加：

- **WI スコア**: 大きく中央表示（36px）
- **グリッドID**: モノスペースフォントで表示
- **クリック位置座標**: 緯度・経度（小数点6桁）
- **アメニティ別スコア**: プログレスバー付き、スコア順ソート
- **閉じるボタン**: 詳細パネルを閉じる

#### 4. **ローディング状態表示** ✅

- Point Query 実行中: "最寄りグリッド検索中..." メッセージ
- スムーズなフェッチ（< 200ms）

#### 5. **クリック位置マーカー** ✅

- 赤色の円形マーカー（白枠、影付き）
- クリック位置を視覚的に表示

## 動作確認手順

### 前提条件

両サーバーが起動していること：

```bash
# バックエンド（ターミナル1）
cd /Users/ishikawa/Dev/wi/backend
source venv/bin/activate
uvicorn src.wi.api.main:app --reload --port 8000

# フロントエンド（ターミナル2）
cd /Users/ishikawa/Dev/wi/frontend
npm run dev
```

### 基本動作テスト

1. **ブラウザで http://localhost:5173 を開く**

2. **エリアとプロファイルを選択**
   - エリア: "test"
   - プロファイル: 任意（例: "residential_family"）
   - ヒートマップが表示される

3. **地図上の任意の地点をクリック**（グリッドセル以外の場所でも可）
   - クリック位置に赤色マーカーが表示される
   - 左サイドバーに「最寄りグリッド検索中...」と表示される
   - 0.2秒程度で「地点詳細」パネルが表示される

4. **地点詳細パネルの内容を確認**
   - **WI スコア**: 中央に大きく表示（例: "76.8"）
   - **グリッドID**: 例: "test_00001_00000"
   - **クリック位置**: 緯度・経度（例: "35.681000, 139.767000"）
   - **アメニティ別スコア**:
     - park: 88%
     - kindergarten: 80%
     - supermarket: 79%
     - school: 76%
     - clinic: 65%
   - スコアの高い順に表示される
   - 各アメニティに青色のプログレスバー

5. **複数の地点をクリック**
   - 別の地点をクリック
   - マーカーが新しい位置に移動
   - 「地点詳細」パネルが更新される
   - React Query のキャッシュが機能する（同じ地点を再クリック時は即座に表示）

6. **「閉じる」ボタンをクリック**
   - 「地点詳細」パネルが閉じる
   - マーカーが消える
   - 統計情報パネルが再表示される

### セルクリック vs 空白地点クリックの違い

#### セルをクリックした場合:

- セルのポップアップが表示される
- そのセルの WI 情報が表示される
- Point Query API は**呼ばれない**（セル自体の情報を使用）

#### 空白地点（グリッド外）をクリックした場合:

- 赤色マーカーが表示される
- Point Query API が呼ばれる
- 最寄りグリッドセルの情報が「地点詳細」パネルに表示される

## API テスト

### バックエンドAPI直接テスト

```bash
# 東京駅周辺の地点をクエリ
curl "http://localhost:8000/api/v1/wi/point?lat=35.681&lon=139.767&area=test&profile=residential_family" | jq

# レスポンス例
{
  "lat": 35.681,
  "lon": 139.767,
  "grid_id": "test_00001_00000",
  "wi_score": 76.8465278653939,
  "amenity_scores": {
    "supermarket": 0.7886000775926028,
    "kindergarten": 0.8047375127613318,
    "school": 0.7553219307715869,
    "park": 0.8804673374251476,
    "clinic": 0.651201020936083
  },
  "profile": "residential_family",
  "area": "test"
}
```

### フロントエンドプロキシ経由テスト

```bash
# Vite プロキシ経由で同じリクエスト
curl "http://localhost:5173/api/v1/wi/point?lat=35.682&lon=139.768&area=test&profile=residential_family" | jq '.wi_score'

# レスポンス例
67.26308421684078
```

## パフォーマンス

### レスポンス時間

- **Point Query API**: < 200ms
- **UI更新**: ほぼ即座（React Query キャッシュ使用時）
- **マーカー表示**: 即座

### キャッシング

React Query による自動キャッシング：

- 同じ地点のクエリ: キャッシュから即座に返却
- キャッシュ有効期限: 5分間
- エリア・プロファイル変更時: キャッシュクリア

## 実装詳細

### コンポーネント構成

```
App.jsx
├── handleMapClick()           // 地図クリックハンドラ
├── pointQueryParams state     // Point Query パラメータ
├── pointQueryResult state     // Point Query 結果
├── useQuery (pointData)       // Point Query API フェッチ
└── SidebarSection (地点詳細)  // 詳細情報パネル

MapView.jsx
├── MapClickHandler            // クリックイベントハンドラ
├── clickedLocation state      // クリック位置
├── clickedIcon               // マーカーアイコン
└── Marker                    // クリック位置マーカー

endpoints.js
└── fetchWIPoint()            // Point Query API 呼び出し
```

### データフロー

1. ユーザーが地図をクリック
2. MapClickHandler が座標を取得
3. handleMapClick が呼ばれる
4. pointQueryParams state が更新される
5. React Query が自動的に fetchWIPoint を実行
6. Point Query API (backend) が最寄りグリッドを検索
7. 結果が返却される
8. pointQueryResult state が更新される
9. 「地点詳細」パネルが表示される
10. クリック位置にマーカーが表示される

## トラブルシューティング

### 地図をクリックしても何も起こらない

**原因**: エリア・プロファイルが選択されていない

**解決策**:

- エリアとプロファイルを選択
- アラート "エリアとプロファイルを選択してください" が表示される

### マーカーが表示されない

**原因**: Leaflet のインポートエラー

**確認**:

```javascript
// MapView.jsx の先頭
import L from "leaflet";
import { Marker } from "react-leaflet";
```

**解決策**:

```bash
cd frontend
npm install leaflet react-leaflet
```

### Point Query が遅い

**原因**: データファイルが大きすぎる、または距離計算が遅い

**確認**:

- バックエンドログで処理時間を確認
- データファイルサイズを確認（`ls -lh data/processed/wi_test_*.parquet`）

**最適化**:

- Parquet ファイルを圧縮
- 空間インデックス（R-tree）を使用
- グリッドサイズを調整

### 「地点詳細」パネルが更新されない

**原因**: React Query キャッシュの問題

**解決策**:

1. ブラウザをリフレッシュ（Ctrl/Cmd + R）
2. React DevTools でクエリキャッシュを確認
3. pointQueryParams が正しく更新されているか確認

## 次のステップ

Phase 5F が完了しました。次は **Phase 5G: 最適化・ポリッシュ** に進みます：

1. **bboxフィルタリング実装**: 表示範囲のみ読み込み
2. **エラーバウンダリ追加**: エラー時の graceful degradation
3. **レスポンシブデザイン**: モバイル対応
4. **ローディング・スケルトンUI**: より良いUX
5. **Docker Compose セットアップ**: 本番環境対応
6. **E2Eテスト**: Playwright によるテスト

または、実際のデータ（品川区など）を使用してテストすることも可能です：

```bash
# Phase 2 を実行して実際のWIデータを生成
cd /Users/ishikawa/Dev/wi
python scripts/phase2_compute_wi.py --area shinagawa --profile residential_family
```
