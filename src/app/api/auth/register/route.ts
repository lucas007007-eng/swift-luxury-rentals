import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcryptjs'

type RegisterBody = {
  name?: string
  email?: string
  phone?: string
  password?: string
}

function getUsersPath(): string {
  return path.join(process.cwd(), 'src', 'data', 'users.json')
}

function readUsers(): any[] {
  const p = getUsersPath()
  if (!fs.existsSync(p)) return []
  try { return JSON.parse(fs.readFileSync(p, 'utf-8') || '[]') } catch { return [] }
}

function writeUsers(users: any[]) {
  const p = getUsersPath()
  const dir = path.dirname(p)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(p, JSON.stringify(users, null, 2))
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

    // Load and check duplicates
    const users = readUsers()
    const exists = users.find((u) => String(u.email || '').toLowerCase() === email)
    if (exists) return NextResponse.json({ message: 'Email already registered' }, { status: 409 })

    // Hash password
    const rounds = Number(process.env.PASSWORD_SALT_ROUNDS || 10)
    const hash = await bcrypt.hash(password, rounds)

    const user = {
      id: `u-${Date.now()}`,
      name,
      email,
      phone,
      password: hash,
      createdAt: new Date().toISOString(),
    }

    users.push(user)
    writeUsers(users)

    // Append to email CSV for basic newsletter/testing (best-effort)
    try {
      const csvPath = path.join(process.cwd(), 'src', 'data', 'email-list.csv')
      const header = 'name,email,phone,createdAt\n'
      if (!fs.existsSync(csvPath)) fs.writeFileSync(csvPath, header, 'utf-8')
      const safeName = String(name || '').replace(/\n|\r|,/g, ' ').slice(0, 200)
      const safePhone = String(phone || '').replace(/\n|\r|,/g, ' ').slice(0, 100)
      const row = `${safeName},${email},${safePhone},${user.createdAt}\n`
      fs.appendFileSync(csvPath, row, 'utf-8')
    } catch {}

    // Do not return password hash
    const { password: _pw, ...safe } = user
    return NextResponse.json({ user: safe }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
  }
}
