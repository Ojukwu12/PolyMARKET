// src/services/odds.service.js
function getOddsFromMarket(m) {
  if (!m) return null;
  if (typeof m.lastTradePrice === 'number') return m.lastTradePrice;
  if (typeof m.lastPrice === 'number') return m.lastPrice;
  if (typeof m.probability === 'number') return m.probability;
  if (m.bestOutcome && typeof m.bestOutcome.probability === 'number') return m.bestOutcome.probability;
  for (const k of Object.keys(m)) {
    if (typeof m[k] === 'number' && m[k] >= 0 && m[k] <= 1) return m[k];
  }
  return null;
}

function getHighestOutcomeProbability(m) {
  if (!m) return null;
  const outcomes = Array.isArray(m.outcomes) ? m.outcomes : (Array.isArray(m.outcome) ? m.outcome : []);
  if (!Array.isArray(outcomes) || outcomes.length === 0) return null;
  let max = null;
  for (const o of outcomes) {
    if (!o) continue;
    // try common numeric fields
    const candidates = [o.probability, o.prob, o.price, o.lastPrice, o.probability_estimate];
    for (const c of candidates) {
      if (typeof c === 'number' && c >= 0 && c <= 1) {
        if (max === null || c > max) max = c;
      }
    }
  }
  return max;
}

module.exports = { getOddsFromMarket, getHighestOutcomeProbability };
