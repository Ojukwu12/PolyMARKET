# Polymarket Backend

Lightweight Node.js + Express + MongoDB backend for the Polymarket Dashboard project. Fetches markets from Polymarket Gamma API, categorizes them, calculates sentiment via Reddit, stores them in MongoDB, and tracks resolved market stats and win rates.

## Endpoints

- `GET /` — health check
- `GET /api/markets` — fetch markets with sentiment (legacy endpoint, limited to first N markets)
- `GET /markets` — list active markets from MongoDB (filters out expired/removed)
- `GET /markets/category/:category` — list active markets by category
- `POST /sentiment` — fetch sentiment for a given market (body: `{ marketId, query }`)
- `GET /api/stats` — get resolved market stats and win rates

## Setup

1. **Install dependencies:**

```powershell
cd backEnd
npm install
```

2. **Configure environment variables:**

Copy `backEnd/.env.example` -> `backEnd/.env` and fill in:

- `POLYMARKET_API_URL` — e.g., `https://gamma-api.polymarket.com/markets?limit=200&active=true`
- `MONGO_URI` — MongoDB connection string (e.g., `mongodb://localhost:27017/polymarket`)

3. **Run the backend:**

```powershell
npm start
```

The server will:
- Connect to MongoDB
- Start a cron job that syncs markets every 10 minutes
- Automatically categorize markets
- Fetch sentiment from Reddit
- Update market status (open → closed → resolved)
- Remove expired markets after 48 hours
- Track resolved markets and update win rates

## Features

- **Market categorization:** Keyword-based classification into Crypto, Politics, Tech, AI, Sports, Entertainment, Finance, Other.
- **Sentiment integration:** Reddit sentiment with fallback to "No sentiment available" if Reddit fails.
- **Status tracking:** Markets transition from open → closed (expired) → resolved (with outcome).
- **Expiry removal:** Resolved/closed markets are removed from main list after 48 hours but stored permanently in stats.
- **Win rate system:** Tracks bullish/bearish sentiment accuracy and displays win rates on the stats page.
- **Cron job:** Every 10 minutes, the backend fetches new markets, updates status, removes expired markets, and updates stats.

## Database Models

- **Market:** Stores market data (title, outcomes, prices, volume, liquidity, expiry, status, category, sentiment, resolvedOutcome, removedAt).
- **Stats:** Stores resolved market records (marketId, finalOutcome, sentimentAtTheTime, category, resolvedAt).
- **WinRate:** Stores win rate counters (bullishWins, bearishWins, total) with computed virtuals (bullishWinRate, bearishWinRate, totalWinRate).

## Development Tips

- **Mock mode:** Set `USE_MOCK_MARKETS=true` in `.env` to use local sample markets (no network).
- **Caching:** In-memory TTL cache (controlled by `CACHE_TTL` env, default 60s) for markets and Reddit sentiment.
- **Retry:** Simple exponential backoff retry for Polymarket fetches.
- **Security:** CORS enabled broadly for local dev; lock origins in production via `ALLOWED_ORIGINS`.
- **API docs:** Swagger UI available at `/docs` (OpenAPI spec at `backEnd/docs/openapi.json`).
- **Dockerfile:** Included for containerized runs.

## Docker

Build and run:

```powershell
docker build -t polymarket-backend ./backEnd
docker run -p 3000:3000 --env-file backEnd/.env polymarket-backend
```

## Testing

Run tests:

```powershell
npm test
```

Tests include:
- `categorize.test.js` — tests keyword-based categorization
- `odds.service.test.js` — tests odds calculation
- `sentiment.service.test.js` — tests sentiment analysis

## Notes

- Twitter integration was removed; any previous references are deprecated.
- Reddit public JSON API is used for sentiment (no auth required).
- Polymarket API recommendation: Use `https://gamma-api.polymarket.com/markets?limit=200&active=true` or similar. The parser is permissive and accepts arrays or envelopes like `{ "markets": [...] }` or `{ "data": [...] }`.
- If the Polymarket API requires auth, add the key to `.env` and update `src/services/polymarket.service.js` to send the required headers.
