import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'

const storePath = path.join(process.cwd(), 'data', 'crm2-deals.json')
const read = () => { try { if (!fs.existsSync(storePath)) return []; return JSON.parse(fs.readFileSync(storePath,'utf8')||'[]') } catch { return [] } }
const write = (rows:any[]) => { try { const dir=path.dirname(storePath); if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(storePath, JSON.stringify(rows,null,2),'utf8') } catch {} }

export async function GET() {
  try {
    const db = (prisma as any)
    if (db?.deal?.findMany) {
      const rows = await db.deal.findMany({ orderBy: { createdAt: 'desc' } })
      return NextResponse.json({ ok:true, data: rows })
    }
  } catch {}
  return NextResponse.json({ ok:true, data: read() })
}

export async function POST(req: Request) {
  const b = await req.json().catch(()=> ({}))
  const now = new Date()
  const row = {
    id: b.id || undefined,
    leadId: String(b.leadId||'').trim(),
    propertyExtId: String(b.propertyExtId||'').trim(),
    city: String(b.city||'').trim(),
    termMonths: Number(b.termMonths||1),
    monthlyRateCents: Number(b.monthlyRateCents||0),
    depositCents: Number(b.depositCents||0),
    moveInFeeCents: Number(b.moveInFeeCents||0),
    startDate: b.startDate ? new Date(b.startDate) : null,
    status: 'offer',
    createdAt: now
  }
  if (!row.leadId || !row.propertyExtId || row.monthlyRateCents<=0) {
    return NextResponse.json({ ok:false, error:'invalid-fields' }, { status: 400 })
  }
  try {
    const db = (prisma as any)
    if (db?.deal?.create) {
      const created = await db.deal.create({ data: {
        leadId: row.leadId,
        propertyExtId: row.propertyExtId,
        city: row.city || null,
        termMonths: row.termMonths,
        monthlyRateCents: row.monthlyRateCents,
        depositCents: row.depositCents,
        moveInFeeCents: row.moveInFeeCents,
        startDate: row.startDate,
        status: 'offer'
      } })
      return NextResponse.json({ ok:true, data: created })
    }
  } catch {}

  const rows = read(); rows.unshift({ ...row, id: row.id || `deal_${Date.now()}` }); write(rows)
  return NextResponse.json({ ok:true, data: rows[0] })
}


