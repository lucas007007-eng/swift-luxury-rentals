import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json().catch(()=>({}))
  if (username === 'adminboss' && password === 'Admin420!@') {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_auth', 'true', { httpOnly: true, path: '/', sameSite: 'lax' })
    return res
  }
  return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
}


