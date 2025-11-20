const { ADMIN_API_KEY } = require('../config/env');

function apiKeyAuth(req, res, next) {
  const key = req.header('x-api-key') || req.query.api_key;
  if (!ADMIN_API_KEY) return res.status(403).json({ ok: false, error: 'admin auth not configured' });
  if (!key || key !== ADMIN_API_KEY) return res.status(401).json({ ok: false, error: 'invalid api key' });
  next();
}

module.exports = apiKeyAuth;
