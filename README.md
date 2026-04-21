# Smart Pack

旅行先・日程・洗濯の有無を入力すると、OpenWeatherMap と連動して最適な持ち物リストを自動生成する Web アプリ。

## 起動手順

### 1. 環境変数の設定

```bash
cp .env.example .env
# .env を開き OPENWEATHERMAP_API_KEY に取得済みのキーを設定
```

### 2. コンテナ起動

```bash
docker compose up --build
```

| サービス | URL |
|---------|-----|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (Rails API) | http://localhost:3001 |
| PostgreSQL | localhost:5432 |

### 3. 疎通確認

```bash
curl http://localhost:3001/api/v1/health
# => {"status":"ok","timestamp":"..."}
```

### 4. 持ち物リスト取得

```bash
curl "http://localhost:3001/api/v1/packing_list?city=Tokyo&nights=3&laundry=false"
```

## ディレクトリ構造

```
smart-pack/
├── docker/
│   ├── backend/Dockerfile
│   └── frontend/Dockerfile
├── backend/                  # Rails API
│   ├── app/
│   │   ├── controllers/api/v1/
│   │   │   ├── health_controller.rb
│   │   │   └── packing_lists_controller.rb
│   │   └── services/
│   │       ├── weather_service.rb      # OpenWeatherMap 連携
│   │       └── packing_calculator.rb   # 持ち物算出ロジック
│   └── config/
├── frontend/                 # Next.js + TypeScript + Tailwind
│   └── src/
│       ├── app/
│       ├── lib/api.ts
│       └── types/packing.ts
└── docker-compose.yml
```

## 下着枚数の算出ロジック

`PackingCalculator#underwear_items` で実装。

| 条件 | 枚数 |
|------|------|
| 洗濯なし | 宿泊数 + 1 |
| 洗濯あり | ceil(宿泊数 / 2) + 1（バッファ込み）|
