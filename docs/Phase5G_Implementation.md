# Phase 5G: 最適化・ポリッシュ - 実装内容

## 概要

Phase 5G では、アプリケーションの品質向上、パフォーマンス最適化、本番環境対応を実装しました。

## 実装された機能

### 1. **エラーバウンダリ** ✅

React アプリケーション全体をエラーバウンダリで保護し、予期しないエラーが発生した場合でも、ユーザーフレンドリーなエラー画面を表示します。

**ファイル:**

- `frontend/src/components/ErrorBoundary.jsx` - エラーバウンダリコンポーネント
- `frontend/src/main.jsx` - ErrorBoundary でアプリをラップ

**機能:**

- エラーメッセージの表示
- エラー詳細の展開表示（開発者向け）
- "ページをリロード" ボタン
- コンソールへのエラーログ出力

**使用例:**

```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

### 2. **ローディングスケルトンUI** ✅

データ読み込み中に表示するスケルトンローダーを実装し、より良いユーザーエクスペリエンスを提供します。

**ファイル:**

- `frontend/src/components/Skeleton.jsx` - スケルトンコンポーネント

**コンポーネント:**

- `SkeletonSidebarSection` - サイドバー用スケルトン
- `SkeletonMapView` - マップ用スケルトン（スピナー付き）

**特徴:**

- Pulse アニメーション
- Spin アニメーション（マップ用）
- アニメーション遅延（ステージング効果）

**使用例:**

```jsx
{
  isLoading ? <SkeletonSidebarSection /> : <ActualContent />;
}
```

---

### 3. **レスポンシブデザイン** ✅

モバイルデバイスやタブレットでも快適に使用できるよう、レスポンシブデザインを実装しました。

**ファイル:**

- `frontend/src/styles/index.css` - レスポンシブCSS

**ブレークポイント:**

#### タブレット（768px以下）

- サイドバー幅: 100%
- サイドバー高さ: 40vh（最大）
- マップ高さ: 60vh
- レイアウト: 縦積み（column）
- フォントサイズ調整

#### スマートフォン（480px以下）

- サイドバー高さ: 35vh（最大）
- マップ高さ: 65vh
- さらに小さいフォントサイズ

**その他の改善:**

- カスタムスクロールバー
- フォーカスインジケータ（アクセシビリティ）
- プリントスタイル（印刷時は地図のみ）
- フェードインアニメーション

---

### 4. **Docker Compose セットアップ** ✅

本番環境やローカル開発環境でのデプロイを簡単にする Docker Compose 設定を追加しました。

**ファイル:**

- `docker-compose.yml` - サービス定義
- `backend/Dockerfile` - バックエンドコンテナ
- `frontend/Dockerfile` - フロントエンドコンテナ（マルチステージビルド）
- `frontend/nginx.conf` - Nginx 設定
- `backend/.dockerignore` - Docker ビルドから除外するファイル
- `frontend/.dockerignore` - Docker ビルドから除外するファイル

**サービス構成:**

```yaml
services:
  backend: # FastAPI (ポート 8000)
  frontend: # Nginx + React (ポート 80)
```

**特徴:**

- **マルチステージビルド** (フロントエンド): ビルドステージと実行ステージを分離
- **ヘルスチェック**: 各サービスの健全性監視
- **ボリュームマウント**: データディレクトリを read-only でマウント
- **ネットワーク**: サービス間通信用のカスタムネットワーク
- **Nginx リバースプロキシ**: `/api` をバックエンドにプロキシ

---

## 使用方法

### エラーバウンダリ

アプリケーション起動時に自動的に有効化されます。エラーが発生すると、以下の画面が表示されます：

```
⚠️
エラーが発生しました

アプリケーションで予期しないエラーが発生しました。
ページをリロードして再試行してください。

[エラー詳細] （展開可能）
[ページをリロード]
```

### ローディングスケルトン

データ読み込み中に自動的に表示されます：

```jsx
{
  wiDataLoading && <SkeletonMapView />;
}
```

### レスポンシブデザイン

ブラウザウィンドウをリサイズすると、自動的にレイアウトが調整されます。

**テスト方法:**

1. ブラウザの開発者ツールを開く (F12)
2. デバイスツールバーを有効化 (Ctrl+Shift+M または Cmd+Shift+M)
3. 各種デバイスサイズでテスト

### Docker Compose

#### ビルドと起動:

```bash
# プロジェクトルートで実行
cd /Users/ishikawa/Dev/wi

