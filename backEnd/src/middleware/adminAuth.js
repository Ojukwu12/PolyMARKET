const apiKeyAuth = require('./apiKeyAuth');
const jwtAuth = require('./jwtAuth');

// Composite admin auth: allow either valid x-api-key OR a valid Bearer JWT
module.exports = function adminAuth(req, res, next) {
  // Try API key first
  const key = req.header('x-api-key') || req.query.api_key;
  const { ADMIN_API_KEY } = require('../config/env');
  if (ADMIN_API_KEY && key && key === ADMIN_API_KEY) return next();

  // Otherwise try JWT
  // jwtAuth sends 401/500 responses itself, so call it
  return jwtAuth(req, res, next);
};
