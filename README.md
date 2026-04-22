# 🧳 Smart Pack

> 旅行の持ち物を賢く管理。天気予報と連動した自動パッキングリスト生成アプリ

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Ruby on Rails](https://img.shields.io/badge/Rails-7.1-CC0000?logo=rubyonrails&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white)

---

## 📸 デモ

<!-- スクリーンショットを追加予定 -->
> デプロイ後に追加予定

**デモURL:** _準備中_

---

## ✨ 主な機能

- 🌤️ **天気連動リスト生成** — 旅行先の天気予報を取得し、必要な持ち物を自動提案
- 📅 **数量の自動計算** — 宿泊数と洗濯の有無に応じて必要な枚数を算出
- 🎒 **旅行タイプ別テンプレート** — ビジネス / 観光 / アウトドアの3タイプに最適化されたリスト
- 📝 **アイテムへのメモ機能** — 各持ち物にインラインでメモを追加・編集
- 📋 **旅行プランの複製** — 既存のプランをワンクリックでコピーして流用
- 💾 **複数プランの保存・管理** — 旅行ごとにプランを作成して一元管理
- ✅ **チェックリストで進捗管理** — パッキングの完了状況をプログレスバーで可視化
- 📱 **モバイル最適化** — スマートフォンでの操作に最適化されたUI

---

## 🛠 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js (App Router) | 14.2 | フレームワーク |
| TypeScript | 5 | 型安全な開発 |
| Tailwind CSS | 3.3 | スタイリング |
| React | 18 | UIライブラリ |

### バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Ruby on Rails (APIモード) | 7.1 | APIサーバー |
| Ruby | 3.3 | 言語 |
| PostgreSQL | 16 | データベース |

### インフラ・ツール

| 技術 | 用途 |
|------|------|
| Docker / docker-compose | コンテナ環境構築 |
| Git / GitHub | バージョン管理 |

### 外部API

| API | 用途 |
|-----|------|
| [天気予報 API（tsukumijima）](https://weather.tsukumijima.net/) | 旅行先の天気・気温取得 |

---

## 🏗 アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                     ブラウザ / モバイル                    │
│                   Next.js (localhost:3000)                │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API (JSON)
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Rails API Server (localhost:3001)           │
│                                                          │
│  ┌─────────────────┐    ┌──────────────────────────┐   │
│  │  TravelsController│   │  PackingCalculator (Svc) │   │
│  │  PackingItems    │   │  持ち物・数量算出ロジック    │   │
│  └────────┬────────┘   └──────────────┬───────────┘   │
│           │                            │                │
│  ┌────────▼────────────────────────────▼───────────┐   │
│  │                  PostgreSQL                      │   │
│  │         travels / packing_items テーブル          │   │
│  └──────────────────────────────────────────────────┘   │
│                            │                             │
│  ┌─────────────────────────▼──────────────────────┐    │
│  │            WeatherService                       │    │
│  └─────────────────────────┬──────────────────────┘    │
└────────────────────────────┼────────────────────────────┘
                             │ HTTP
                             ▼
              ┌──────────────────────────┐
              │  天気予報API              │
              │  weather.tsukumijima.net │
              └──────────────────────────┘
```

---

## 🚀 セットアップ手順

### 前提条件

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) がインストールされていること
- Git がインストールされていること

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/s1ros75/smart-pack.git
cd smart-pack

# Docker起動（初回はイメージのビルドに数分かかります）
docker compose up --build
```

```bash
# DBマイグレーション（初回のみ、別ターミナルで実行）
docker compose exec backend rails db:migrate
```

### アクセス

| サービス | URL |
|---------|-----|
| フロントエンド | http://localhost:3000 |
| バックエンドAPI | http://localhost:3001 |

### 動作確認

```bash
# ヘルスチェック
curl http://localhost:3001/api/health
# => {"status":"ok","message":"Backend is running","database":"connected"}

# 天気取得（東京）
curl "http://localhost:3001/api/weather?city_code=130010"
```

---

## 📡 APIエンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/api/health` | サーバー・DB疎通確認 |
| `GET` | `/api/weather?city_code=:code` | 旅行先の天気取得 |
| `GET` | `/api/travels` | 旅行プラン一覧（packing_items含む） |
| `POST` | `/api/travels` | 旅行プラン作成（リスト自動生成） |
| `GET` | `/api/travels/:id` | 旅行プラン詳細 |
| `PATCH` | `/api/travels/:id` | 旅行プラン更新 |
| `DELETE` | `/api/travels/:id` | 旅行プラン削除 |
| `POST` | `/api/travels/:id/duplicate` | 旅行プランを複製 |
| `POST` | `/api/travels/:id/packing_items` | アイテム追加 |
| `PATCH` | `/api/packing_items/:id` | アイテム更新（チェック・メモなど） |
| `DELETE` | `/api/packing_items/:id` | アイテム削除 |

<details>
<summary>リクエスト例</summary>

**旅行プラン作成**
```bash
curl -X POST http://localhost:3001/api/travels \
  -H "Content-Type: application/json" \
  -d '{
    "city_code": "130010",
    "nights": 3,
    "laundry": false,
    "travel_type": "leisure",
    "start_date": "2026-05-01",
    "end_date": "2026-05-04"
  }'
```

**チェック状態の更新**
```bash
curl -X PATCH http://localhost:3001/api/packing_items/1 \
  -H "Content-Type: application/json" \
  -d '{"checked": true}'
```

</details>

---

## 📁 ディレクトリ構造

```
smart-pack/
├── docker-compose.yml
├── docker/
│   ├── backend/Dockerfile
│   └── frontend/Dockerfile
│
├── backend/                          # Rails API (APIモード)
│   ├── app/
│   │   ├── controllers/api/
│   │   │   ├── health_controller.rb
│   │   │   ├── weather_controller.rb
│   │   │   ├── travels_controller.rb
│   │   │   └── packing_items_controller.rb
│   │   ├── models/
│   │   │   ├── travel.rb
│   │   │   └── packing_item.rb
│   │   └── services/
│   │       ├── weather_service.rb    # 天気API連携
│   │       └── packing_calculator.rb # 持ち物算出ロジック
│   ├── config/routes.rb
│   └── db/
│       ├── migrate/
│       └── schema.rb
│
└── frontend/                         # Next.js App Router
    └── src/
        ├── app/
        │   ├── page.tsx              # 旅行プラン一覧
        │   └── travels/
        │       ├── new/page.tsx      # プラン作成フォーム
        │       └── [id]/page.tsx     # パッキングリスト詳細
        ├── components/
        │   ├── TravelCard.tsx        # プランカードUI
        │   ├── PackingListDetail.tsx # パッキングリスト（チェック・メモ）
        │   └── WeatherCard.tsx       # 天気表示
        ├── lib/
        │   └── api.ts               # API通信
        └── types/
            ├── travel.ts            # Travel / PackingItem型定義
            └── packing.ts           # 天気・都市型定義
```

---

## 💡 開発上の工夫点

### 🐳 Dockerによる環境構築の一元化
`docker compose up --build` 一発で Rails + Next.js + PostgreSQL の3サービスが立ち上がる構成。環境差異を排除し、セットアップコストを最小化。

### 🏗 ビジネスロジックのサービスクラス分離
持ち物の計算ロジックを `PackingCalculator` サービスクラスに分離。宿泊数・洗濯有無・天気予報・旅行タイプを組み合わせた複雑な判定を Controller から切り離し、テスタブルな設計を実現。

### 🔒 型安全なフロントエンド
`Travel` / `PackingItemRecord` / `TravelDetail` など、バックエンドのレスポンスに対応した TypeScript 型を定義。API 通信から UIコンポーネントまで型が通っており、ランタイムエラーを抑制。

### 🌤 外部APIとの疎結合
天気情報は `WeatherService` に閉じ込め、APIの仕様変更がアプリ全体に波及しない設計。

### 📱 モバイルファースト
旅行当日のパッキング作業はスマートフォンで行われることを想定し、大きなタップターゲット・インライン編集・`touch-manipulation` によるタップ遅延排除を実装。

### ✅ 疎通確認エンドポイント
`GET /api/health` でサーバーとDBの接続状態を確認可能。デプロイ後の動作確認やCI/CDでの死活監視に活用できる。

---

## 🔭 今後の展望

- [ ] **テストの追加** — RSpec（バックエンド）、Jest / React Testing Library（フロントエンド）
- [ ] **CI/CD** — GitHub Actions でテスト・Lint を自動化
- [ ] **ダークモード対応** — Tailwind CSS の `dark:` プレフィックスを活用
- [ ] **PWA対応** — オフラインでもチェックリストを閲覧可能に
- [ ] **ユーザー認証機能** — 複数ユーザーによるプラン管理

---

## 📄 ライセンス

[MIT License](LICENSE)
