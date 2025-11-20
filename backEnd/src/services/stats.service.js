const polymarketService = require('./polymarket.service');
const redditService = require('./reddit.service');
const sentimentService = require('./sentiment.service');
const cache = require('../utils/cache');
const { CACHE_TTL } = require('../config/env');

async function getMostPicked(limit = 10) {
  const cacheKey = `stats::most-picked::${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const markets = await polymarketService.getMarkets();
  const items = [];

  for (const m of markets) {
    const outcomes = Array.isArray(m.outcomes) ? m.outcomes : (m.market_answers || m.choices || []);
    for (const o of outcomes) {
      const name = o.name || o.text || o.label || String(o);
      const q = `${m.question || m.title || ''} ${name}`.trim();
      // fetch reddit posts and compute simple counts + sentiment average
      const texts = await redditService.fetchRedditPosts(q, 20);
      const count = Array.isArray(texts) ? texts.length : 0;
      const sentimentAvg = sentimentService.analyzeTextsAverage(texts);
      items.push({ marketId: m.id || m.marketId || null, outcome: name, count, sentimentAvg });
    }
  }

  // sort by count desc, then sentiment
  items.sort((a, b) => b.count - a.count || (b.sentimentAvg || 0) - (a.sentimentAvg || 0));
  const out = items.slice(0, limit);
  cache.set(cacheKey, out, CACHE_TTL);
  return out;
}

module.exports = { getMostPicked };
