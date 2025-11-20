// src/services/polymarket.service.js
const fetch = require('node-fetch');
const parseMarkets = require('../utils/parseMarkets');
const { POLYMARKET_API_URL, USE_MOCK_MARKETS, CACHE_TTL } = require('../config/env');
const cache = require('../utils/cache');
const retry = require('../utils/retry');
const path = require('path');
const fs = require('fs');

// Module-level markets cache refreshed every 5 minutes
let marketsCache = null;
let marketsCacheFetchedAt = 0;
const MARKETS_CACHE_TTL_MS = 5 * 60 * 1000;

async function getMarkets(options = {}) {
  const { bypassCache = false, fast = false } = options;
  // If mock mode enabled, return sample data
  if (USE_MOCK_MARKETS) {
    try {
      const p = path.join(__dirname, '../mocks/markets.sample.json');
      const txt = fs.readFileSync(p, 'utf8');
      return JSON.parse(txt);
    } catch (err) {
      console.error('Failed to load mock markets:', err && err.message ? err.message : err);
      return [];
    }
  }

  if (!POLYMARKET_API_URL) {
    console.error('POLYMARKET_API_URL not configured');
    return [];
  }

  const cacheKey = `markets::${POLYMARKET_API_URL}`;
  const cached = !bypassCache ? cache.get(cacheKey) : null;
  if (cached) return cached;

  try {
    const fn = async () => {
      let finalUrl = POLYMARKET_API_URL;
      console.log('Fetching markets from Polymarket API:', finalUrl);
      try {
        const u = new URL(POLYMARKET_API_URL);
        const { FAST_MARKETS_LIMIT } = require('../config/env');
        // Adjust limit for fast lightweight fetches
        if (fast) {
          u.searchParams.set('limit', String(FAST_MARKETS_LIMIT));
        } else {
          if (!u.searchParams.has('limit') || Number(u.searchParams.get('limit')) < 200) u.searchParams.set('limit', '200');
        }
        if (!u.searchParams.has('closed')) u.searchParams.set('closed', 'false');
        // Keep previous behavior for gamma to prefer active markets
        if (u.hostname.includes('gamma-api.polymarket.com')) {
          if (!u.searchParams.has('active')) u.searchParams.set('active', 'true');
        }
        finalUrl = u.toString();
      } catch (_) {
        // if POLYMARKET_API_URL is not a valid URL, proceed as-is
        console.warn('POLYMARKET_API_URL is not a valid URL:', POLYMARKET_API_URL);
        // Fallback append parameters
        const { FAST_MARKETS_LIMIT } = require('../config/env');
        const lim = fast ? FAST_MARKETS_LIMIT : 200;
        finalUrl = POLYMARKET_API_URL + (POLYMARKET_API_URL.includes('?') ? '&' : '?') + `limit=${lim}&closed=false`;
      }

      const res = await fetch(finalUrl, { timeout: 10000 });
      if (!res.ok) throw new Error(`Polymarket API returned ${res.status}`);
      const json = await res.json();
      const markets = parseMarkets(json);
      return markets;
    };

    const markets = await retry(fn, { retries: 2, minDelay: 200 });
    if (!bypassCache) cache.set(cacheKey, markets, CACHE_TTL);
    // also maintain module-level cache
    marketsCache = markets;
    marketsCacheFetchedAt = Date.now();
    return markets;
  } catch (err) {
    // Log the error and rethrow so callers (controller) can return an appropriate HTTP error
    console.error('polymarket.service.getMarkets error:', err && err.message ? err.message : err);
    throw err;
  }
}
  async function getMarketById(id, options = {}) {
  if (!id) return null;
  const markets = await getMarkets(options);
  const match = markets.find(m => {
    const mid = m.id || m.marketId || m._id || null;
    return String(mid) === String(id);
  });
  return match || null;
}

  function getMarketFromCacheById(id) {
    if (!marketsCache) return null;
    return marketsCache.find(m => {
      const mid = m.id || m.marketId || m._id || null;
      return String(mid) === String(id);
    }) || null;
  }

  async function refreshMarketsCache(force = false) {
    const stale = !marketsCache || (Date.now() - marketsCacheFetchedAt > MARKETS_CACHE_TTL_MS);
    if (force || stale) {
      try {
        const markets = await getMarkets({ bypassCache: true });
        marketsCache = markets;
        marketsCacheFetchedAt = Date.now();
        // store for admin visibility
        cache.set('markets::cache', markets, Math.floor(MARKETS_CACHE_TTL_MS / 1000));
      } catch (e) {
        // keep previous cache if refresh fails
      }
    }
    return marketsCache;
  }

  async function fetchMarketByIdDirect(id) {
    if (!POLYMARKET_API_URL) return null;
    try {
      let finalUrl = POLYMARKET_API_URL;
      try {
        const u = new URL(POLYMARKET_API_URL);
        // Try common selectors for single-id fetch; fall back to general list if unsupported
        if (!u.searchParams.has('ids') && !u.searchParams.has('id')) {
          // prefer ids for gamma
          if (u.hostname.includes('gamma')) u.searchParams.set('ids', String(id));
          else u.searchParams.set('id', String(id));
        } else {
          // override existing to just the requested id
          if (u.searchParams.has('ids')) u.searchParams.set('ids', String(id));
          if (u.searchParams.has('id')) u.searchParams.set('id', String(id));
        }
        // minimal page size
        u.searchParams.set('limit', '1');
        finalUrl = u.toString();
      } catch (_) {
        // invalid base URL; use as-is (won't support single fetch)
      }

      const res = await fetch(finalUrl, { timeout: 10000 });
      if (!res.ok) return null;
      const json = await res.json();
      const markets = parseMarkets(json);
      const found = markets.find(m => {
        const mid = m.id || m.marketId || m._id || null;
        return String(mid) === String(id);
      });
      return found || null;
    } catch (_) {
      return null;
    }
  }

  // periodic background refresh
  setInterval(() => { refreshMarketsCache(false); }, MARKETS_CACHE_TTL_MS);

  async function getMarketsFast() {
    return getMarkets({ fast: true, bypassCache: false });
  }

  module.exports = { getMarkets, getMarketsFast, getMarketById, getMarketFromCacheById, refreshMarketsCache, fetchMarketByIdDirect };
