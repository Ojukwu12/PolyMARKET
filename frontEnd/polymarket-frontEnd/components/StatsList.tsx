"use client"
import React, { useEffect, useState } from 'react'

type Item = {
  marketId: string | null,
  outcome: string,
  count: number,
  sentimentAvg: number | null
}

export default function StatsList() {
  const [items, setItems] = useState<Item[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')
        const url = API_BASE ? `${API_BASE}/api/stats/most-picked?limit=20` : `/api/stats/most-picked?limit=20`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (mounted) setItems(json.data || [])
      } catch (err: any) {
        if (mounted) setError(err.message || String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="muted">Loading...</div>
  if (error) return <div style={{ color: 'salmon' }}>Error: {error}</div>
  if (!items || items.length === 0) return <div className="muted">No items found</div>

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-[#9aa6bf] uppercase text-xs">
            <tr>
              <th className="px-3 py-2">Market</th>
              <th className="px-3 py-2">Outcome</th>
              <th className="px-3 py-2 text-right">Mentions</th>
              <th className="px-3 py-2 text-right">Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white/1' : ''}>
                <td className="px-3 py-2 align-top">{it.marketId || '-'}</td>
                <td className="px-3 py-2 align-top">{it.outcome}</td>
                <td className="px-3 py-2 text-right align-top font-medium">{it.count}</td>
                <td className="px-3 py-2 text-right align-top">
                  {it.sentimentAvg === null ? '-' : (
                    <span className={`badge ${it.sentimentAvg > 0.1 ? 'badge-pos' : (it.sentimentAvg < -0.1 ? 'badge-neg' : 'badge-neu')}`}>
                      {it.sentimentAvg.toFixed(2)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
