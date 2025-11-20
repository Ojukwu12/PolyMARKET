"use client"
import React, { useState } from 'react'

export default function AdminDashboard() {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')
  const metricsUrl = API_BASE ? `${API_BASE}/admin/metrics` : `/admin/metrics`
  const refreshUrl = API_BASE ? `${API_BASE}/admin/refresh` : `/admin/refresh`
  const nonceUrl = API_BASE ? `${API_BASE}/auth/nonce` : `/auth/nonce`
  const verifyUrl = API_BASE ? `${API_BASE}/auth/verify` : `/auth/verify`

  async function fetchMetrics() {
    setLoading(true)
    setError(null)
    try {
      const headers: any = {}
      if (apiKey) headers['x-api-key'] = apiKey
      if (authToken) headers['authorization'] = `Bearer ${authToken}`
      const res = await fetch(metricsUrl, { headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setMetrics(json)
    } catch (err: any) {
      setError(err.message || String(err))
      setMetrics(null)
    } finally {
      setLoading(false)
    }
  }

  async function doRefresh() {
    setLoading(true)
    setError(null)
    try {
      const headers: any = { 'content-type': 'application/json' }
      if (apiKey) headers['x-api-key'] = apiKey
      if (authToken) headers['authorization'] = `Bearer ${authToken}`
      const res = await fetch(refreshUrl, { method: 'POST', headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setMetrics(prev => ({ ...prev, refresh: json }))
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  async function signInWithWallet() {
    setLoading(true)
    setError(null)
    try {
      if (!(window as any).ethereum) throw new Error('No web3 provider found')
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]
      const nonceRes = await fetch(`${nonceUrl}?address=${address}`)
      if (!nonceRes.ok) throw new Error('failed to get nonce')
      const { nonce } = await nonceRes.json()
      const message = `Sign this nonce to authenticate: ${nonce}`
      const signature = await (window as any).ethereum.request({ method: 'personal_sign', params: [message, address] })
      // Hybrid flow: send signature to Next API route which will exchange with backend and set an HttpOnly cookie
      const sessionRes = await fetch('/api/auth/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ address, signature }) })
      if (!sessionRes.ok) throw new Error('session creation failed')
      // reload so server-side admin page picks up the new session cookie
      window.location.reload()
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>API Key</label>
        <input style={{ width: '100%', padding: 8 }} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Enter admin API key" />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={fetchMetrics} disabled={(!apiKey && !authToken) || loading}>Get Metrics</button>
        <button onClick={doRefresh} disabled={(!apiKey && !authToken) || loading}>Refresh Cache</button>
        <button onClick={signInWithWallet} disabled={loading}>Sign in with Wallet</button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {metrics && (
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 12 }}>{JSON.stringify(metrics, null, 2)}</pre>
      )}
    </div>
  )
}
