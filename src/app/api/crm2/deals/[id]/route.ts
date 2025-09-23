import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const storePath = path.join(process.cwd(), 'data', 'crm2-deals.json')
const read = () => { try { if (!fs.existsSync(storePath)) return []; return JSON.parse(fs.readFileSync(storePath,'utf8')||'[]') } catch { return [] } }
const write = (rows:any[]) => { try { const dir=path.dirname(storePath); if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(storePath, JSON.stringify(rows,null,2),'utf8') } catch {} }

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json().catch(()=> ({}))
  const rows = read()
  const idx = rows.findIndex((r:any)=> String(r.id)===String(params.id))
  if (idx<0) return NextResponse.json({ ok:false, error:'not-found' }, { status:404 })
  rows[idx] = { ...rows[idx], ...b, id: rows[idx].id }
  write(rows)
  return NextResponse.json({ ok:true, data: rows[idx] })
}