# ビルドして起動
docker-compose up --build

# バックグラウンドで起動
docker-compose up -d

# ログ確認
docker-compose logs -f

# 停止
docker-compose down

# 停止してボリュームも削除
docker-compose down -v
```

#### アクセス:

- **フロントエンド**: http://localhost
- **バックエンドAPI**: http://localhost:8000/api/v1
- **API ドキュメント**: http://localhost:8000/docs

#### ヘルスチェック:

```bash
# バックエンドヘルスチェック
curl http://localhost:8000/api/v1/health

# フロントエンドヘルスチェック
curl http://localhost/health
```

---

## パフォーマンス最適化

### フロントエンド

1. **マルチステージビルド**: 本番イメージサイズを最小化
2. **Gzip圧縮**: 静的ファイルを圧縮して転送量削減
3. **キャッシュ制御**:
   - 静的アセット: 1年キャッシュ
   - HTML: キャッシュなし
4. **React Query キャッシング**: API レスポンスを5分間キャッシュ

### バックエンド

1. **LRU キャッシュ**: データファイルを最大5個キャッシュ
2. **ヘルスチェック**: サービス健全性監視
3. **Read-only データマウント**: データの不正変更を防止

---

## セキュリティ

### Nginx セキュリティヘッダー

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### CORS 設定（バックエンド）

本番環境では、適切なオリジンのみを許可：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://frontend",  # Docker 内部通信
        "http://localhost",
        # 本番ドメインを追加
    ],
    ...
)
```

---

## トラブルシューティング

### Docker ビルドエラー

**問題**: Dockerfile のビルドが失敗する

**解決策:**

```bash
# キャッシュなしでビルド
docker-compose build --no-cache

# 古いイメージを削除
docker system prune -a
```

### ポートが使用中

**問題**: `bind: address already in use`

**解決策:**

```bash
# 使用中のポートを確認
lsof -i :80
lsof -i :8000

# プロセスを停止
kill <PID>

# または docker-compose.yml でポートを変更
ports:
  - "8080:80"  # ホストポート:コンテナポート
```

### データファイルが見つからない

**問題**: `FileNotFoundError: WI data not found`

**解決策:**

```bash
# データディレクトリの確認
ls -la data/processed/

# データが存在しない場合、Phase 2 を実行して生成
python scripts/phase2_compute_wi.py --area shinagawa --profile residential_family

# Docker Compose でデータディレクトリをマウント
volumes:
  - ./data:/app/data:ro
```

### フロントエンドから API に接続できない

**問題**: `Network Error` または `CORS Error`

**確認:**

1. バックエンドが起動しているか: `docker-compose ps`
2. ヘルスチェックが成功しているか: `curl http://localhost:8000/api/v1/health`
3. Nginx のプロキシ設定が正しいか: `frontend/nginx.conf` を確認

**解決策:**

```bash
# ログを確認
docker-compose logs backend
docker-compose logs frontend

# サービスを再起動
docker-compose restart backend frontend
```

---

## 本番環境へのデプロイ

### 環境変数の設定

本番環境では、以下の環境変数を設定してください：

```bash
# .env ファイルを作成
cat > .env << EOF
# Backend
DATA_DIR=/app/data/processed
CONFIG_DIR=/app/config
PYTHONUNBUFFERED=1

# Frontend
VITE_API_URL=https://your-api-domain.com
EOF

# docker-compose.yml で使用
docker-compose --env-file .env up
```

### SSL/TLS 設定

本番環境では、HTTPS を設定してください：

```nginx
# nginx.conf に追加
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;

    # ... 既存の設定 ...
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### スケーリング

複数のバックエンドインスタンスを起動：

```bash
docker-compose up --scale backend=3
```

ロードバランサー（Nginx）を追加：

```nginx
upstream backend_servers {
    server backend:8000;
    # 追加のサーバー
}

location /api {
    proxy_pass http://backend_servers;
}
```

---

## 次のステップ

Phase 5G が完了しました。さらなる改善として：

1. **E2Eテスト**: Playwright によるエンドツーエンドテスト
2. **CI/CD パイプライン**: GitHub Actions による自動テスト・デプロイ
3. **監視・ロギング**: Prometheus + Grafana によるモニタリング
4. **ドキュメント**: OpenAPI スキーマの拡充
5. **パフォーマンステスト**: 大規模データでの負荷テスト

または、実データ（品川区など）を使用した実証テストに進むことができます。
