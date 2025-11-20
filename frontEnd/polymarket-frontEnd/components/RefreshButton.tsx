"use client"
import React, { useState } from 'react'

export default function RefreshButton() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function doRefresh() {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/refresh', { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setMsg(JSON.stringify(json))
    } catch (err: any) {
      setMsg(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button className="btn" onClick={doRefresh} disabled={loading}>{loading ? 'Refreshing…' : 'Trigger Refresh'}</button>
      {msg && <div className="mt-2 text-sm text-[#9aa6bf]"><small>{msg}</small></div>}
    </div>
  )
}
