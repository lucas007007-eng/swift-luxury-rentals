import { NextRequest, NextResponse } from 'next/server'

const DEFAULTS = [
  { title: 'Thanks — we are on it', body: 'Hi {{name}},\n\nThanks for reaching out. We have received your message and will get back to you shortly.\n\nBest,\nPhantom Properties Support', variables: 'name' },
  { title: 'Booking confirmation info', body: 'Hi {{name}},\n\nYour booking {{bookingId}} is confirmed. Check-in is {{checkIn}} at {{property}}.\n\nBest,\nTeam', variables: 'name,bookingId,checkIn,property' },
]

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const rows = await (prisma as any).cannedReply.findMany({ orderBy: { updatedAt: 'desc' } })
    await prisma.$disconnect()
    if (rows?.length) return NextResponse.json(rows)
  } catch {}
  return NextResponse.json(DEFAULTS)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const row = await (prisma as any).cannedReply.create({ data: body })
    await prisma.$disconnect()
    return NextResponse.json(row)
  } catch (e) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}


