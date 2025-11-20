const statsService = require('../services/stats.service');

async function mostPicked(req, res) {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    const data = await statsService.getMostPicked(limit);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('stats.controller.mostPicked error:', err && err.message ? err.message : err);
    res.status(500).json({ ok: false, error: 'failed to compute stats' });
  }
}

module.exports = { mostPicked };
