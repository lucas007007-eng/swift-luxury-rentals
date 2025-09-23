import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const storePath = path.join(process.cwd(), 'data', 'crm2-companies.json')
const read = () => { try { if (!fs.existsSync(storePath)) return []; return JSON.parse(fs.readFileSync(storePath,'utf8')||'[]') } catch { return [] } }
const write = (rows:any[]) => { try { const dir=path.dirname(storePath); if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(storePath, JSON.stringify(rows,null,2),'utf8') } catch {} }

export async function GET() { return NextResponse.json({ ok:true, data: read() }) }

export async function POST(req: Request) {
  const b = await req.json().catch(()=> ({}))
  const now = new Date()
  const row = { id: b.id || `co_${now.getTime()}`, name: String(b.name||'').trim(), domain: String(b.domain||'').trim(), notes: String(b.notes||'').trim(), createdAt: now }
  if (!row.name) return NextResponse.json({ ok:false, error:'name-required' }, { status: 400 })
  const rows = read(); rows.unshift(row); write(rows)
  return NextResponse.json({ ok:true, data: row })
}


