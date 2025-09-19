import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

type RegisterBody = {
  name?: string
  email?: string
  phone?: string
  password?: string
}


export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterBody
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim().toLowerCase()
    const phone = String(body?.phone || '').trim()
    const password = String(body?.password || '')

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 })
    }
    const emailOk = /.+@.+\..+/.test(email)
    if (!emailOk) return NextResponse.json({ message: 'Invalid email' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 })

    // Check for existing user in database
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 })
    }

    // Hash password
    const rounds = Number(process.env.PASSWORD_SALT_ROUNDS || 10)
    const hash = await bcrypt.hash(password, rounds)

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hash,
      }
    })

    // Return user without password
    const { password: _pw, ...safeUser } = user
    return NextResponse.json({ user: safeUser }, { status: 201 })
  } catch (e: any) {
    console.error('Registration error:', e)
    return NextResponse.json({ message: 'Registration failed' }, { status: 500 })
  }
}
