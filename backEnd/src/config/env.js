// src/config/env.js
// Load environment variables for the backend
// In development, explicitly load the project .env and override any pre-set envs
const path = require('path');
const dotenv = require('dotenv');

const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  dotenv.config();
} else {
  const envPath = path.resolve(__dirname, '../../.env');
  dotenv.config({ path: envPath, override: true });
}

const envSrc = process.env;

const PORT = envSrc.PORT || 3000;
const POLYMARKET_API_URL = envSrc.POLYMARKET_API_URL || '';
const USE_MOCK_MARKETS = (envSrc.USE_MOCK_MARKETS === 'true') || false;
const CACHE_TTL = parseInt(envSrc.CACHE_TTL || '60', 10);
const ALLOWED_ORIGINS = envSrc.ALLOWED_ORIGINS || '*';
const NONCE_TTL = parseInt(envSrc.NONCE_TTL || '300', 10);
const MAX_SENTIMENT_MARKETS = parseInt(envSrc.MAX_SENTIMENT_MARKETS || '30', 10);
const USE_REDDIT = envSrc.USE_REDDIT !== 'false';
const FAST_MARKETS_LIMIT = parseInt(envSrc.FAST_MARKETS_LIMIT || '50', 10);
const MONGO_URI = envSrc.MONGO_URI || '';

module.exports = {
  PORT,
  POLYMARKET_API_URL,
  USE_MOCK_MARKETS,
  CACHE_TTL,
  ALLOWED_ORIGINS,
  NONCE_TTL,
  MAX_SENTIMENT_MARKETS,
  USE_REDDIT,
  FAST_MARKETS_LIMIT,
  MONGO_URI,
};
