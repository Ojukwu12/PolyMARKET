// app/health/page.tsx
export const dynamic = 'force-dynamic'

async function fetchHealth() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' })
    if (!res.ok) return { error: `backend returned ${res.status}`, data: null }
    const data = await res.json()
    return { data }
  } catch (e: any) {
    return { error: e?.message || String(e), data: null }
  }
}

function formatJSON(obj: any) {
  const json = JSON.stringify(obj, null, 2)
  return json.replace(/("[^"]+"\s*:)/g, '<span class="json-key">$1</span>')
             .replace(/(:\s*"[^"]*")/g, '<span class="json-string">$1</span>')
             .replace(/(:\s*\b(true|false|null)\b)/g, '<span class="json-bool">$1</span>')
             .replace(/(:\s*[-]?[0-9]+(\.[0-9]+)?)/g, '<span class="json-number">$1</span>')
}

export default async function HealthPage() {
  const { data, error } = await fetchHealth()
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-semibold">Backend Health</h2>
      <p className="muted">Status from <code>/health</code>.</p>
      {error && <div style={{ color: 'salmon', marginTop: 12 }}>{error}</div>}
      {data && (
        <div className="card mt-4">
          <div className="json-view" dangerouslySetInnerHTML={{ __html: formatJSON(data) }} />
        </div>
      )}
    </div>
  )
}
