const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const marketStore = require('../services/marketStore.service');

router.get('/most-picked', statsController.mostPicked);

// GET /api/stats -> resolved markets + win rates
router.get('/', async (req, res) => {
  try {
    const data = await marketStore.getStatsAndWinrates();
    res.json({ ok: true, data });
  } catch (err) {
    console.error('GET /stats error:', err && err.message ? err.message : err);
    res.status(500).json({ ok: false, error: 'failed to fetch stats' });
  }
});

module.exports = router;
