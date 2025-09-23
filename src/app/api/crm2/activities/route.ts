import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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
  return NextResponse.json({ ok: true, data: readStore() })
}

export async function POST(req: Request) {
  const b = await req.json().catch(()=> ({}))
  const now = new Date()
  const row = {
    id: b.id || `act_${now.getTime()}`,
    leadId: String(b.leadId || '').trim(),
    type: String(b.type || 'note'),
    content: String(b.content || ''),
    dueAt: b.dueAt ? new Date(b.dueAt) : null,
    completedAt: null,
    createdAt: now
  }
  if (!row.leadId) return NextResponse.json({ ok:false, error:'leadId-required' }, { status: 400 })
  const rows = readStore()
  rows.unshift(row)
  writeStore(rows)
  return NextResponse.json({ ok:true, data: row })
}


