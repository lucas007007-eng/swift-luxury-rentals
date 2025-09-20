import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const auth = req.cookies.get('admin_auth')?.value
    if (auth === 'true') return NextResponse.next()
    // Check NextAuth JWT token as fallback
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
      if (token) return NextResponse.next()
    } catch {}
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}


