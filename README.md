Polymarket Dashboard — full-stack demo

This repository contains a lightweight backend and a Next.js frontend for a Polymarket markets + Twitter sentiment dashboard.

Quick overview
- `backEnd/` — Node.js + Express backend that fetches markets (Polymarket), fetches tweets, runs sentiment analysis, and exposes aggregated endpoints.
- `frontEnd/polymarket-frontEnd` — Minimal Next.js 14 TypeScript frontend with a stats page and server-side admin page.

Run locally (PowerShell)

1) Backend

cd "c:/Users/23470/Desktop/Polymarket Dashboard/backEnd"
# copy example env and edit keys
copy .env.example .env
# recommended for offline dev
# open .env and set USE_MOCK_MARKETS=true
npm install
node index.js

Backend notes — important env vars (in `backEnd/.env`):
- `POLYMARKET_API_URL` — Polymarket API URL (or leave blank when using mock mode)
- `TWITTER_BEARER_TOKEN` — Twitter API bearer token (optional; empty will make tweet calls return [])
- `USE_MOCK_MARKETS=true` — use the included sample markets for offline dev
- `ADMIN_API_KEY` — simple admin API key (optional)
- `ADMIN_JWT_SECRET` — secret used to sign JWTs for wallet login (optional)
- `CACHE_TTL` — caching TTL in seconds
- `ALLOWED_ORIGINS` — CORS allowed origins (use `*` for local dev)

2) Frontend

cd "c:/Users/23470/Desktop/Polymarket Dashboard/frontEnd/polymarket-frontEnd"
# install frontend deps (optional — Tailwind build step)
npm install

# recommended for dev: set server-side admin key and backend URL for the frontend server
$env:NEXT_ADMIN_API_KEY = 'secret123'
$env:NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000'

npm run dev

Frontend notes
- The Next dev server runs on port 3001 by default. The frontend proxies `/api/*` to the backend during development using `next.config.mjs` rewrites (or you can set `NEXT_PUBLIC_API_BASE_URL`).
- For admin actions, prefer the server-side admin page at `http://localhost:3001/admin` — set `NEXT_ADMIN_API_KEY` in the server environment before starting Next so it can call backend admin endpoints without exposing secrets to the browser.
- If you can't install Tailwind packages (network restrictions), the app includes a Tailwind CDN fallback so the UI will still render with utility classes.

3) Tests

cd "c:/Users/23470/Desktop/Polymarket Dashboard/backEnd"
npm test

Troubleshooting
- If the backend fails trying to reach `api.polymarket.com`, enable mock mode by setting `USE_MOCK_MARKETS=true` in `backEnd/.env`.
- If frontend CSS looks off, either install Tailwind locally (`npm install`) or rely on the CDN fallback (included in `app/layout.tsx`).

Security
- Do not commit `.env` with secrets. Keep `ADMIN_API_KEY` and `ADMIN_JWT_SECRET` safe.
- Production deployment should enable HTTPS and restrict `ALLOWED_ORIGINS`.

If you want, I can prepare a single `docker-compose.yml` to run both frontend and backend together.
