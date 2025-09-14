import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Rate limiting store (in-memory for now)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export async function POST(req: NextRequest) {
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  
  // Rate limiting: max 5 attempts per IP per 15 minutes
  const now = Date.now()
  const attempts = loginAttempts.get(clientIP)
  if (attempts && attempts.count >= 5 && (now - attempts.lastAttempt) < 15 * 60 * 1000) {
    return NextResponse.json({ message: 'Too many login attempts. Try again later.' }, { status: 429 })
  }

  const { username, password } = await req.json().catch(()=>({}))
  
  // Get credentials from environment
  const adminUsername = process.env.ADMIN_USERNAME || 'adminboss'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin420!@'
  
  // For now, compare plaintext (will hash in production)
  const isValidUsername = username === adminUsername
  const isValidPassword = password === adminPassword
  
  if (isValidUsername && isValidPassword) {
    // Reset rate limiting on successful login
    loginAttempts.delete(clientIP)
    
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_auth', 'true', { 
      httpOnly: true, 
      path: '/', 
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 // 24 hours
    })
    return res
  }
  
  // Track failed attempt
  const currentAttempts = attempts?.count || 0
  loginAttempts.set(clientIP, { count: currentAttempts + 1, lastAttempt: now })
  
  return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
}


