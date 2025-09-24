import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function toCSV(rows: any[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v:any) => {
    const s = v==null ? '' : String(v)
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"'
    return s
  }
  const out = [headers.join(',')]
  for (const r of rows) out.push(headers.map(h=> escape((r as any)[h])).join(','))
  return out.join('\n')
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const type = String(url.searchParams.get('type')||'leads')
  try {
    if (type==='leads') {
      const rows = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } })
      const csv = toCSV(rows)
      return new NextResponse(csv, { headers: { 'Content-Type':'text/csv; charset=utf-8', 'Content-Disposition':'attachment; filename="leads.csv"' } })
    }
    if (type==='activities') {
      const rows = await prisma.activity.findMany({ orderBy: { createdAt: 'desc' } })
      const csv = toCSV(rows)
      return new NextResponse(csv, { headers: { 'Content-Type':'text/csv; charset=utf-8', 'Content-Disposition':'attachment; filename="activities.csv"' } })
    }
    if (type==='renewals') {
      const now = new Date(); const end = new Date(now.getTime()+60*24*60*60*1000)
      const rows = await prisma.booking.findMany({ where:{ status:'confirmed', checkout:{ gte: now, lte:end } }, include:{ property:{ include:{ city:true } }, user:true } })
      const flat = rows.map(r=> ({ id:r.id, checkout:r.checkout, user:r.user?.email, property:r.property?.title, city:r.property?.city?.name }))
      const csv = toCSV(flat)
      return new NextResponse(csv, { headers: { 'Content-Type':'text/csv; charset=utf-8', 'Content-Disposition':'attachment; filename="renewals.csv"' } })
    }
    return NextResponse.json({ ok:false, error:'invalid-type' }, { status:400 })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'export-failed' }, { status:500 })
  }
}


