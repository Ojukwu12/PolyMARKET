# Environment variables & usage (backend)

This document explains how to manage API keys for Polymarket. Reddit sentiment uses only public endpoints and requires no credentials. Keep secrets out of client-side bundles and the repository.

1) Files

- `.env.example` — example values (safe to commit). Copy to `.env` and fill in real keys.
- `.env` — your local secrets (do NOT commit).

2) Recommended packages

- For Node.js (development) use `dotenv` to load `.env`:

  npm install dotenv

3) Accessing variables in Node.js (CommonJS)

```js
// server.js or any Node file
require('dotenv').config(); // loads .env into process.env
const fetch = require('node-fetch');

const POLY_API_URL = process.env.POLYMARKET_API_URL;
const POLY_KEY = process.env.POLYMARKET_API_KEY;

async function getMarkets() {
  const res = await fetch(`${POLY_API_URL}`, {
    headers: { Authorization: `Bearer ${POLY_KEY}` },
  });
  return res.json();
}

module.exports = { getMarkets };
```

4) Using with Next.js (server-side)

- Server-only secrets: use `process.env.MY_SECRET` (do NOT prefix with `NEXT_PUBLIC_`). Server components and API routes can safely read these.
- Client-side variables must be prefixed with `NEXT_PUBLIC_` and are visible in browser bundles. Never put API secrets there.

5) PowerShell: set env vars for the current session (temporary)

```powershell
$env:POLYMARKET_API_KEY = "your_value"
npm run dev
```

6) Production / Hosting

- On platforms like Vercel, Netlify, Render, or Heroku, set the environment variables in the project settings / dashboard.
- Never commit secrets to the repo. Use CI environment variables or secrets stores.

7) Security notes

- Do not place API keys in client-side code. If you need to call a third-party API from the browser, proxy the request through your own server or Next.js API route and keep the secret server-side.
- Rotate keys if they are accidentally committed.
- Twitter variables are deprecated; remove any lingering references.
