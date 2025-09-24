import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  // Try Prisma first
  try {
    const db = (prisma as any)
    if (db?.city?.findMany) {
      const rows = await db.city.findMany({
        include: { _count: { select: { properties: true } } },
        orderBy: { name: 'asc' }
      })
      const cities = rows
        .filter((c: any) => (c._count?.properties || 0) > 0)
        .map((c: any) => ({ id: c.id, name: c.name }))
      if (cities.length > 0) return NextResponse.json({ ok: true, data: cities })
    }
  } catch {}

  // Fallback: derive from static data if available
  try {
    const mod = await import('@/data/cityProperties')
    const cityProps = (mod as any).cityProperties || {}
    const cities = Object.keys(cityProps).map((name) => ({ id: name, name }))
    return NextResponse.json({ ok: true, data: cities })
  } catch {}

  return NextResponse.json({ ok: true, data: [] })
}


