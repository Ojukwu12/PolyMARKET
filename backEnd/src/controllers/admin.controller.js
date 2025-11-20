const cache = require('../utils/cache');
const polymarketService = require('../services/polymarket.service');

async function metrics(req, res) {
  try {
    const marketsCache = cache.get('markets::cache') || null;
    const keys = Array.from(cache.map ? cache.map.keys() : []);
    res.json({ ok: true, cacheKeys: keys.slice(0, 200), marketsCached: !!marketsCache });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'failed to read metrics' });
  }
}

async function refresh(req, res) {
  try {
    // purge cache entries that we know
    cache.del('markets::cache');
    // optionally refetch markets to warm cache
    try { await polymarketService.getMarkets(); } catch (e) {}
    res.json({ ok: true, message: 'refreshed' });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'failed to refresh' });
  }
}

module.exports = { metrics, refresh };
