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
      const rows = await db.lead.findMany({
        orderBy: { createdAt: 'desc' },
        include: { stageHistory: { orderBy: { changedAt: 'desc' }, take: 1 } }
      })
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

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const id = String(body.id || '').trim()
    const ids = body.ids || [] // Support bulk deletion
    
    if (!id && (!Array.isArray(ids) || ids.length === 0)) {
      return NextResponse.json({ ok: false, error: 'id-or-ids-required' }, { status: 400 })
    }
    
    const idsToDelete = id ? [id] : ids
    let deletedCount = 0
    
    // Try database first
    try {
      const db = (prisma as any)
      if (db?.lead?.deleteMany) {
        // Delete leads and related data
        await Promise.all([
          // Delete lead stage history
          db.leadStageHistory.deleteMany({ where: { leadId: { in: idsToDelete } } }),
          // Delete activities
          db.activity.deleteMany({ where: { leadId: { in: idsToDelete } } }),
          // Delete deals
          db.deal.deleteMany({ where: { leadId: { in: idsToDelete } } })
        ])
        
        // Delete the leads themselves
        const result = await db.lead.deleteMany({ where: { id: { in: idsToDelete } } })
        deletedCount = result.count
        
        // Publish deletion events
        idsToDelete.forEach((leadId: string) => {
          try { publish({ type: 'lead.deleted', data: { id: leadId } }) } catch {}
        })
        
        // Trigger CRM cache invalidation
        ;(global as any).__crmLastUpdate = Date.now()
        
        console.log(`[CRM] Permanently deleted ${deletedCount} leads and related data`)
        return NextResponse.json({ ok: true, deletedCount })
      }
    } catch (dbError) {
      console.error('Database deletion failed:', dbError)
    }
    
    // Fallback JSON file deletion
    try {
      const rows = readFallback()
      const filteredRows = rows.filter((r: any) => !idsToDelete.includes(r.id))
      deletedCount = rows.length - filteredRows.length
      writeFallback(filteredRows)
      
      // Publish deletion events
      idsToDelete.forEach((leadId: string) => {
        try { publish({ type: 'lead.deleted', data: { id: leadId } }) } catch {}
      })
      
      console.log(`[CRM] Permanently deleted ${deletedCount} leads from JSON fallback`)
      return NextResponse.json({ ok: true, deletedCount })
    } catch (fileError) {
      console.error('JSON file deletion failed:', fileError)
    }
    
    return NextResponse.json({ ok: false, error: 'deletion-failed' }, { status: 500 })
  } catch (e: any) {
    console.error('Lead deletion error:', e)
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}


