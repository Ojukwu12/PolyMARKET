const jwt = require('jsonwebtoken');
const { ADMIN_JWT_SECRET } = require('../config/env');

function jwtAuth(req, res, next) {
  const header = req.header('authorization') || '';
  if (!header.toLowerCase().startsWith('bearer ')) return res.status(401).json({ ok: false, error: 'missing token' });
  const token = header.split(' ')[1];
  if (!ADMIN_JWT_SECRET) return res.status(500).json({ ok: false, error: 'jwt not configured' });
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ ok: false, error: 'invalid token' });
  }
}

module.exports = jwtAuth;
