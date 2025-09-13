import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, password } = body || {}
    if (!email || !password) return NextResponse.json({ message: 'Missing fields' }, { status: 400 })

    const dataPath = path.join(process.cwd(), 'src', 'data', 'users.json')
    let users: any[] = []
    if (fs.existsSync(dataPath)) users = JSON.parse(fs.readFileSync(dataPath, 'utf-8') || '[]')
    if (users.find(u => u.email?.toLowerCase() === String(email).toLowerCase())) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 })
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = { id: `u-${Date.now()}`, name: name || '', email, phone: phone || '', password: hashed, createdAt: new Date().toISOString() }
    users.push(user)
    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2), 'utf-8')

    // Append to email CSV for drip campaigns
    try {
      const csvPath = path.join(process.cwd(), 'src', 'data', 'email-list.csv')
      const header = 'name,email,phone,createdAt\n'
      if (!fs.existsSync(csvPath)) {
        fs.writeFileSync(csvPath, header, 'utf-8')
      }
      const row = `${JSON.stringify(user.name || '').replace(/"/g,'')},${JSON.stringify(user.email || '').replace(/"/g,'')},${JSON.stringify(user.phone || '').replace(/"/g,'')},${user.createdAt}\n`
      fs.appendFileSync(csvPath, row, 'utf-8')
    } catch {}
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}
