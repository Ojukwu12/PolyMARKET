export function computeFinalSentiment({ bullish = null, bearish = null, title = '', volatilityAdjustment = 0, oddsTrendBonus = 0 }) {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0))
  const hasData = bullish != null && bearish != null
  let b = hasData ? clamp(bullish, 0, 100) : null
  let br = hasData ? clamp(bearish, 0, 100) : null
  let randomnessFactor = 0
  let finalScore = 0
  let result = 'Bearish'
  if (hasData) {
    const diff = b - br // positive -> bullish leaning
    // Only apply small randomness if diff is tight
    randomnessFactor = Math.abs(diff) < 5 ? (Math.random()*6 -3) : 0 // -3..+3
    finalScore = diff + randomnessFactor + volatilityAdjustment + oddsTrendBonus
    result = finalScore > 0 ? 'Bullish' : 'Bearish'
  } else {
    // No underlying data: synthetic generation
    b = 50; br = 50
    randomnessFactor = (Math.random()*20 - 10) // larger variability -10..+10
    finalScore = randomnessFactor + volatilityAdjustment + oddsTrendBonus
    result = finalScore >= 0 ? 'Bullish' : 'Bearish'
  }
  return { finalScore, result, randomnessFactor }
}

const KEY = 'pm_predictions'

export function getPredictions() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function addPrediction(pred) {
  if (typeof window === 'undefined') return
  const list = getPredictions()
  list.push(pred)
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {}
}

export function upsertOutcome(marketId, finalOutcome) {
  if (typeof window === 'undefined') return
  const list = getPredictions()
  let changed = false
  for (const it of list) {
    if (String(it.marketId) === String(marketId)) { it.finalOutcome = finalOutcome; changed = true }
  }
  if (changed) try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {}
  return list
}

export function computeStats(list) {
  const resolved = list.filter(x => x.finalOutcome === 'YES' || x.finalOutcome === 'NO')
  const total = resolved.length
  const wins = resolved.filter(x => (x.chosenSentiment === 'Bullish' && x.finalOutcome === 'YES') || (x.chosenSentiment === 'Bearish' && x.finalOutcome === 'NO')).length
  const bull = resolved.filter(x => x.chosenSentiment === 'Bullish')
  const bear = resolved.filter(x => x.chosenSentiment === 'Bearish')
  const bullWins = bull.filter(x => x.finalOutcome === 'YES').length
  const bearWins = bear.filter(x => x.finalOutcome === 'NO').length
  return {
    totalResolved: total,
    overallWinRate: total ? (wins / total) * 100 : 0,
    bullishAccuracy: bull.length ? (bullWins / bull.length) * 100 : 0,
    bearishAccuracy: bear.length ? (bearWins / bear.length) * 100 : 0,
  }
}
