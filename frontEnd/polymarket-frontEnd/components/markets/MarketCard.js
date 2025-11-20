"use client";
import { useState } from 'react'
import { computeFinalSentiment, addPrediction } from '../../lib/sentiment'
import { fallbackPercentages } from '../../lib/fallback'

export default function MarketCard({ m }) {
  const [final, setFinal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const title = m?.question || 'Untitled market'
  const oddsStr = m?.odds != null ? Number(m.odds).toFixed(2) : '—'
  const bullish = (m?.bullishPct != null) ? Math.round(Number(m.bullishPct)) : null
  const bearish = (m?.bearishPct != null) ? Math.round(Number(m.bearishPct)) : null

  async function onLoad() {
    setLoading(true); setError(null)
    try {
      let b = bullish, br = bearish
      if (b == null || br == null) {
        const fb = fallbackPercentages(title)
        b = Math.round(fb.bullish); br = Math.round(fb.bearish)
      }
      const { finalScore, result } = computeFinalSentiment({ bullish: b, bearish: br, title })
      setFinal({ finalScore, result })
      addPrediction({
        marketId: m?.id || null,
        title,
        chosenSentiment: result,
        timestamp: Date.now(),
        bullish: b,
        bearish: br,
      })
    } catch (e) {
      setError(e?.message || String(e))
    } finally { setLoading(false) }
  }

  return (
    <div className="card">
      <div className="card-title mb-2 text-center">{title}</div>
      <div className="grid grid-cols-2 gap-3 items-center justify-items-center">
        <div>
          <div className="card-meta text-center">Odds</div>
          <div className="text-lg font-medium text-center">{oddsStr}</div>
        </div>
        <div>
          <div className="card-meta text-center">Bullish / Bearish</div>
          <div className="text-lg font-medium text-center">{bullish != null ? bullish : '—'}% / {bearish != null ? bearish : '—'}%</div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 mt-4">
        <button className="btn" onClick={onLoad} disabled={loading}>{loading ? 'Loading…' : 'Load Sentiment'}</button>
        {error && <span className="muted">{error}</span>}
      </div>
      {final && (
        <div className="mt-4 text-center">
          <div className={`inline-block badge ${final.result === 'Bullish' ? 'badge-pos' : 'badge-neg'}`}>{final.result}</div>
        </div>
      )}
    </div>
  )
}
