// src/utils/parseMarkets.js
// Normalize Polymarket responses into an array of market objects (no slicing)
function parseMarkets(json) {
  let markets = [];
  if (Array.isArray(json)) markets = json;
  else if (Array.isArray(json.markets)) markets = json.markets;
  else if (Array.isArray(json.data)) markets = json.data;
  else {
    for (const v of Object.values(json)) if (Array.isArray(v)) { markets = v; break; }
  }
  return markets;
}

module.exports = parseMarkets;
