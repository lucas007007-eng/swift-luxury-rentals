import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'

const storePath = path.join(process.cwd(), 'data', 'crm2-companies.json')
const read = () => { try { if (!fs.existsSync(storePath)) return []; return JSON.parse(fs.readFileSync(storePath,'utf8')||'[]') } catch { return [] } }
const write = (rows:any[]) => { try { const dir=path.dirname(storePath); if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(storePath, JSON.stringify(rows,null,2),'utf8') } catch {} }

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const db = (prisma as any)
    if (db?.company?.findUnique) {
      const row = await db.company.findUnique({ where: { id: params.id } })
      if (!row) return NextResponse.json({ ok:false, error:'not-found' }, { status:404 })
      return NextResponse.json({ ok:true, data: row })
    }
  } catch {}
  const rows = read(); const row = rows.find((r:any)=> String(r.id)===String(params.id))
  if (!row) return NextResponse.json({ ok:false, error:'not-found' }, { status: 404 })
  return NextResponse.json({ ok:true, data: row })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(()=> ({}))
  try {
    const db = (prisma as any)
    if (db?.company?.update) {
      const updated = await db.company.update({ where: { id: params.id }, data: {
        name: body.name ?? undefined,
        domain: body.domain === undefined ? undefined : body.domain,
        notes: body.notes === undefined ? undefined : body.notes
      } })
      return NextResponse.json({ ok:true, data: updated })
    }
  } catch {}

  const rows = read()
  const idx = rows.findIndex((r:any)=> String(r.id) === String(params.id))
  if (idx < 0) return NextResponse.json({ ok:false, error:'not-found' }, { status: 404 })
  rows[idx] = { ...rows[idx], ...body, id: rows[idx].id }
  write(rows)
  return NextResponse.json({ ok:true, data: rows[idx] })
}


