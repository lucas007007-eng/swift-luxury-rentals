import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

const storePath = path.join(process.cwd(), 'data', 'crm2-leads.json')

function readFallback(): any[] {
  try {
    if (!fs.existsSync(storePath)) return []
    const raw = fs.readFileSync(storePath, 'utf8')
    return JSON.parse(raw || '[]')
  } catch {
    return []
  }
}

function writeFallback(rows: any[]) {
  try {
    const dir = path.dirname(storePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(storePath, JSON.stringify(rows, null, 2), 'utf8')
  } catch {}
}

export async function GET() {
  // Try database first
  try {
    const db = (prisma as any)
    if (db?.lead?.findMany) {
      const rows = await db.lead.findMany({ orderBy: { createdAt: 'desc' } })
      return NextResponse.json({ ok: true, data: rows })
    }
  } catch {}
  // Fallback JSON file
  const rows = readFallback()
  return NextResponse.json({ ok: true, data: rows })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const now = new Date()
  const lead = {
    id: body.id || `lead_${now.getTime()}`,
    name: String(body.name || '').trim(),
    email: String(body.email || '').trim(),
    phone: String(body.phone || '').trim(),
    company: String(body.company || '').trim(),
    city: String(body.city || '').trim(),
    budgetCents: Number(body.budgetCents || 0),
    stage: (body.stage || 'new') as string,
    nextActionAt: body.nextActionAt ? new Date(body.nextActionAt) : null,
    owner: String(body.owner || ''),
    createdAt: now,
    updatedAt: now
  }

  // Basic validation
  if (!lead.name) return NextResponse.json({ ok: false, error: 'name-required' }, { status: 400 })

  // Try database first
  try {
    const db = (prisma as any)
    if (db?.lead?.create) {
      const row = await db.lead.create({ data: lead })
      return NextResponse.json({ ok: true, data: row })
    }
  } catch {}

  // Fallback JSON file
  const rows = readFallback()
  rows.unshift(lead)
  writeFallback(rows)
  return NextResponse.json({ ok: true, data: lead })
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}))
  const id = String(body.id || '').trim()
  if (!id) return NextResponse.json({ ok: false, error: 'id-required' }, { status: 400 })
  const data: any = { ...body }
  delete data.id
  data.updatedAt = new Date()

  // Try DB
  try {
    const db = (prisma as any)
    if (db?.lead?.update) {
      const row = await db.lead.update({ where: { id }, data })
      return NextResponse.json({ ok: true, data: row })
    }
  } catch {}

  // Fallback JSON
  const rows = readFallback()
  const idx = rows.findIndex((r:any)=> r.id===id)
  if (idx>=0) {
    rows[idx] = { ...rows[idx], ...data }
    writeFallback(rows)
    return NextResponse.json({ ok: true, data: rows[idx] })
  }
  return NextResponse.json({ ok: false, error: 'not-found' }, { status: 404 })
}


