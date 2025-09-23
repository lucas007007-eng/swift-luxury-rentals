import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'

const storePath = path.join(process.cwd(), 'data', 'crm2-companies.json')
const read = () => { try { if (!fs.existsSync(storePath)) return []; return JSON.parse(fs.readFileSync(storePath,'utf8')||'[]') } catch { return [] } }
const write = (rows:any[]) => { try { const dir=path.dirname(storePath); if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(storePath, JSON.stringify(rows,null,2),'utf8') } catch {} }

export async function GET() {
  try {
    const db = (prisma as any)
    if (db?.company?.findMany) {
      const rows = await db.company.findMany({ orderBy: { createdAt: 'desc' } })
      return NextResponse.json({ ok:true, data: rows })
    }
  } catch {}
  return NextResponse.json({ ok:true, data: read() })
}

export async function POST(req: Request) {
  const b = await req.json().catch(()=> ({}))
  const now = new Date()
  const row = { id: b.id, name: String(b.name||'').trim(), domain: String(b.domain||'').trim(), notes: String(b.notes||'').trim(), createdAt: now, updatedAt: now }
  if (!row.name) return NextResponse.json({ ok:false, error:'name-required' }, { status: 400 })

  try {
    const db = (prisma as any)
    if (db?.company?.create) {
      const created = await db.company.create({ data: { name: row.name, domain: row.domain || null, notes: row.notes || null } })
      return NextResponse.json({ ok:true, data: created })
    }
  } catch {}

  const rows = read(); rows.unshift({ ...row, id: row.id || `co_${now.getTime()}` }); write(rows)
  return NextResponse.json({ ok:true, data: rows[0] })
}


