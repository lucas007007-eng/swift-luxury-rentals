import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const rows = await prisma.owner.findMany({ orderBy: { email: 'asc' } })
    return NextResponse.json({ ok:true, data: rows })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message||'failed' }, { status:500 })
  }
}

export async function POST(req: Request) {
  const b = await req.json().catch(()=> ({}))
  if (!b.email) return NextResponse.json({ ok:false, error:'email-required' }, { status:400 })
  try {
    const row = await prisma.owner.upsert({ where: { email: b.email }, create: { email: b.email, name: b.name||null }, update: { name: b.name||null } })
    return NextResponse.json({ ok:true, data: row })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message||'failed' }, { status:500 })
  }
}


