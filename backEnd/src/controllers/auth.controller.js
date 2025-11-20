const cache = require('../utils/cache');
const jwt = require('jsonwebtoken');
const { ADMIN_JWT_SECRET, NONCE_TTL } = require('../config/env');
const { ethers } = require('ethers');

function makeNonce() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function getNonce(req, res) {
  try {
    const address = (req.query.address || '').toLowerCase();
    if (!address) return res.status(400).json({ ok: false, error: 'address required' });
    const nonce = makeNonce();
    cache.set(`nonce::${address}`, nonce, NONCE_TTL);
    res.json({ ok: true, nonce });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'failed to generate nonce' });
  }
}

async function verifySignature(req, res) {
  try {
    const { address, signature } = req.body || {};
    if (!address || !signature) return res.status(400).json({ ok: false, error: 'address and signature required' });
    const addr = String(address).toLowerCase();
    const nonce = cache.get(`nonce::${addr}`);
    if (!nonce) return res.status(400).json({ ok: false, error: 'nonce expired or missing' });

    const message = `Sign this nonce to authenticate: ${nonce}`;
    let recovered;
    try {
      recovered = ethers.utils.verifyMessage(message, signature).toLowerCase();
    } catch (err) {
      return res.status(400).json({ ok: false, error: 'invalid signature' });
    }

    if (recovered !== addr) return res.status(401).json({ ok: false, error: 'signature does not match address' });

    // issue JWT
    if (!ADMIN_JWT_SECRET) return res.status(500).json({ ok: false, error: 'server not configured for JWT auth' });
    const token = jwt.sign({ address: addr, admin: true }, ADMIN_JWT_SECRET, { expiresIn: '1h' });
    // consume nonce
    cache.del(`nonce::${addr}`);
    res.json({ ok: true, token });
  } catch (err) {
    console.error('auth.verifySignature error:', err && err.message ? err.message : err);
    res.status(500).json({ ok: false, error: 'verification failed' });
  }
}

module.exports = { getNonce, verifySignature };
