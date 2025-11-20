// src/services/liquidity.service.js
function computeLiquidityFactor(market) {
  if (!market || typeof market !== 'object') return 0.5;
  let candidate = 0;
  const consider = [];
  for (const [k, v] of Object.entries(market)) {
    if (typeof v === 'number' && isFinite(v) && v >= 0) {
      const key = String(k).toLowerCase();
      if (key.includes('liquidity') || key.includes('volume') || key.includes('openinterest') || key.includes('open_interest')) {
        consider.push(v);
      }
    } else if (v && typeof v === 'object') {
      for (const [k2, v2] of Object.entries(v)) {
        if (typeof v2 === 'number' && isFinite(v2) && v2 >= 0) {
          const key2 = String(k2).toLowerCase();
          if (key2.includes('liquidity') || key2.includes('volume') || key2.includes('openinterest') || key2.includes('open_interest')) {
            consider.push(v2);
          }
        }
      }
    }
  }
  if (consider.length > 0) candidate = Math.max(...consider);
  const cap = 100000; // soft cap in USD-equivalent units
  const factor = Math.log10(1 + candidate) / Math.log10(1 + cap);
  if (!isFinite(factor) || factor < 0) return 0.5;
  if (factor > 1) return 1;
  return factor;
}

module.exports = { computeLiquidityFactor };
