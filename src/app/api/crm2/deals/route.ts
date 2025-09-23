import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const storePath = path.join(process.cwd(), 'data', 'crm2-deals.json')
const read = () => { try { if (!fs.existsSync(storePath)) return []; return JSON.parse(fs.readFileSync(storePath,'utf8')||'[]') } catch { return [] } }
const write = (rows:any[]) => { try { const dir=path.dirname(storePath); if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(storePath, JSON.stringify(rows,null,2),'utf8') } catch {} }

export async function GET() { return NextResponse.json({ ok:true, data: read() }) }

export async function POST(req: Request) {
  const b = await req.json().catch(()=> ({}))
  const now = new Date()
  const row = {
    id: b.id || `deal_${now.getTime()}`,
    leadId: String(b.leadId||'').trim(),
    propertyExtId: String(b.propertyExtId||'').trim(),
    city: String(b.city||'').trim(),
    currency: 'EUR',
    termMonths: Number(b.termMonths||1),
    monthlyRateCents: Number(b.monthlyRateCents||0),
    depositCents: Number(b.depositCents||0),
    moveInFeeCents: Number(b.moveInFeeCents||0),
    startDate: b.startDate || null,
    status: 'offer',
    createdAt: now
  }
  if (!row.leadId || !row.propertyExtId || row.monthlyRateCents<=0) {
    return NextResponse.json({ ok:false, error:'invalid-fields' }, { status: 400 })
  }
  const rows = read(); rows.unshift(row); write(rows)
  return NextResponse.json({ ok:true, data: row })
}


