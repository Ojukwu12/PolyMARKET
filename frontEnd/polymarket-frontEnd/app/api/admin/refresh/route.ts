import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
  const ADMIN_KEY = process.env.NEXT_ADMIN_API_KEY || ''
  if (!ADMIN_KEY) return NextResponse.json({ ok: false, error: 'server admin key not configured' }, { status: 500 })

  try {
    const res = await fetch(`${API_BASE}/admin/refresh`, { method: 'POST', headers: { 'x-api-key': ADMIN_KEY } })
    const json = await res.json()
    return NextResponse.json(json, { status: res.status })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 })
  }
}
