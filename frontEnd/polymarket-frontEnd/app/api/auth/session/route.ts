import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ ok: false, error: text || `status ${res.status}` }, { status: 400 })
    }
    const json = await res.json()
    const token = json.token
    if (!token) return NextResponse.json({ ok: false, error: 'no token from auth verify' }, { status: 500 })

    const response = NextResponse.json({ ok: true })
    // Set HttpOnly cookie for server-side session
    response.cookies.set('admin_jwt', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    })
    return response
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 })
  }
}
