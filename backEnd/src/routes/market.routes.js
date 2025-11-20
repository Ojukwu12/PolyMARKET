// src/routes/market.routes.js
const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');
const marketDbController = require('../controllers/marketDb.controller');

// Define GET /api/markets (full sentiment)
router.get('/api/markets', marketController.getMarkets);

// DB-backed endpoints
router.get('/markets', marketDbController.getActiveMarkets);
router.get('/markets/category/:category', marketDbController.getMarketsByCategory);
router.post('/sentiment', marketDbController.postSentiment);
// Lightweight markets (no sentiment loops) for stats sync
router.get('/api/markets/basic', async (req, res) => {
	try {
		const { getMarketsFast } = require('../services/polymarket.service');
		const oddsService = require('../services/odds.service');
		const markets = await getMarketsFast();
		const slim = markets.map(m => {
			const id = m.id || m.marketId || m._id || null;
			const question = m.question || m.title || m.name || '';
			const odds = oddsService.getOddsFromMarket(m);
			const outcomes = Array.isArray(m.outcomes) ? m.outcomes : (m.market_answers || m.choices || []);
			return { id, question, odds, outcomes };
		});
		res.json({ markets: slim });
	} catch (err) {
		res.status(500).json({ error: 'failed basic markets fetch', details: err && err.message ? err.message : String(err) });
	}
});
// GET single-market sentiment
router.get('/api/markets/:id/sentiment', marketController.getMarketSentiment);

// health
router.get('/', (req, res) => res.json({ status: 'ok' }));

module.exports = router;
