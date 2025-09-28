import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, reason, templateId, source } = await request.json()
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      const ip = request.headers.get('x-forwarded-for') || ''

      await (prisma as any).unsubscribe.create({
        data: { email, reason, templateId, source, ip }
      })

      await prisma.$disconnect()
    } catch (e) {
      console.error('Unsubscribe DB error', e)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}


