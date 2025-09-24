import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'

const storePath = path.join(process.cwd(), 'data', 'crm2-activities.json')

function readStore(): any[] {
  try {
    if (!fs.existsSync(storePath)) return []
    return JSON.parse(fs.readFileSync(storePath, 'utf8') || '[]')
  } catch { return [] }
}
function writeStore(rows: any[]) {
  try {
    const dir = path.dirname(storePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(storePath, JSON.stringify(rows, null, 2), 'utf8')
  } catch {}
}

export async function GET() {
  try {
    const db = (prisma as any)
    if (db?.activity?.findMany) {
      const rows = await db.activity.findMany({ orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }] })
      return NextResponse.json({ ok: true, data: rows })
    }
  } catch {}
  return NextResponse.json({ ok: true, data: readStore() })
}

export async function POST(req: Request) {
  const b = await req.json().catch(()=> ({}))
  const now = new Date()
  const row = {
    id: b.id,
    leadId: String(b.leadId || '').trim(),
    type: String(b.type || 'note'),
    content: String(b.content || ''),
    dueAt: b.dueAt ? new Date(b.dueAt) : null,
    completedAt: null,
    createdAt: now
  }
  if (!row.leadId) return NextResponse.json({ ok:false, error:'leadId-required' }, { status: 400 })
  try {
    const db = (prisma as any)
    if (db?.activity?.create) {
      const created = await db.activity.create({ data: {
        leadId: row.leadId,
        type: row.type,
        content: row.content,
        dueAt: row.dueAt
      } })
      return NextResponse.json({ ok:true, data: created })
    }
  } catch {}
  const rows = readStore(); rows.unshift({ ...row, id: row.id || `act_${Date.now()}` }); writeStore(rows)
  return NextResponse.json({ ok:true, data: rows[0] })
}

export async function PATCH(req: Request) {
  const b = await req.json().catch(()=> ({}))
  const id = String(b.id || '').trim()
  if (!id) return NextResponse.json({ ok:false, error:'id-required' }, { status:400 })
  try {
    const db = (prisma as any)
    if (db?.activity?.update) {
      const updated = await db.activity.update({ where: { id }, data: {
        dueAt: b.snoozeDays !== undefined ? new Date(Date.now() + Number(b.snoozeDays||0)*24*60*60*1000) : (b.dueAt === undefined ? undefined : (b.dueAt ? new Date(b.dueAt) : null)),
        completedAt: b.complete ? new Date() : (b.completedAt === undefined ? undefined : b.completedAt)
      } })
      return NextResponse.json({ ok:true, data: updated })
    }
  } catch {}
  const rows = readStore()
  const idx = rows.findIndex(r=> String(r.id)===id)
  if (idx<0) return NextResponse.json({ ok:false, error:'not-found' }, { status:404 })
  if (b.snoozeDays !== undefined) rows[idx].dueAt = new Date(Date.now() + Number(b.snoozeDays||0)*24*60*60*1000)
  if (b.complete) rows[idx].completedAt = new Date()
  writeStore(rows)
  return NextResponse.json({ ok:true, data: rows[idx] })
}


