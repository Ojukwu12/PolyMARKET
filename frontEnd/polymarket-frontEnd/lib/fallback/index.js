export function fallbackPercentages(title = '') {
  const t = String(title).toLowerCase()
  let bullish = 50
  let bearish = 50
  const bearWords = ['crash','collapse','war','recession']
  const bullWords = ['growth','win','increase','approval']
  if (bearWords.some(w => t.includes(w))) { bearish += 20; bullish -= 20 }
  if (bullWords.some(w => t.includes(w))) { bullish += 20; bearish -= 20 }
  // keep within bounds
  bullish = Math.max(0, Math.min(100, bullish))
  bearish = Math.max(0, Math.min(100, bearish))
  // tiny random bias so it's never perfectly neutral
  const r = (Math.random() * 6) - 3
  if (r > 0) bullish = Math.min(100, bullish + r); else bearish = Math.min(100, bearish + Math.abs(r))
  // normalize if sum != 100
  const sum = bullish + bearish
  if (sum !== 100) { bullish = (bullish / sum) * 100; bearish = (bearish / sum) * 100 }
  return { bullish, bearish }
}
