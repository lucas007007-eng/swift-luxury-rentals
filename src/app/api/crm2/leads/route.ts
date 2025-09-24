import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import fs from 'fs'
import path from 'path'
import { publish } from '@/lib/crm2Events'

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
  // Default owner from session if missing
  try {
    if (!lead.owner) {
      const session = await getServerSession(authOptions as any)
      const email = (session as any)?.user?.email
      if (email) (lead as any).owner = String(email)
    }
  } catch {}

  // Basic validation
  if (!lead.name) return NextResponse.json({ ok: false, error: 'name-required' }, { status: 400 })

  // Try database first
  try {
    const db = (prisma as any)
    if (db?.lead?.create) {
      const row = await db.lead.create({ data: lead })
      try { publish({ type: 'lead.created', data: row }) } catch {}
      return NextResponse.json({ ok: true, data: row })
    }
  } catch {}

  // Fallback JSON file
  const rows = readFallback()
  rows.unshift(lead)
  writeFallback(rows)
  try { publish({ type: 'lead.created', data: lead }) } catch {}
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
      const before = await db.lead.findUnique({ where: { id } })
      const row = await db.lead.update({ where: { id }, data })
      if (before && data.stage && before.stage !== data.stage) {
        try { await db.leadStageHistory.create({ data: { leadId: id, fromStage: before.stage, toStage: data.stage } }) } catch {}
      }
      try { publish({ type: 'lead.updated', data: row }) } catch {}
      return NextResponse.json({ ok: true, data: row })
    }
  } catch {}

  // Fallback JSON
  const rows = readFallback()
  const idx = rows.findIndex((r:any)=> r.id===id)
  if (idx>=0) {
    rows[idx] = { ...rows[idx], ...data }
    writeFallback(rows)
    try { publish({ type: 'lead.updated', data: rows[idx] }) } catch {}
    return NextResponse.json({ ok: true, data: rows[idx] })
  }
  return NextResponse.json({ ok: false, error: 'not-found' }, { status: 404 })
}


