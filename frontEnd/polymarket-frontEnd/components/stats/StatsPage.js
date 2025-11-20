"use client";
import { useEffect, useState } from 'react'
import { getPredictions, computeStats, upsertOutcome } from '../../lib/sentiment'

export default function StatsPage() {
  const [preds, setPreds] = useState([])
  const [summary, setSummary] = useState({ totalResolved: 0, overallWinRate: 0, bullishAccuracy: 0, bearishAccuracy: 0 })
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const list = getPredictions()
    setPreds(list)
    setSummary(computeStats(list))
  }, [])

  async function syncResults() {
    setSyncing(true)
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')
      const url = base ? `${base}/api/markets/basic` : `/api/markets/basic`
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const markets = Array.isArray(data?.markets) ? data.markets : []
        // crude proxy: if current highest odds > 0.5, treat as YES, else NO (until resolution API is added)
        for (const p of preds) {
          const m = markets.find(x => String(x.id) === String(p.marketId))
          if (m) {
            const finalOutcome = (typeof m.odds === 'number' && m.odds > 0.5) ? 'YES' : 'NO'
            upsertOutcome(p.marketId, finalOutcome)
          }
        }
        const list = getPredictions()
        setPreds(list)
        setSummary(computeStats(list))
      }
    } catch {}
    finally { setSyncing(false) }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="card-title">Prediction Accuracy</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          <Stat label="Resolved" value={summary.totalResolved} />
          <Stat label="Overall Win" value={`${summary.overallWinRate.toFixed(0)}%`} />
          <Stat label="Bullish Win" value={`${summary.bullishAccuracy.toFixed(0)}%`} />
          <Stat label="Bearish Win" value={`${summary.bearishAccuracy.toFixed(0)}%`} />
        </div>
        <div className="mt-3">
          <button className="btn" onClick={syncResults} disabled={syncing}>{syncing ? 'Syncing…' : 'Sync Results'}</button>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Recent Predictions</h3>
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full text-sm">
            <thead className="text-left text-[#9aa6bf] uppercase text-xs">
              <tr>
                <th className="px-3 py-2">Market Title</th>
                <th className="px-3 py-2">Your Prediction</th>
                <th className="px-3 py-2">Final Outcome</th>
                <th className="px-3 py-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {preds.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center muted">No predictions yet. Use "Load Sentiment" on a market to create one.</td>
                </tr>
              )}
              {preds.slice().reverse().map((p, idx) => {
                const result = p.finalOutcome ? ((p.chosenSentiment === 'Bullish' && p.finalOutcome === 'YES') || (p.chosenSentiment === 'Bearish' && p.finalOutcome === 'NO') ? 'Win' : 'Loss') : 'Pending'
                return (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white/1' : ''}>
                    <td className="px-3 py-2 align-top">{p.title}</td>
                    <td className="px-3 py-2 align-top">{p.chosenSentiment}</td>
                    <td className="px-3 py-2 align-top">{p.finalOutcome || '—'}</td>
                    <td className="px-3 py-2 align-top">{result}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="card-meta">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}
