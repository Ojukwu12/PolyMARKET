import RefreshButton from '../../components/RefreshButton'

// Server-rendered admin page — uses server-side secret (NEXT_ADMIN_API_KEY)
import { cookies } from 'next/headers'

export default async function AdminPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
  const ADMIN_KEY = process.env.NEXT_ADMIN_API_KEY || ''

  let metrics = null
  let error = null

  // Prefer server-side session cookie (wallet login) if present
  const cookieStore = cookies()
  const tokenCookie = cookieStore.get('admin_jwt')
  const token = tokenCookie ? tokenCookie.value : null

  try {
    if (token) {
      const res = await fetch(`${API_BASE}/admin/metrics`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      if (!res.ok) {
        error = `backend returned ${res.status}`
      } else {
        metrics = await res.json()
      }
    } else if (ADMIN_KEY) {
      const res = await fetch(`${API_BASE}/admin/metrics`, { headers: { 'x-api-key': ADMIN_KEY }, cache: 'no-store' })
      if (!res.ok) {
        error = `backend returned ${res.status}`
      } else {
        metrics = await res.json()
      }
    } else {
      error = 'No server admin key configured and no session found. Sign in with wallet or set NEXT_ADMIN_API_KEY.'
    }
  } catch (e: any) {
    error = e.message || String(e)
  }

  return (
    <div>
      <h2>Admin Dashboard (Server-side)</h2>
      <p className="muted">This page runs server-side and does not expose admin secrets to the browser.</p>

      <div style={{ marginTop: 12 }} className="card">
        {error && <div style={{ color: 'salmon' }}>{error}</div>}
        {metrics && <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(metrics, null, 2)}</pre>}
        <div style={{ marginTop: 12 }}>
          <RefreshButton />
        </div>
      </div>
    </div>
  )
}
