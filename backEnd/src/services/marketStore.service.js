const polymarketService = require('./polymarket.service');
const redditService = require('./reddit.service');
const { categorizeMarket } = require('../utils/categorize');
const Market = require('../models/market.model');
const Stats = require('../models/stats.model');
const WinRate = require('../models/winrate.model');
const { connect } = require('../config/db');

const REMOVE_AFTER_MS = 48 * 60 * 60 * 1000; // 48 hours

async function upsertMarketFromRaw(raw) {
  if (!raw) return null;
  const id = raw.id || raw.marketId || raw._id || null;
  if (!id) return null;
  // map fields
  const title = raw.question || raw.title || raw.name || (raw.metadata && raw.metadata.question) || '';
  const outcomesRaw = Array.isArray(raw.outcomes) ? raw.outcomes : (raw.market_answers || raw.choices || []);
  const outcomes = outcomesRaw.map(o => ({ name: o.name || o.text || o.label || String(o), price: o.price || o.probability || null }));
  const prices = outcomes.reduce((acc, o) => { if (o.name) acc[o.name] = o.price; return acc; }, {});
  const volume = raw.volume || raw.totalVolume || 0;
  const liquidity = raw.liquidity || raw.poolSize || 0;
  const expiry = raw.expiry || raw.endsAt || raw.closesAt || raw.end_time || null;
  const resolution = raw.resolution || raw.resolved || null;

  const category = categorizeMarket(title);

  // sentiment try via reddit (best-effort)
  let bullishPct = null; let bearishPct = null; let sentimentScore = null;
  try {
    const details = await redditService.getSentimentDetails(title, 10);
    if (details && details.total > 0) {
      sentimentScore = details.score;
      bullishPct = Math.round(details.bullishPct || 0);
      bearishPct = Math.round(details.bearishPct || 0);
    }
  } catch (_) {
    // ignore - fallback handled on frontend
  }

  const now = new Date();
  const expiryDate = expiry ? new Date(expiry) : null;
  let status = 'open';
  let resolvedOutcome = null;
  let resolvedAt = null;
  if (expiryDate && expiryDate <= now) {
    // expired - if resolution info present mark resolved
    if (resolution && (resolution.winner || resolution.winningOutcome || resolution.outcome)) {
      status = 'resolved';
      resolvedOutcome = resolution.winner || resolution.winningOutcome || resolution.outcome || null;
      resolvedAt = resolution.resolvedAt ? new Date(resolution.resolvedAt) : now;
    } else if (raw.state === 'resolved' || raw.resolved === true) {
      status = 'resolved';
      resolvedOutcome = raw.winner || null;
      resolvedAt = raw.resolvedAt ? new Date(raw.resolvedAt) : now;
    } else {
      status = 'closed';
    }
  }

  // compute removedAt: when market becomes closed/resolved, schedule removal after 48h
  let removedAt = null;
  if ((status === 'closed' || status === 'resolved') && !raw._keepVisible) {
    removedAt = new Date(Date.now() + REMOVE_AFTER_MS);
  }

  const update = {
    marketId: String(id),
    title,
    outcomes,
    prices,
    volume,
    liquidity,
    resolution,
    expiry: expiryDate,
    status,
    category,
    sentimentScore,
    bullishPct,
    bearishPct,
    resolvedOutcome,
    resolvedAt,
    removedAt,
    raw
  };

  const doc = await Market.findOneAndUpdate({ marketId: String(id) }, update, { upsert: true, new: true, setDefaultsOnInsert: true });

  // If newly resolved, ensure stats and winrate update
  if (status === 'resolved' && doc) {
    await ensureStatsAndWinrate(doc);
  }

  return doc;
}

async function ensureStatsAndWinrate(marketDoc) {
  if (!marketDoc || !marketDoc.marketId) return;
  // create Stats entry if not exists
  const existing = await Stats.findOne({ marketId: marketDoc.marketId });
  if (!existing) {
    const s = new Stats({ marketId: marketDoc.marketId, title: marketDoc.title, finalOutcome: marketDoc.resolvedOutcome, sentimentAtTheTime: { bullishPct: marketDoc.bullishPct, bearishPct: marketDoc.bearishPct }, category: marketDoc.category, resolvedAt: marketDoc.resolvedAt || new Date() });
    await s.save();

    // update winrate counters
    let wr = await WinRate.findOne();
    if (!wr) {
      wr = new WinRate({ bullishWins: 0, bearishWins: 0, total: 0 });
    }
    // Determine which side won and whether sentiment predicted it
    // For simplicity, if bullishPct > bearishPct, sentiment predicted bullish
    const bullishSignal = (marketDoc.bullishPct || 0) > (marketDoc.bearishPct || 0);
    const finalWinnerIsBullish = (() => {
      // Try to infer: if resolvedOutcome matches an outcome name that indicates 'yes' or similar, we treat as bullish.
      const ro = String(marketDoc.resolvedOutcome || '').toLowerCase();
      if (!ro) return null;
      if (ro.includes('yes') || ro.includes('true') || ro.includes('will') || ro.includes('over')) return true;
      if (ro.includes('no') || ro.includes('false') || ro.includes('will not') || ro.includes('under')) return false;
      return null;
    })();

    if (finalWinnerIsBullish === true) {
      if (bullishSignal) wr.bullishWins += 1; else wr.bearishWins += 0;
    } else if (finalWinnerIsBullish === false) {
      if (!bullishSignal) wr.bearishWins += 1; else wr.bullishWins += 0;
    } else {
      // We cannot determine mapping; as conservative, increment total only
    }
    wr.total = (wr.total || 0) + 1;
    await wr.save();
  }
}

async function syncMarkets() {
  await connect();
  try {
    const markets = await polymarketService.getMarkets();
    for (const m of markets) {
      try { await upsertMarketFromRaw(m); } catch (err) { /* continue */ }
    }

    // cleanup expired removedAt
    const now = new Date();
    await Market.updateMany({ removedAt: { $lte: now } }, { $set: { status: 'removed' } });
  } catch (err) {
    console.error('syncMarkets error:', err && err.message ? err.message : err);
  }
}

async function listActiveMarkets(filter = {}) {
  await connect();
  const now = new Date();
  // only show markets that are not removed (removedAt in future or null) and status != 'removed'
  const q = Object.assign({}, filter, { $or: [ { removedAt: null }, { removedAt: { $gt: now } } ], status: { $ne: 'removed' } });
  return Market.find(q).sort({ expiry: 1 }).lean().exec();
}

async function getMarketsByCategory(category) {
  if (!category) return [];
  return listActiveMarkets({ category });
}

async function getStatsAndWinrates() {
  await connect();
  const stats = await Stats.find({}).sort({ resolvedAt: -1 }).lean().exec();
  const wr = await WinRate.findOne().lean().exec();
  const computed = wr || { bullishWins: 0, bearishWins: 0, total: 0 };
  const bullishWinRate = computed.total ? (computed.bullishWins / computed.total) * 100 : 0;
  const bearishWinRate = computed.total ? (computed.bearishWins / computed.total) * 100 : 0;
  const totalWinRate = computed.total ? ((computed.bullishWins + computed.bearishWins) / computed.total) * 100 : 0;
  return { stats, winrate: { bullishWins: computed.bullishWins, bearishWins: computed.bearishWins, total: computed.total, bullishWinRate, bearishWinRate, totalWinRate } };
}

module.exports = { syncMarkets, upsertMarketFromRaw, listActiveMarkets, getMarketsByCategory, getStatsAndWinrates };
