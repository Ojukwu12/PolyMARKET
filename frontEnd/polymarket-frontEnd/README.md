Polymarket Frontend (minimal Next.js 14 demo)

Commands:

Install dependencies:

```powershell
cd "frontEnd/polymarket-frontEnd"
npm install
```

Run dev server on port 3001:

```powershell
npm run dev
```

Note: the backend runs on port 3000 by default. Ensure `backEnd` is running and CORS allows requests from this frontend (the backend `ALLOWED_ORIGINS` env may be set to `*` for local dev).

Connecting frontend <-> backend options:

- Default (recommended for dev): keep backend on `http://localhost:3000` and the Next dev server will proxy `/api/*` to the backend automatically via `next.config.mjs` rewrites.
- Explicit base URL: set `NEXT_PUBLIC_API_BASE_URL` when running the frontend to point to your backend, e.g. `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000 npm run dev`.

Example dev commands (PowerShell):

```powershell
# Start backend (from project root)
cd "backEnd"
node index.js

# In another shell, start frontend
cd "frontEnd/polymarket-frontEnd"
# optional: set explicit backend URL
$env:NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000'
npm run dev
```

Open the stats page at: `http://localhost:3001/stats`

Admin dashboard:

- Server-side admin page (recommended): `app/admin` is now server-rendered and does not expose admin secrets to the browser. Set `NEXT_ADMIN_API_KEY` in the frontend server environment before starting dev (this value stays on the server and is not exposed to client JavaScript):

```powershell
$env:NEXT_ADMIN_API_KEY = 'secret123'
npm run dev
```

- The server admin page will call your backend `/admin/metrics` using the server-side key and the refresh button calls a Next API route which also uses the server key. This keeps admin secrets off the browser.

- Alternate client-side admin: the earlier client admin flow still exists if you prefer wallet-based or API-key-based client auth, but for production use the server-side admin page is safer.

