const marketStore = require('../services/marketStore.service');
const redditService = require('../services/reddit.service');

async function getActiveMarkets(req, res) {
  try {
    const markets = await marketStore.listActiveMarkets();
    res.json({ ok: true, markets });
  } catch (err) {
    console.error('getActiveMarkets error:', err && err.message ? err.message : err);
    res.status(500).json({ ok: false, error: 'failed to list markets' });
  }
}

async function getMarketsByCategory(req, res) {
  try {
    const { category } = req.params || {};
    if (!category) return res.status(400).json({ ok: false, error: 'category required' });
    const markets = await marketStore.getMarketsByCategory(category);
    res.json({ ok: true, markets });
  } catch (err) {
    console.error('getMarketsByCategory error:', err && err.message ? err.message : err);
    res.status(500).json({ ok: false, error: 'failed to list markets by category' });
  }
}

async function postSentiment(req, res) {
  try {
    const { marketId, query } = req.body || {};
    if (!marketId && !query) return res.status(400).json({ ok: false, error: 'marketId or query required' });
    const q = query || marketId;
    try {
      const details = await redditService.getSentimentDetails(q, 20);
      if (!details || details.total === 0) {
        return res.json({ ok: true, sentiment: null, message: 'No sentiment available' });
      }
      return res.json({ ok: true, sentiment: details });
    } catch (err) {
      return res.json({ ok: true, sentiment: null, message: 'No sentiment available' });
    }
  } catch (err) {
    console.error('postSentiment error:', err && err.message ? err.message : err);
    res.status(500).json({ ok: false, error: 'failed to compute sentiment' });
  }
}

module.exports = { getActiveMarkets, getMarketsByCategory, postSentiment };
