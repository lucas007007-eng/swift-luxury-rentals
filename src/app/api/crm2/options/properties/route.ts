import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const cityName = String(url.searchParams.get('city') || '').trim()

  // Try Prisma first
  try {
    const db = (prisma as any)
    if (db?.property?.findMany) {
      const where: any = {}
      if (cityName) {
        // join via City relationship if model exists
        const city = await db.city.findFirst({ where: { name: cityName } })
        if (city) where.cityId = city.id
        else where.city = { name: cityName }
      }
      const rows = await db.property.findMany({
        where,
        select: { id: true, extId: true, title: true },
        orderBy: { title: 'asc' }
      })
      const props = rows.map((p: any) => ({ id: p.id, extId: p.extId || p.id, title: p.title }))
      return NextResponse.json({ ok: true, data: props })
    }
  } catch {}

  // Fallback: derive from static data file
  try {
    const mod = await import('@/data/cityProperties')
    const cityProps = (mod as any).cityProperties || {}
    const list = cityName ? (cityProps[cityName] || []) : Object.values(cityProps).flat()
    const props = list.map((p: any) => ({ id: p.extId || p.id, extId: p.extId || p.id, title: p.title }))
    return NextResponse.json({ ok: true, data: props })
  } catch {}

  return NextResponse.json({ ok: true, data: [] })
}


