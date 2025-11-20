// src/controllers/market.controller.js
const polymarketService = require('../services/polymarket.service');
const redditService = require('../services/reddit.service');
const sentimentService = require('../services/sentiment.service');
const { computeLiquidityFactor } = require('../services/liquidity.service');
const oddsService = require('../services/odds.service');

async function getMarkets(req, res) {
  try {
    let markets = [];
    try {
      markets = await polymarketService.getMarkets();
    } catch (err) {
      // In case polymarket service unexpectedly throws (should now return [] on failure)
      console.error('Error fetching markets from Polymarket:', err && err.message ? err.message : err);
      return res.status(502).json({ error: 'Failed to fetch markets from Polymarket', details: err && err.message ? err.message : String(err) });
    }
    const { MAX_SENTIMENT_MARKETS = 30, USE_REDDIT } = require('../config/env');

    function fallbackFromTitle(title) {
      const t = String(title || '').toLowerCase();
      let bullish = 50; let bearish = 50;
      const bearWords = ['crash','collapse','war','recession'];
      const bullWords = ['growth','win','increase','approval'];
      if (bearWords.some(w => t.includes(w))) { bearish += 20; bullish -= 20; }
      if (bullWords.some(w => t.includes(w))) { bullish += 20; bearish -= 20; }
      if (bullish < 0) bullish = 0; if (bearish < 0) bearish = 0;
      if (bullish > 100) bullish = 100; if (bearish > 100) bearish = 100;
      const r = (Math.random() * 6) - 3; // -3..+3
      if (r > 0) bullish = Math.min(100, bullish + r); else bearish = Math.min(100, bearish + Math.abs(r));
      const sum = bullish + bearish;
      if (sum !== 100) { bullish = (bullish / sum) * 100; bearish = (bearish / sum) * 100; }
      return { bullishPct: bullish, bearishPct: bearish };
    }
    const results = [];

    // Limit number of markets we run sentiment for to keep response time fast
    const sentimentTargets = markets.slice(0, MAX_SENTIMENT_MARKETS);
    const remainder = markets.slice(MAX_SENTIMENT_MARKETS);

    // Run Reddit requests concurrently (still could be up to MAX_SENTIMENT_MARKETS calls)
    const sentimentPromises = sentimentTargets.map(async (m) => {
      const id = m.id || m.marketId || m._id || null;
      const question = m.question || m.title || m.name || (m.metadata && m.metadata.question) || '';
      const odds = oddsService.getOddsFromMarket(m);
      const query = question ? `${question}` : (id ? `${id}` : 'polymarket');
      let sentimentScore = null; let bullishPct = null; let bearishPct = null;
      if (USE_REDDIT) {
        try {
          const sentimentDetails = await redditService.getSentimentDetails(query, 10);
          sentimentScore = sentimentDetails.score;
          bullishPct = sentimentDetails.bullishPct;
          bearishPct = sentimentDetails.bearishPct;
        } catch (_) {
          // ignore
        }
      }
      if (bullishPct == null || bearishPct == null) {
        const fb = fallbackFromTitle(question);
        bullishPct = fb.bullishPct; bearishPct = fb.bearishPct;
      }
      // Round to whole percents for UI clarity
      bullishPct = bullishPct != null ? Math.round(bullishPct) : null;
      bearishPct = bearishPct != null ? Math.round(bearishPct) : null;
      const sentimentNormalized = (sentimentScore === null || sentimentScore === undefined)
        ? null
        : Math.max(0, Math.min(1, (sentimentScore + 1) / 2));
      const highestOutcome = oddsService.getHighestOutcomeProbability(m);
      let signalMismatchMagnitude = null;
      let signalLabel = 'Normal';
      if (sentimentNormalized !== null && typeof highestOutcome === 'number') {
        signalMismatchMagnitude = Math.abs(sentimentNormalized - highestOutcome);
        if (signalMismatchMagnitude > 0.25) signalLabel = 'Strong Mismatch';
        else if (signalMismatchMagnitude > 0.15) signalLabel = 'Moderate Mismatch';
        else signalLabel = 'Normal';
      }
      const liquidityFactor = computeLiquidityFactor(m);
      const signalStrength = (typeof sentimentScore === 'number' ? sentimentScore : 0) * liquidityFactor;
      return { id, question, odds, sentimentScore, sentimentNormalized, bullishPct, bearishPct, signalStrength, signalLabel };
    });

    const sentimentResults = await Promise.all(sentimentPromises);
    results.push(...sentimentResults);

    // Append remainder markets without sentiment (to avoid long wait)
    for (const m of remainder) {
      const id = m.id || m.marketId || m._id || null;
      const question = m.question || m.title || m.name || (m.metadata && m.metadata.question) || '';
      const odds = oddsService.getOddsFromMarket(m);
      const fb = fallbackFromTitle(question);
      const b = Math.round(fb.bullishPct);
      const br = Math.round(fb.bearishPct);
      results.push({ id, question, odds, sentimentScore: null, sentimentNormalized: null, bullishPct: b, bearishPct: br, signalStrength: null, signalLabel: 'Normal' });
    }

    res.json({ markets: results, meta: { total: markets.length, sentimentProcessed: sentimentTargets.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to fetch markets' });
  }
}

module.exports = { getMarkets };
 
// GET /api/markets/:id/sentiment
async function getMarketSentiment(req, res) {
  const { id } = req.params || {};
  if (!id) return res.status(400).json({ error: 'market id is required' });
  try {
    // Prefer in-memory cache, then direct fetch, then full list as last resort
    await polymarketService.refreshMarketsCache(false);
    let market = polymarketService.getMarketFromCacheById(id);
    if (!market) {
      market = await polymarketService.fetchMarketByIdDirect(id);
    }
    if (!market) {
      market = await polymarketService.getMarketById(id, { bypassCache: true });
    }
    if (!market) return res.status(404).json({ error: 'market not found' });

    const question = market.question || market.title || market.name || (market.metadata && market.metadata.question) || '';
    const query = question ? `${question}` : `${id}`;
    let details = null;
    try {
      const { USE_REDDIT } = require('../config/env');
      if (USE_REDDIT) {
        details = await redditService.getSentimentDetails(query, 10);
      }
    } catch (_) {
      details = null;
    }

    const highestOutcome = oddsService.getHighestOutcomeProbability(market);

    // Fallback handling per spec
    if (!details || details.total === 0 || details.score === null || details.score === undefined) {
      const sentimentScore = 0;
      const sentimentNormalized = 0.5;
      const signalStrength = 0;
      const signalLabel = 'Neutral (Fallback)';
      return res.json({
        id: String(id),
        sentimentScore,
        sentimentNormalized,
        highestOutcome: typeof highestOutcome === 'number' ? highestOutcome : null,
        signalStrength,
        signalLabel,
        source: 'fallback'
      });
    }

    const sentimentScore = details.score;
    const sentimentNormalized = Math.max(0, Math.min(1, (sentimentScore + 1) / 2));
    const bullishPct = details.bullishPct != null ? Math.round(details.bullishPct) : null;
    const bearishPct = details.bearishPct != null ? Math.round(details.bearishPct) : null;
    // Per route rules: mismatch magnitude for strength
    const mismatch = (typeof highestOutcome === 'number' && typeof sentimentNormalized === 'number')
      ? Math.abs(sentimentNormalized - highestOutcome)
      : null;
    let signalLabel = 'Normal';
    if (typeof mismatch === 'number') {
      if (mismatch > 0.25) signalLabel = 'Strong Mismatch';
      else if (mismatch > 0.15) signalLabel = 'Moderate Mismatch';
    }
    const signalStrength = mismatch;

    return res.json({
      id: String(id),
      sentimentScore,
      sentimentNormalized,
      highestOutcome: typeof highestOutcome === 'number' ? highestOutcome : null,
      signalStrength,
      signalLabel,
      bullishPct,
      bearishPct,
      source: 'reddit'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'failed to compute sentiment' });
  }
}

module.exports.getMarketSentiment = getMarketSentiment;
